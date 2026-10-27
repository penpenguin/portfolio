// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mountWireframeDevice,
  type DeviceSession,
} from '../../../src/scripts/wireframeDevice';
import {
  initialAngle,
  projectDevice,
} from '../../../src/utils/wireframeDevice';

let frames: Map<number, FrameRequestCallback>;
let serial: number;
let intersect: (visible: boolean) => void;
let resize: () => void;
let motion: EventTarget & { matches: boolean };
let hidden: boolean;
let now: number;
let disconnects: ReturnType<typeof vi.fn>[];
let cleanups: (() => void)[];
const context = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
};

beforeEach(() => {
  frames = new Map();
  serial = 0;
  now = 0;
  hidden = false;
  disconnects = [];
  cleanups = [];
  motion = Object.assign(new EventTarget(), { matches: false });
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  vi.stubGlobal('matchMedia', () => motion);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++serial, callback);
    return serial;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: IntersectionObserverCallback) {
        disconnects.push(this.disconnect);
        intersect = (visible) =>
          callback(
            [{ isIntersecting: visible } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
          );
      }
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: () => void) {
        resize = callback;
        disconnects.push(this.disconnect);
      }
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D
  );
});

afterEach(() => {
  cleanups.forEach((cleanup) => cleanup());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function mount(session: DeviceSession = { angle: initialAngle }) {
  const root = document.createElement('div');
  root.innerHTML =
    '<div data-device-stage><svg></svg><canvas></canvas></div><button hidden></button>';
  document.body.append(root);
  vi.spyOn(
    root.querySelector('[data-device-stage]')!,
    'getBoundingClientRect'
  ).mockReturnValue({ width: 240, height: 180 } as DOMRect);
  const cleanup = mountWireframeDevice(root, session);
  cleanups.push(cleanup);
  return { root, session, cleanup, button: root.querySelector('button')! };
}

function tick(elapsed: number) {
  now += elapsed;
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(now));
}

describe('wireframe device lifecycle', () => {
  it('holds the displayed angle when paused between scheduled draws', () => {
    const { session, button } = mount();
    intersect(true);
    tick(0);
    tick(16);
    context.moveTo.mockClear();
    button.click();
    const expected = projectDevice(session.angle, 240, 180)[0].from;
    expect(context.moveTo.mock.calls[0]).toEqual([expected.x, expected.y]);
    expect(frames.size).toBe(0);
  });

  it('draws at about 30fps and stops scheduling work when paused', () => {
    const { session, button } = mount();
    intersect(true);
    tick(0);
    const firstDraws = context.clearRect.mock.calls.length;
    for (let i = 0; i < 60; i++) tick(1000 / 60);
    expect(session.angle).toBeCloseTo(initialAngle + Math.PI / 8);
    expect(
      context.clearRect.mock.calls.length - firstDraws
    ).toBeGreaterThanOrEqual(29);
    expect(
      context.clearRect.mock.calls.length - firstDraws
    ).toBeLessThanOrEqual(30);
    expect(frames.size).toBe(1);
    button.click();
    expect(button.textContent).toBe('再生');
    expect(frames.size).toBe(0);
    const pausedAngle = session.angle;
    tick(10000);
    expect(session.angle).toBe(pausedAngle);
    button.click();
    tick(0);
    tick(1000);
    expect(session.angle).toBeCloseTo(pausedAngle + Math.PI / 8);
  });

  it('suspends offscreen and in hidden tabs without advancing hidden time', () => {
    const { session } = mount();
    intersect(true);
    tick(0);
    tick(500);
    intersect(false);
    expect(frames.size).toBe(0);
    const angle = session.angle;
    const draws = context.clearRect.mock.calls.length;
    resize();
    tick(10000);
    expect(context.clearRect).toHaveBeenCalledTimes(draws);
    intersect(true);
    tick(0);
    expect(session.angle).toBe(angle);
    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(frames.size).toBe(0);
    tick(20000);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    tick(0);
    expect(session.angle).toBe(angle);
    expect(frames.size).toBe(1);
  });

  it('starts reduced motion still, permits explicit play, and observes preference changes', () => {
    motion.matches = true;
    const { button } = mount();
    intersect(true);
    expect(button.textContent).toBe('再生');
    expect(frames.size).toBe(0);
    button.click();
    expect(frames.size).toBe(1);
    motion.matches = false;
    motion.dispatchEvent(new Event('change'));
    motion.matches = true;
    motion.dispatchEvent(new Event('change'));
    expect(frames.size).toBe(0);
    expect(button.textContent).toBe('再生');
  });

  it('retains explicit pause and angle across page replacements and releases all work', () => {
    const session: DeviceSession = { angle: initialAngle };
    for (let i = 0; i < 3; i++) {
      const current = mount(session);
      intersect(true);
      if (i === 0) {
        tick(0);
        tick(1000);
        current.button.click();
      }
      expect(current.button.textContent).toBe('再生');
      const angle = session.angle;
      current.cleanup();
      current.root.remove();
      expect(frames.size).toBe(0);
      expect(
        disconnects.every((disconnect) => disconnect.mock.calls.length > 0)
      ).toBe(true);
      current.button.click();
      document.dispatchEvent(new Event('visibilitychange'));
      intersect(true);
      resize();
      tick(1000);
      expect(session.angle).toBe(angle);
      expect(frames.size).toBe(0);
    }
  });

  it('respects reduced motion enabled while away, but keeps an explicit reduced-motion play choice', () => {
    const session: DeviceSession = { angle: initialAngle };
    const first = mount(session);
    intersect(true);
    expect(frames.size).toBe(1);
    first.cleanup();
    first.root.remove();
    motion.matches = true;
    const returned = mount(session);
    intersect(true);
    expect(returned.button.textContent).toBe('再生');
    expect(frames.size).toBe(0);
    returned.button.click();
    returned.cleanup();
    returned.root.remove();
    const explicitPlay = mount(session);
    intersect(true);
    expect(explicitPlay.button.textContent).toBe('停止');
    expect(frames.size).toBe(1);
  });

  it('handles browser pagehide/pageshow without overriding manual pause', () => {
    const { button } = mount();
    intersect(true);
    window.dispatchEvent(new Event('pagehide'));
    expect(frames.size).toBe(0);
    window.dispatchEvent(new Event('pageshow'));
    expect(frames.size).toBe(1);
    button.click();
    window.dispatchEvent(new Event('pagehide'));
    window.dispatchEvent(new Event('pageshow'));
    expect(frames.size).toBe(0);
  });

  it.each(['null', 'throw'])(
    'keeps the static fallback when Canvas returns %s',
    (failure) => {
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
        () => {
          if (failure === 'throw') throw new Error('Canvas unavailable');
          return null;
        }
      );
      const { root, button } = mount();
      expect(root.hasAttribute('data-enhanced')).toBe(false);
      expect(button.hidden).toBe(true);
      expect(root.querySelector('svg')).not.toBeNull();
      expect(frames.size).toBe(0);
    }
  );
});
