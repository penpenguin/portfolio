import { expect, test } from '@playwright/test';

const pages = [
  { path: './', heading: 'About' },
  { path: 'projects/', heading: 'Built Systems' },
  { path: 'blog/', heading: 'Blog' },
  { path: 'contact/', heading: 'Contact' },
];

test.describe('Bento layout', () => {
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

    for (const path of ['./', 'projects/', 'contact/']) {
      await page.goto(path);
      const minCardWidth = await page.evaluate(() => {
        const cards = Array.from(
          document.querySelectorAll(
            '.bento-card, .project-card, .contact-info, .availability'
          )
        );

        return Math.min(
          ...cards.map((card) => card.getBoundingClientRect().width)
        );
      });

      expect(minCardWidth).toBeGreaterThanOrEqual(320);
    }
  });

  test('home top cards share the same row height on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('./');

    const heights = await page.evaluate(() => {
      const intro = document.querySelector('.bento-card--intro');
      const metric = document.querySelector('.bento-card--metric');

      return {
        intro: intro?.getBoundingClientRect().height ?? 0,
        metric: metric?.getBoundingClientRect().height ?? 0,
      };
    });

    expect(Math.abs(heights.intro - heights.metric)).toBeLessThanOrEqual(1);
  });

  test('home Meaningless card shows an animated window scene by default', async ({
    page,
  }) => {
    await page.goto('./');

    const card = page.locator('.bento-card--playground');
    await expect(card).toHaveAttribute(
      'aria-label',
      'Meaningless window scene'
    );
    await expect(
      card.getByRole('heading', { name: 'Meaningless' })
    ).toHaveCount(0);
    await expect(card.locator('.window-scene')).toBeVisible();
    await expect(card.locator('.window-scene__image')).toBeVisible();
    await expect(card.locator('.window-scene__road-lights')).toBeVisible();
    await expect(card.locator('.window-scene__tail-lamps')).toBeVisible();
    await expect(
      card.locator('.window-scene__tail-lamps-track--near')
    ).toBeVisible();
    await expect(
      card.locator('.window-scene__tail-lamps-track--bend')
    ).toBeVisible();
    await expect(
      card.locator('.window-scene__tail-lamps-track--far')
    ).toBeVisible();
    await expect(card.locator('.window-scene__aircraft-beacons')).toBeVisible();
    await expect(card.locator('.window-scene__tree-line')).toBeVisible();
    await expect(card.getByRole('link', { name: '別タブで開く' })).toHaveCount(
      0
    );
    await expect(card.locator('.playground-actions')).toHaveCount(0);
  });
});
