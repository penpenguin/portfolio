import { expect, test } from '@playwright/test';

const tone = 'grayscale(0.92) contrast(0.94) brightness(0.98)';

test('project lists share Blog framing and tone without changing card heights', async ({
  page,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('projects/');
    const frames = page.locator('.project-image');
    const featured = frames.first();
    await expect(featured).toHaveCSS('height', width > 768 ? '360px' : '220px');
    await expect(frames.nth(1)).toHaveCSS('height', '220px');
    const front = featured.locator('.blog-thumbnail__image');
    const back = featured.locator('.blog-thumbnail__backdrop');
    await expect(front).toHaveCSS('filter', tone);
    await expect(front).toHaveCSS('object-fit', 'contain');
    await expect(back).toHaveCSS('filter', `${tone} blur(22px)`);
    await expect(back).toHaveAttribute('aria-hidden', 'true');
    await expect(featured).toHaveCSS('padding', '0px');
    for (const image of await featured.locator('img').all())
      await expect(image).toHaveAttribute('loading', 'eager');
    for (const image of await frames.nth(1).locator('img').all())
      await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(
      page.locator('.project-image [data-pagefind-meta]')
    ).toHaveCount(0);
    const missing = page
      .locator('.project-card')
      .filter({ has: page.getByRole('heading', { name: /PetaTas/ }) });
    await expect(missing.locator('.project-image')).toHaveText('NoImage');
    await expect(missing.locator('.project-image')).toHaveCSS(
      'height',
      '220px'
    );
    await expect(missing.getByRole('heading')).toHaveCount(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width);
  }
});

test('details reserve their ratio, retain image metadata, and keep image-less details single-column', async ({
  page,
}) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('projects/card-lighting-demo/');
    const frame = page.locator('.project-image');
    const bounds = await frame.boundingBox();
    expect(bounds!.width / bounds!.height).toBeCloseTo(1.6, 1);
    await expect(frame.locator('.blog-thumbnail__image')).toHaveAttribute(
      'data-pagefind-meta',
      'image[src], image_alt[alt]'
    );
    await expect(frame.locator('[data-pagefind-meta]')).toHaveCount(1);
    for (const image of await frame.locator('img').all())
      await expect(image).toHaveAttribute('loading', 'eager');
    await frame.evaluate((el) => el.setAttribute('data-tone', 'original'));
    await expect(frame.locator('.blog-thumbnail__image')).toHaveCSS(
      'filter',
      'grayscale(0) contrast(1) brightness(1)'
    );
    await expect(frame.locator('.blog-thumbnail__backdrop')).toHaveCSS(
      'filter',
      'grayscale(0) contrast(1) brightness(1) blur(22px)'
    );
    await page.goto('projects/petatas/');
    await expect(page.locator('blog-thumbnail')).toHaveCount(0);
    await expect(page.locator('.project-hero--single')).toBeVisible();
    expect(
      await page
        .locator('.project-hero--single')
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
        )
    ).toBe(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width);
  }
});

test('failed detail images keep their frame and recover after Astro navigation', async ({
  page,
}) => {
  await page.route('**/assets/projects/card-lighting-demo.webp', (route) =>
    route.abort()
  );
  await page.goto('projects/card-lighting-demo/');
  const frame = page.locator('.project-detail .project-image');
  await expect(frame.locator('.blog-thumbnail__fallback')).toBeVisible();
  await expect(frame.locator('.blog-thumbnail__image')).toBeHidden();
  await expect(frame.locator('.blog-thumbnail__backdrop')).toBeHidden();
  const before = await frame.boundingBox();
  await page.unroute('**/assets/projects/card-lighting-demo.webp');
  await page.getByRole('link', { name: '← プロジェクト一覧に戻る' }).click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await page
    .locator('.project-card')
    .first()
    .getByRole('link', { name: '詳細を見る' })
    .click();
  await expect(page).toHaveURL(/\/projects\/card-lighting-demo\/?$/);
  await expect(frame.locator('.blog-thumbnail__image')).toBeVisible();
  await expect(frame.locator('.blog-thumbnail__fallback')).toBeHidden();
  expect((await frame.boundingBox())!.height).toBe(before!.height);
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Blog', exact: true })
    .click();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(page.locator('.blog-thumbnail__image').first()).toHaveCSS(
    'filter',
    tone
  );
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects\/?$/);
  await expect(page.locator('.blog-thumbnail__image').first()).toBeVisible();
});

test.describe('project images without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('renders both layers and NoImage on the server', async ({ page }) => {
    await page.goto('projects/');
    await expect(page.locator('.blog-thumbnail__image').first()).toBeVisible();
    await expect(page.locator('.post-visual--fallback')).toHaveText('NoImage');
    await page.goto('projects/card-lighting-demo/');
    await expect(page.locator('.blog-thumbnail__image')).toBeVisible();
    await expect(page.locator('.blog-thumbnail__backdrop')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });
});
