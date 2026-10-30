import { expect, test, type Page } from '@playwright/test';
import { initialAngle, projectDevice } from '../../src/utils/wireframeDevice';

type DrawnLine = {
  from: number[];
  to: number[];
  width: number;
  opacity: number;
};
declare global {
  interface Window {
    deviceProbe: {
      draws: number;
      pending: number;
      lines: DrawnLine[];
      motion: boolean[];
    };
  }
}

async function observeDrawing(page: Page) {
  await page.addInitScript(() => {
    const probe = {
      draws: 0,
      pending: 0,
      lines: [] as DrawnLine[],
      motion: [] as boolean[],
    };
    window.deviceProbe = probe;
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener(
      'change',
      (event) => probe.motion.push(event.matches)
    );
    const frames = new Set<number>();
    const request = window.requestAnimationFrame;
    const cancel = window.cancelAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      const id = request((time) => {
        frames.delete(id);
        probe.pending = frames.size;
        callback(time);
      });
      frames.add(id);
      probe.pending = frames.size;
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      frames.delete(id);
      probe.pending = frames.size;
      cancel(id);
    };
    const contexts = new WeakMap<
      CanvasRenderingContext2D,
      { from: number[]; to: number[] }
    >();
    const proto = CanvasRenderingContext2D.prototype;
    const { clearRect, moveTo, lineTo, stroke } = proto;
    proto.clearRect = function (...args) {
      if (this.canvas.closest('wireframe-device')) {
        probe.draws++;
        probe.lines = [];
        contexts.set(this, { from: [], to: [] });
      }
      return clearRect.apply(this, args);
    };
    proto.moveTo = function (x, y) {
      const frame = contexts.get(this);
      if (frame) frame.from = [x, y];
      return moveTo.call(this, x, y);
    };
    proto.lineTo = function (x, y) {
      const frame = contexts.get(this);
      if (frame) frame.to = [x, y];
      return lineTo.call(this, x, y);
    };
    proto.stroke = function (path?: Path2D) {
      const frame = contexts.get(this);
      if (frame)
        probe.lines.push({
          ...frame,
          width: this.lineWidth,
          opacity: this.globalAlpha,
        });
      return Reflect.apply(stroke, this, path ? [path] : []);
    };
  });
}

const draws = (page: Page) => page.evaluate(() => window.deviceProbe.draws);

for (const dpr of [1, 2]) {
  test.describe(`Canvas at DPR ${dpr}`, () => {
    test.use({ deviceScaleFactor: dpr });
    test('Canvas draws the shared initial geometry and respects the DPR cap', async ({
      page,
    }) => {
      await observeDrawing(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('./');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('wireframe-device')).toHaveAttribute(
        'data-enhanced',
        ''
      );
      await expect.poll(draws.bind(null, page)).toBeGreaterThan(0);
      const actual = await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          'wireframe-device canvas'
        )!;
        const { width, height } = canvas.getBoundingClientRect();
        return {
          lines: window.deviceProbe.lines,
          width,
          height,
          backing: [canvas.width, canvas.height],
          dpr: Math.min(devicePixelRatio, 2),
        };
      });
      const expected = projectDevice(initialAngle, actual.width, actual.height);
      expect(actual.lines).toHaveLength(expected.length);
      expect(actual.backing).toEqual([
        Math.round(actual.width * actual.dpr),
        Math.round(actual.height * actual.dpr),
      ]);
      const maximumError = Math.max(
        ...actual.lines.flatMap((line, i) => [
          Math.abs(line.from[0] - expected[i].from.x),
          Math.abs(line.from[1] - expected[i].from.y),
          Math.abs(line.to[0] - expected[i].to.x),
          Math.abs(line.to[1] - expected[i].to.y),
          Math.abs(line.width - expected[i].width),
          Math.abs(line.opacity - expected[i].opacity),
        ])
      );
      expect(maximumError).toBeLessThan(1e-6);
    });
  });
}

test('tap/click, live reduced-motion changes and paused resize leave no continuous work', async ({
  page,
  isMobile,
}) => {
  await observeDrawing(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const stage = page.locator('[data-device-stage]');
  await expect(stage).toHaveAttribute('aria-label', '回転を再生');
  if (isMobile) await stage.tap();
  else await stage.click();
  await expect(stage).toHaveAttribute('aria-label', '回転を停止');
  const playing = await draws(page);
  await expect.poll(() => draws(page)).toBeGreaterThan(playing);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Wait for the browser to deliver the first change; two same-frame overrides
  // may be coalesced into no change at all.
  await expect
    .poll(() => page.evaluate(() => window.deviceProbe.motion.at(-1)))
    .toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(stage).toHaveAttribute('aria-label', '回転を再生');
  await expect
    .poll(() => page.evaluate(() => window.deviceProbe.pending))
    .toBe(0);
  const stopped = await draws(page);
  await page.waitForTimeout(150);
  expect(await draws(page)).toBe(stopped);
  const viewport = page.viewportSize()!;
  // Above the container's maximum width, a 1px viewport change does not resize
  // the stage. Cross into the fluid layout to exercise its ResizeObserver.
  await page.setViewportSize({
    ...viewport,
    width: viewport.width > 980 ? 1024 : viewport.width - 20,
  });
  await expect.poll(() => draws(page)).toBeGreaterThan(stopped);
  const resized = await draws(page);
  await page.waitForTimeout(150);
  expect(await draws(page)).toBe(resized);
  expect(await page.evaluate(() => window.deviceProbe.pending)).toBe(0);
});

test('hidden-tab notifications and repeated navigation stop work without multiplying loops', async ({
  page,
}) => {
  await observeDrawing(page);
  await page.goto('./');
  await expect(page.getByRole('button', { name: '回転を停止' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect
    .poll(() => page.evaluate(() => window.deviceProbe.pending))
    .toBe(0);
  const hidden = await draws(page);
  await page.waitForTimeout(150);
  expect(await draws(page)).toBe(hidden);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => draws(page)).toBeGreaterThan(hidden);
  for (let i = 0; i < 3; i++) {
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Blog', exact: true })
      .click();
    await expect(page.locator('wireframe-device')).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => window.deviceProbe.pending))
      .toBe(0);
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Home', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: '回転を停止' })
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.deviceProbe.pending))
      .toBe(1);
  }
});

test('production search remains usable while the core rotates', async ({
  page,
}) => {
  await observeDrawing(page);
  await page.goto('./');
  await page.locator('pagefind-modal-trigger button').click();
  const modal = page.locator('pagefind-modal');
  await modal.locator('input').fill('WebMCP');
  await expect(modal.locator('a[href*="/blog/"]').first()).toBeVisible();
  const before = await draws(page);
  await expect.poll(() => draws(page)).toBeGreaterThan(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('pagefind-modal-trigger button')).toBeFocused();
  await page.locator('[data-device-stage]').click();
  await expect(page.locator('[data-device-stage]')).toHaveAttribute(
    'aria-label',
    '回転を再生'
  );
});

test('a throwing Canvas context keeps the SVG disabled and outside keyboard navigation', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => {
      throw new Error('Canvas unavailable');
    };
  });
  await page.goto('./');
  const stage = page.locator('[data-device-stage]');
  await expect(stage).toBeDisabled();
  await expect(stage.locator('svg')).toBeVisible();
  await expect(stage.locator('canvas')).toBeHidden();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await expect(stage).not.toBeFocused();
  }
});
