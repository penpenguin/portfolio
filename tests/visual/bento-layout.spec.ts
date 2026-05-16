import { expect, test } from '@playwright/test';

const pages = [
  { path: './', heading: "Hello, I'm a Programmer" },
  { path: 'about/', heading: 'About Me' },
  { path: 'projects/', heading: 'My Projects' },
  { path: 'blog/', heading: 'Blog' },
  { path: 'career/', heading: 'Career' },
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
});
