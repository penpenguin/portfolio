import { expect, test } from '@playwright/test';

const pages = [
  { path: './', heading: 'Enterprise systems, shipped end-to-end' },
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
});
