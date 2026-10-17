import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Reuse the rendered component's scoped markup to simulate future archive growth.
const setPublishedMonthCount = async (page: Page, count: number) => {
  await page.locator('blog-archive').evaluate((element, count) => {
    const replacement = element.cloneNode(true) as HTMLElement;
    const template = replacement.querySelector('details')!;
    const linkTemplate = replacement.querySelector('a')!;
    const emptyTemplate = replacement.querySelector('.month-empty')!;
    const select = replacement.querySelector('select')!;
    const yearCount = Math.ceil(count / 12);

    replacement.querySelectorAll('details').forEach((group) => group.remove());
    select.replaceChildren();
    for (let offset = yearCount - 1; offset >= 0; offset--) {
      const year = String(2020 + offset);
      const group = template.cloneNode(true) as HTMLDetailsElement;
      group.dataset.year = year;
      group.querySelector('summary')!.textContent = `${year}年`;
      group
        .querySelector('ul')!
        .setAttribute('aria-label', `${year}年の月別アーカイブ`);
      group.querySelectorAll('li').forEach((cell, index) => {
        const month = index + 1;
        if (offset * 12 + index < count) {
          const link = linkTemplate.cloneNode(true) as HTMLAnchorElement;
          link.href = `/portfolio/blog/${year}/${String(month).padStart(2, '0')}`;
          link.textContent = `${month}月`;
          link.setAttribute('aria-label', `${year}年${month}月`);
          link.removeAttribute('aria-current');
          cell.replaceChildren(link);
        } else {
          const empty = emptyTemplate.cloneNode(true);
          empty.firstChild!.textContent = `${month}月`;
          cell.replaceChildren(empty);
        }
      });
      select.add(new Option(`${year}年`, year));
      replacement.append(group);
    }
    element.replaceWith(replacement);
    replacement
      .closest('aside')!
      .querySelector('.archive-summary')!.textContent = `全${count}か月`;
  }, count);
};

test('archive does not stretch the featured row at tablet width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.goto('blog/');

  const archive = await page.locator('.archive-panel').boundingBox();
  const featured = await page.locator('.post-card--featured').boundingBox();

  expect(archive).not.toBeNull();
  expect(featured).not.toBeNull();
  expect(archive!.height).toBeLessThanOrEqual(featured!.height + 1);
});

for (const width of [390, 820, 1024, 1440]) {
  test(`archive remains a three by four grid as months grow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['blog/', 'blog/2025/11/']) {
      await page.goto(path);
      const archive = page.locator('.archive-panel');
      await expect(archive.getByRole('combobox')).toBeVisible();
      const original = await archive.boundingBox();

      for (const count of [1, 12, 36, 120]) {
        await test.step(`${path} with ${count} published months`, async () => {
          await setPublishedMonthCount(page, count);
          await expect(archive.locator('a')).toHaveCount(count);
          await expect(archive.locator('select option')).toHaveCount(
            Math.ceil(count / 12)
          );
          await expect(archive.locator('.month-cell:visible')).toHaveCount(12);
          await expect(archive.locator('.archive-summary')).toHaveText(
            `全${count}か月`
          );

          const layout = await page.evaluate(() => {
            const panel = document.querySelector('.archive-panel')!;
            const grid = panel.querySelector(
              'details:not([hidden]) .month-list'
            )!;
            const cells = [...grid.children].map((cell) =>
              cell.getBoundingClientRect()
            );
            return {
              width: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
              height: panel.getBoundingClientRect().height,
              featuredHeight: document
                .querySelector('.post-card--featured')!
                .getBoundingClientRect().height,
              columns: new Set(cells.map((cell) => cell.left)).size,
              rows: new Set(cells.map((cell) => cell.top)).size,
              minWidth: Math.min(...cells.map((cell) => cell.width)),
              minHeight: Math.min(...cells.map((cell) => cell.height)),
              gap: getComputedStyle(grid).gap,
            };
          });
          expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
          expect(layout.height).toBeCloseTo(original!.height, 0);
          expect(layout.columns).toBe(3);
          expect(layout.rows).toBe(4);
          expect(layout.minWidth).toBeGreaterThanOrEqual(44);
          expect(layout.minHeight).toBeGreaterThanOrEqual(44);
          expect(layout.gap).toBe('8px');
          if (width > 768) {
            expect(layout.height).toBeLessThanOrEqual(
              layout.featuredHeight + 1
            );
          }
        });
      }
    }
  });
}

test('supports keyboard year selection and skips months without posts', async ({
  page,
}) => {
  await page.goto('blog/');
  const archive = page.locator('.archive-panel');
  const year = archive.getByRole('combobox', { name: '年', exact: true });
  await year.focus();
  await year.press('ArrowDown');
  await expect(year).toHaveValue('2025');
  await year.press('Tab');
  const november = archive.getByRole('link', {
    name: '2025年11月',
    exact: true,
  });
  await expect(november).toBeFocused();
  await expect(november).toHaveCSS('outline-style', 'solid');
  await november.press('Enter');
  await expect(page).toHaveURL(/\/blog\/2025\/11\/?$/);
});

test('selects years locally and preserves month navigation through ClientRouter and back', async ({
  page,
}) => {
  await page.goto('./');
  await page.evaluate(() =>
    Reflect.set(window, 'archiveNavigationMarker', true)
  );
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Blog', exact: true })
    .click();
  const archive = page.locator('.archive-panel');
  const year = archive.getByRole('combobox', { name: '年', exact: true });
  await expect(year).toHaveValue('2026');
  await expect(archive.locator('[aria-current="page"]')).toHaveCount(0);
  await year.selectOption('2025');
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(archive.getByRole('link')).toHaveCount(2);

  await archive.getByRole('link', { name: '2025年11月', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/2025\/11\/?$/);
  await expect(year).toHaveValue('2025');
  await expect(
    archive.getByRole('link', { name: '2025年11月', exact: true })
  ).toHaveAttribute('aria-current', 'page');
  expect(
    await page.evaluate(() => Reflect.get(window, 'archiveNavigationMarker'))
  ).toBe(true);

  await year.selectOption('2026');
  await expect(
    archive.getByRole('link', { name: '2026年10月', exact: true })
  ).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/blog\/?$/);
  await expect(year).toHaveValue('2026');
  await year.selectOption('2025');
  await expect(
    archive.getByRole('link', { name: '2025年12月', exact: true })
  ).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('keeps all archive links accessible', async ({ page }) => {
    await page.goto('blog/2025/11/');
    const archive = page.locator('.archive-panel');
    await expect(archive.getByRole('combobox')).toHaveCount(0);
    await expect(archive.locator('a')).toHaveCount(12);
    await expect(
      archive.getByRole('link', { name: '2025年11月', exact: true })
    ).toBeVisible();
    await archive.locator('summary', { hasText: '2026年' }).click();
    await archive
      .getByRole('link', { name: '2026年10月', exact: true })
      .click();
    await expect(page).toHaveURL(/\/blog\/2026\/10\/?$/);
    await expect(
      page.locator('.archive-panel [aria-current="page"]')
    ).toHaveText('10月');
  });
});
