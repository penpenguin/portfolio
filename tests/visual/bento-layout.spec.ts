import { expect, test } from '@playwright/test';

const pages = [
  { path: './', heading: 'About' },
  { path: 'projects/', heading: 'Built Systems' },
  { path: 'blog/', heading: 'Blog' },
];

test.describe('Bento layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://penpenguin.github.io/suiren-aquarium/', (route) =>
      route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body: '<!doctype html><html lang="ja"><body>水槽の読み込み確認</body></html>',
      })
    );
  });

  for (const pageInfo of pages) {
    test(`${pageInfo.path} has stable responsive framing`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await expect(
        page.getByRole('heading', { name: pageInfo.heading, level: 1 }).first()
      ).toBeVisible();

      const layout = await page.evaluate(() => {
        const nav = document.querySelector('.navbar-content');
        const firstPanel = document.querySelector(
          '.bento-hero, .bento-panel, .card-glass'
        );
        const navRect = nav?.getBoundingClientRect();
        const panelRect = firstPanel?.getBoundingClientRect();

        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          navBottom: navRect?.bottom ?? 0,
          firstPanelTop: panelRect?.top ?? 0,
          panelCount: document.querySelectorAll(
            '.bento-hero, .bento-panel, .card-glass'
          ).length,
        };
      });

      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
      expect(layout.panelCount).toBeGreaterThan(0);
      expect(layout.firstPanelTop).toBeGreaterThanOrEqual(layout.navBottom - 1);
    });
  }

  test('mobile key bento cards keep readable width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const path of ['./', 'projects/']) {
      await page.goto(path);
      const minCardWidth = await page.evaluate(() => {
        const cards = Array.from(
          document.querySelectorAll('.bento-card, .project-card')
        );

        return Math.min(
          ...cards.map((card) => card.getBoundingClientRect().width)
        );
      });

      expect(minCardWidth).toBeGreaterThanOrEqual(320);
    }
  });

  test('home keeps the aquarium beside About with the original desktop proportions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('./');

    const card = page.locator('.bento-card--aquarium');
    const iframe = card.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('title', '水縁 — SUIREN');
    await expect(page.locator('.bento-card')).toHaveCount(4);
    await expect(
      page.locator('.bento-card--metric, .bento-card--playground')
    ).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const intro = document.querySelector('.bento-card--intro')!;
      const aquarium = document.querySelector('.bento-card--aquarium')!;
      const iframe = aquarium.querySelector('iframe')!;
      const grid = document.querySelector('.home-overview-grid')!;
      return {
        intro: intro.getBoundingClientRect().toJSON(),
        aquarium: aquarium.getBoundingClientRect().toJSON(),
        iframe: iframe.getBoundingClientRect().toJSON(),
        gap: parseFloat(getComputedStyle(grid).columnGap),
      };
    });

    expect(layout.aquarium.height).toBeGreaterThan(150);
    expect(
      Math.abs(layout.intro.height - layout.aquarium.height)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.intro.top - layout.aquarium.top)
    ).toBeLessThanOrEqual(1);
    expect(layout.aquarium.left).toBeGreaterThan(layout.intro.right);
    expect(
      Math.abs(
        layout.intro.width - (3 * layout.aquarium.width + 2 * layout.gap)
      )
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.iframe.width - (layout.aquarium.width - 2))
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.iframe.height - (layout.aquarium.height - 2))
    ).toBeLessThanOrEqual(1);
  });

  test('home stacks all four cards with a 240px aquarium on smaller screens', async ({
    page,
  }) => {
    for (const width of [980, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('./');
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        cards: Array.from(document.querySelectorAll('.bento-card')).map(
          (card) => ({
            className: card.className,
            ...card.getBoundingClientRect().toJSON(),
          })
        ),
      }));

      expect(layout.cards).toHaveLength(4);
      for (const [index, name] of [
        'intro',
        'aquarium',
        'project',
        'blog',
      ].entries()) {
        const card = layout.cards[index];
        expect(card.className).toContain(`bento-card--${name}`);
        expect(
          Math.abs(card.width - layout.cards[0].width)
        ).toBeLessThanOrEqual(1);
        expect(Math.abs(card.left - layout.cards[0].left)).toBeLessThanOrEqual(
          1
        );
        if (index > 0)
          expect(card.top).toBeGreaterThan(layout.cards[index - 1].bottom);
      }
      expect(layout.cards[1].height).toBe(240);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    }
  });

  test('home reloads the embedded app after navigating away and back', async ({
    page,
  }) => {
    await page.goto('./');
    const iframe = page.frameLocator('.bento-card--aquarium iframe');
    await expect(iframe.getByText('水槽の読み込み確認')).toBeVisible();

    await page
      .locator('.navbar')
      .getByRole('link', { name: 'Projects', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Built Systems', level: 1 })
    ).toBeVisible();
    await expect(page.locator('.bento-card--aquarium')).toHaveCount(0);
    await page
      .locator('.navbar')
      .getByRole('link', { name: 'Home', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'About', level: 1 })
    ).toBeVisible();
    await expect(iframe.getByText('水槽の読み込み確認')).toBeVisible();
  });
});
