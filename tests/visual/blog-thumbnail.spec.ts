import { expect, test } from '@playwright/test';

test('original tone keeps both layers neutral and featured images load eagerly', async ({
  page,
}) => {
  for (const path of ['blog/', 'blog/2026/10/']) {
    await page.goto(path);
    const featured = page.locator('.post-card--featured blog-thumbnail');
    for (const image of await featured.locator('img').all()) {
      await expect(image).toHaveAttribute('loading', 'eager');
    }
    for (const image of await page
      .locator('.post-card:not(.post-card--featured) blog-thumbnail img')
      .all()) {
      await expect(image).toHaveAttribute('loading', 'lazy');
    }
    await featured.evaluate((el) => el.setAttribute('data-tone', 'original'));
    await expect(featured.locator('.blog-thumbnail__image')).toHaveCSS(
      'filter',
      'grayscale(0) contrast(1) brightness(1)'
    );
    await expect(featured.locator('.blog-thumbnail__backdrop')).toHaveCSS(
      'filter',
      'grayscale(0) contrast(1) brightness(1) blur(22px)'
    );
  }
});

test('passive cards stay still while article links remain accessible', async ({
  page,
}) => {
  await page.goto('blog/');
  const card = page.locator('.post-card').first();
  const surface = () =>
    card.evaluate((el) => {
      const style = getComputedStyle(el);
      return [style.backgroundColor, style.borderColor];
    });
  const before = await surface();
  await card.locator('.post-description').hover();
  expect(await surface()).toEqual(before);
  const link = card.locator('.read-more');
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect((await link.boundingBox())!.width).toBeLessThan(
    (await card.boundingBox())!.width / 2
  );
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(link.locator('.read-more__label')).toHaveCSS(
    'border-bottom-width',
    '1px'
  );
  await expect(link.locator('.read-more__label')).toHaveCSS(
    'border-bottom-style',
    'solid'
  );
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).not.toHaveCSS('outline-style', 'none');
  await link.press('Enter');
  await expect(page).toHaveURL(/\/blog\/\d{4}\/\d{2}\/[^/]+\/?$/);
});

test('foreground stays sharp while the expanded backdrop fills different aspect ratios', async ({
  page,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('blog/');
    const frame = page.locator('blog-thumbnail').first();
    const original = await frame.boundingBox();
    for (const [name, w, h] of [
      ['portrait', 120, 240],
      ['panorama', 600, 100],
      ['matching', original!.width, original!.height - 1],
      ['transparent', 200, 200],
    ] as const) {
      await test.step(`${width}px ${name}`, async () => {
        const rect =
          name === 'transparent'
            ? '<circle cx="100" cy="100" r="55" fill="#d56a52"/>'
            : `<path fill="#d56a52" d="M0 0h${w}v${h}H0z"/><path fill="#386d9c" d="M0 0h${w / 2}v${h}H0z"/>`;
        const source = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect}</svg>`)}`;
        await frame.evaluate((element, src) => {
          const replacement = element.cloneNode(true) as HTMLElement;
          replacement.querySelectorAll('img').forEach((image) => {
            image.src = src;
          });
          element.replaceWith(replacement);
        }, source);
        const front = frame.locator('.blog-thumbnail__image');
        const back = frame.locator('.blog-thumbnail__backdrop');
        await expect
          .poll(() =>
            front.evaluate((el) => (el as HTMLImageElement).naturalWidth)
          )
          .toBeGreaterThan(0);
        await expect
          .poll(() =>
            back.evaluate((el) => (el as HTMLImageElement).naturalWidth)
          )
          .toBeGreaterThan(0);
        await expect(front).toHaveCSS('object-fit', 'contain');
        await expect(front).toHaveCSS(
          'filter',
          'grayscale(0.92) contrast(0.94) brightness(0.98)'
        );
        await expect(back).toHaveCSS('object-fit', 'cover');
        await expect(back).toHaveCSS(
          'filter',
          'grayscale(0.92) contrast(0.94) brightness(0.98) blur(22px)'
        );
        await expect(back).toHaveAttribute('aria-hidden', 'true');
        await expect(back).toHaveAttribute('alt', '');
        await expect(frame).toHaveCSS('padding', '0px');
        await expect(frame).toHaveCSS('overflow', 'hidden');
        await expect(frame).toHaveCSS('isolation', 'isolate');
        const bounds = await frame.boundingBox();
        const backdrop = await back.boundingBox();
        expect(bounds!.height).toBe(original!.height);
        expect(backdrop!.x).toBeLessThan(bounds!.x - 24);
        expect(backdrop!.y).toBeLessThan(bounds!.y - 24);
        expect(backdrop!.width).toBeGreaterThan(bounds!.width + 48);
        expect(backdrop!.height).toBeGreaterThan(bounds!.height + 48);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(width);
      });
    }
  }
});

test('NO IMAGE is static, decorative and keeps the same frame heights in both lists', async ({
  page,
}) => {
  for (const path of ['blog/', 'blog/2025/11/']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const fallback = page.locator('.post-visual--fallback').first();
    await fallback.scrollIntoViewIfNeeded();
    await expect(fallback).toHaveText('NO IMAGE');
    await expect(fallback.locator('.blog-thumbnail__fallback')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
    await expect(fallback.locator('img')).toHaveCount(0);
    const height = await fallback.evaluate((el) => ({
      expected: parseFloat(
        getComputedStyle(el).getPropertyValue('--thumbnail-height')
      ),
      actual: el.getBoundingClientRect().height,
    }));
    expect(height.actual).toBe(height.expected);
    const first = await fallback.screenshot();
    await page.waitForTimeout(150);
    expect(await fallback.screenshot()).toEqual(first);
  }
});

test('failed images hide both layers without changing height and recover on a later visit', async ({
  page,
}) => {
  await page.route('**/assets/blog/**', (route) => route.abort());
  await page.goto('blog/');
  const frame = page.locator('blog-thumbnail').first();
  await expect(frame.locator('.blog-thumbnail__fallback')).toBeVisible();
  await expect(frame.locator('.blog-thumbnail__image')).toBeHidden();
  await expect(frame.locator('.blog-thumbnail__backdrop')).toBeHidden();
  const failedHeight = (await frame.boundingBox())!.height;
  await page.unroute('**/assets/blog/**');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Home', exact: true })
    .click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Blog', exact: true })
    .click();
  await expect(frame.locator('.blog-thumbnail__image')).toBeVisible();
  await expect(frame.locator('.blog-thumbnail__fallback')).toBeHidden();
  expect((await frame.boundingBox())!.height).toBe(failedHeight);
  await page
    .locator('.archive-panel')
    .getByRole('link', { name: '2026年10月', exact: true })
    .click();
  await expect(frame.locator('.blog-thumbnail__image')).toBeVisible();
  await expect(frame.locator('.blog-thumbnail__backdrop')).toHaveCSS(
    'filter',
    'grayscale(0.92) contrast(0.94) brightness(0.98) blur(22px)'
  );
});

test.describe('thumbnails without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('renders original images and missing-image fallbacks on the server', async ({
    page,
  }) => {
    await page.goto('blog/');
    await expect(page.locator('.blog-thumbnail__image').first()).toBeVisible();
    const missing = page.locator('.post-visual--fallback').first();
    await expect(missing).toHaveText('NO IMAGE');
  });
});
