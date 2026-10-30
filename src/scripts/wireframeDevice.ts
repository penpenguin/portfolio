import {
  advanceAngle,
  deviceDescription,
  initialAngle,
  projectDevice,
} from '../utils/wireframeDevice';

export type DeviceSession = {
  angle: number;
  paused?: boolean;
  reducedMotion?: boolean;
};
const session: DeviceSession = { angle: initialAngle };

export function mountWireframeDevice(
  root: HTMLElement,
  state: DeviceSession
): () => void {
  const stage = root.querySelector<HTMLButtonElement>('[data-device-stage]');
  const canvas = root.querySelector('canvas');
  if (!stage || !canvas) return () => {};
  let context: CanvasRenderingContext2D | null;
  try {
    context = canvas.getContext('2d');
  } catch {
    return () => {};
  }
  if (!context) return () => {};
  const ctx = context;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  state.paused ??= media.matches;
  if (media.matches && state.reducedMotion !== true) state.paused = true;
  state.reducedMotion = media.matches;
  let active = true;
  let visible = false;
  let pageHidden = false;
  let frame: number | undefined;
  let lastTime: number | undefined;
  let lastDraw: number | undefined;
  let width = 0;
  let height = 0;
  const interval = 1000 / 30;

  const canDraw = () => active && visible && !document.hidden && !pageHidden;
  const draw = () => {
    if (!canDraw()) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#5B5A60';
    for (const line of projectDevice(state.angle, width, height)) {
      ctx.lineWidth = line.width;
      ctx.globalAlpha = line.opacity;
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  const stop = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    lastTime = undefined;
    lastDraw = undefined;
  };
  const animate = (time: number) => {
    frame = undefined;
    if (!canDraw() || state.paused) return;
    if (lastTime !== undefined)
      state.angle = advanceAngle(state.angle, time - lastTime);
    lastTime = time;
    if (lastDraw === undefined || time - lastDraw >= interval - 0.01) {
      draw();
      lastDraw =
        lastDraw === undefined
          ? time
          : lastDraw + interval * Math.round((time - lastDraw) / interval);
    }
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    if (!active) return;
    stage.setAttribute(
      'aria-label',
      state.paused ? '回転を再生' : '回転を停止'
    );
    if (canDraw() && !state.paused) {
      if (frame === undefined) frame = requestAnimationFrame(animate);
    } else stop();
  };
  const resize = () => {
    if (!active) return;
    ({ width, height } = stage.getBoundingClientRect());
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  };
  const toggle = () => {
    state.paused = !state.paused;
    // Hold exactly the saved angle, including a click between 30fps draws.
    if (state.paused) draw();
    sync();
  };
  const visibility = () => {
    draw();
    sync();
  };
  const preference = () => {
    state.reducedMotion = media.matches;
    if (media.matches) {
      state.paused = true;
      draw();
    }
    sync();
  };
  const hide = () => {
    pageHidden = true;
    sync();
  };
  const show = () => {
    pageHidden = false;
    draw();
    sync();
  };
  const intersection = new IntersectionObserver((entries) => {
    if (!active) return;
    visible = entries.some((entry) => entry.isIntersecting);
    draw();
    sync();
  });
  const size = new ResizeObserver(resize);
  stage.addEventListener('click', toggle);
  document.addEventListener('visibilitychange', visibility);
  media.addEventListener('change', preference);
  window.addEventListener('pagehide', hide);
  window.addEventListener('pageshow', show);
  root.setAttribute('data-enhanced', '');
  stage.disabled = false;
  stage.setAttribute(
    'aria-description',
    '線画の制御杖。クリック、Enter、Spaceで回転を停止・再開できます。'
  );
  resize();
  sync();
  intersection.observe(root);
  size.observe(stage);

  return () => {
    if (!active) return;
    active = false;
    stop();
    intersection.disconnect();
    size.disconnect();
    stage.removeEventListener('click', toggle);
    document.removeEventListener('visibilitychange', visibility);
    media.removeEventListener('change', preference);
    window.removeEventListener('pagehide', hide);
    window.removeEventListener('pageshow', show);
    root.removeAttribute('data-enhanced');
    stage.disabled = true;
    stage.removeAttribute('aria-description');
    stage.setAttribute('aria-label', deviceDescription);
  };
}

if (
  typeof customElements !== 'undefined' &&
  !customElements.get('wireframe-device')
) {
  customElements.define(
    'wireframe-device',
    class extends HTMLElement {
      private cleanup?: () => void;
      connectedCallback() {
        this.cleanup?.();
        this.cleanup = mountWireframeDevice(this, session);
      }
      disconnectedCallback() {
        this.cleanup?.();
      }
    }
  );
}
