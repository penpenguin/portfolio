import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 980, 1024, 1440]) {
  test(`sticky shell and equal introduction heights at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const heights: number[] = [];
    for (const path of ['./', 'projects/', 'blog/']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator('.bento-hero').first();
      heights.push((await hero.boundingBox())!.height);
      const navbar = page.locator('.navbar');
      await expect(navbar).toHaveCSS('position', 'sticky');
      await expect(navbar).toHaveCSS('background-color', 'rgb(237, 237, 237)');
      expect((await navbar.boundingBox())!.y).toBe(0);
      expect((await hero.boundingBox())!.y).toBeGreaterThan(
        (await navbar.boundingBox())!.height
      );
      const logo = await page.locator('.logo').boundingBox();
      expect(
        Math.abs(logo!.x - (await hero.boundingBox())!.x)
      ).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
      await page.evaluate(() =>
        window.scrollTo({ top: 350, behavior: 'instant' })
      );
      expect((await navbar.boundingBox())!.y).toBe(0);
    }
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Home', exact: true })
      .click();
    await expect(page).toHaveURL(/\/portfolio\/?$/);
    expect((await page.locator('.navbar').boundingBox())!.y).toBe(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/blog\/?$/);
    expect((await page.locator('.navbar').boundingBox())!.y).toBe(0);
  });
}

test('Home uses available height without forcing scroll and keeps natural overflow', async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [1920, 1080],
    [1440, 1400],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight)
    ).toBeLessThanOrEqual(height + 1);
    const footer = await page.locator('.footer').boundingBox();
    expect(footer!.height).toBeGreaterThanOrEqual(65);
    expect(footer!.height).toBeLessThanOrEqual(75);
    expect(footer!.y + footer!.height).toBeCloseTo(height, 0);
  }
  for (const [width, height] of [
    [1440, 500],
    [320, 600],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight)
    ).toBeGreaterThan(height);
    await page.locator('.footer').scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('link', { name: 'WebMCP enabled' })
    ).toBeInViewport();
  }
});

test('fallback fonts, zoom and long descriptions expand heroes without clipping', async ({
  page,
}) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.setViewportSize({ width: 720, height: 1000 });
  for (const path of ['./', 'projects/', 'blog/']) {
    await page.goto(path);
    await page.evaluate(() => {
      document.body.style.zoom = '2';
      const hero = document.querySelector('.bento-hero')!;
      hero.querySelector('p')!.textContent =
        '長い説明文でも内容を省略せず、必要な高さに自然に広がることを確認します。'.repeat(
          8
        );
    });
    const hero = page.locator('.bento-hero').first();
    expect((await hero.boundingBox())!.height).toBeGreaterThan(480);
    expect(
      await hero.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(720);
  }
});
