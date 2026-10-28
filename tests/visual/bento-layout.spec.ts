import { expect, test } from '@playwright/test';

const pages = [
  { path: './', heading: 'About' },
  { path: 'projects/', heading: 'Built Systems' },
  { path: 'blog/', heading: 'Blog' },
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

  test('keeps About dark through hover and focus without darkening list heroes', async ({
    page,
  }) => {
    await page.goto('./');
    const intro = page.locator('.bento-card--intro');
    const assertColors = async () => {
      await expect(intro).toHaveCSS('background-color', 'rgb(9, 9, 9)');
      await expect(intro.locator('h1')).toHaveCSS(
        'color',
        'rgb(196, 196, 196)'
      );
      await expect(intro.locator('.intro-role')).toHaveCSS(
        'color',
        'rgb(182, 181, 187)'
      );
    };
    await assertColors();
    await intro.hover();
    await assertColors();
    // A temporary focus target exercises :focus-within without adding a production CTA.
    await intro.evaluate((element) => {
      const probe = document.createElement('button');
      probe.textContent = 'Focus probe';
      element.append(probe);
      probe.focus();
    });
    await page.mouse.move(0, 0);
    await assertColors();
    for (const path of ['projects/', 'blog/']) {
      await page.goto(path);
      await expect(page.locator('header.bento-hero')).toHaveCSS(
        'background-color',
        'rgb(233, 233, 233)'
      );
    }
  });

  test('detail pages and media remain readable at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    for (const path of [
      './',
      'projects/',
      'projects/card-lighting-demo/',
      'projects/petatas/',
      'blog/',
      'blog/2025/11/',
      'blog/2026/05/webmcp-basics/',
    ]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        navBottom: document
          .querySelector('.navbar-content')!
          .getBoundingClientRect().bottom,
        panelTop: document.querySelector('.bento-hero')!.getBoundingClientRect()
          .top,
      }));
      expect(layout.scrollWidth, path).toBeLessThanOrEqual(layout.width + 1);
      expect(layout.panelTop, path).toBeGreaterThanOrEqual(layout.navBottom);
      const firstDate = page.locator('time').first();
      await expect(firstDate).toHaveText(/^\s*\d{4}\.\d{2}\.\d{2}\s*$/);
      await expect(firstDate).toHaveAttribute(
        'datetime',
        /^\d{4}-\d{2}-\d{2}T/
      );
    }
    const table = page.locator('.table-scroll').first();
    await expect(table).toHaveAttribute('tabindex', '0');
    const dimensions = await table.evaluate((el) => ({
      width: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.width);
    await table.focus();
    await expect(table).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('.content-wrapper pre').first()).toHaveCSS(
      'white-space',
      'pre'
    );
    const codeOverflow = await page
      .locator('.content-wrapper pre')
      .evaluateAll((blocks) =>
        Math.max(
          ...blocks.map((block) => block.scrollWidth - block.clientWidth)
        )
      );
    expect(codeOverflow).toBeGreaterThan(0);
    await page.goto('projects/');
    const image = page.locator(
      '.project-card--featured .blog-thumbnail__image'
    );
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect(image).toHaveCSS('object-position', '50% 50%');
  });

  test('font fallback and long preview content fit without animation', async ({
    page,
  }) => {
    await page.route('https://fonts.googleapis.com/**', (route) =>
      route.abort()
    );
    await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 768, 1024]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('./');
      await page.locator('.project-summary h2 a').evaluate((el) => {
        el.textContent =
          'Long English Project Title With Supercalifragilisticexpialidocious';
      });
      await page.locator('.blog-summary h2 a').evaluate((el) => {
        el.textContent =
          '長い日本語の記事タイトルでも読みやすい行間と折り返しを保つための検証';
      });
      await page.locator('.project-tags').evaluate((el) => {
        const tag = el.firstElementChild!;
        for (let index = 0; index < 10; index++) el.append(tag.cloneNode(true));
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth)
      ).toBeLessThanOrEqual(width);
      await expect(page.locator('.bento-card--intro')).toHaveCSS(
        'transition-duration',
        '0s'
      );
    }
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Projects', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Built Systems' })
    ).toBeVisible();
  });

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

  test('home keeps the device beside About with the original desktop proportions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('./');

    const card = page.locator('.bento-card--device');
    const canvas = card.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(card).toHaveAttribute('aria-label', '線画の3D装置');
    await expect(page.locator('.bento-card')).toHaveCount(4);
    await expect(
      page.locator('.bento-card--metric, .bento-card--playground')
    ).toHaveCount(0);

    const layout = await page.evaluate(() => {
      const intro = document.querySelector('.bento-card--intro')!;
      const device = document.querySelector('.bento-card--device')!;
      const canvas = device.querySelector('canvas')!;
      const grid = document.querySelector('.home-overview-grid')!;
      return {
        intro: intro.getBoundingClientRect().toJSON(),
        device: device.getBoundingClientRect().toJSON(),
        canvas: canvas.getBoundingClientRect().toJSON(),
        gap: parseFloat(getComputedStyle(grid).columnGap),
      };
    });

    expect(layout.device.height).toBeGreaterThan(150);
    expect(
      Math.abs(layout.intro.height - layout.device.height)
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(layout.intro.top - layout.device.top)).toBeLessThanOrEqual(
      1
    );
    expect(layout.device.left).toBeGreaterThan(layout.intro.right);
    expect(
      Math.abs(layout.intro.width - (3 * layout.device.width + 2 * layout.gap))
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.canvas.width - (layout.device.width - 2))
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(layout.canvas.height - (layout.device.height - 50))
    ).toBeLessThanOrEqual(1);
  });

  test('home stacks all four cards with a 240px device on smaller screens', async ({
    page,
  }) => {
    for (const width of [980, 768, 390, 320]) {
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
        'device',
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

  test('home retains pause across repeated ClientRouter visits and resumes with the keyboard', async ({
    page,
  }) => {
    await page.goto('./');
    await page.evaluate(() =>
      Reflect.set(window, 'deviceNavigationMarker', true)
    );
    const canvas = page.locator('wireframe-device canvas');
    const pixels = () =>
      canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
    await expect(
      page.getByRole('button', { name: '回転を停止' })
    ).toBeVisible();
    const initial = await pixels();
    await expect.poll(pixels).not.toBe(initial);
    await page.getByRole('button', { name: '回転を停止' }).click();
    const paused = await pixels();
    await page.waitForTimeout(150);
    expect(await pixels()).toBe(paused);
    for (let visit = 0; visit < 3; visit++) {
      await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Blog', exact: true })
        .click();
      await expect(page.locator('wireframe-device')).toHaveCount(0);
      await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Home', exact: true })
        .click();
      await expect(
        page.getByRole('button', { name: '回転を再生' })
      ).toBeVisible();
      await expect.poll(pixels).toBe(paused);
    }
    expect(
      await page.evaluate(() => Reflect.get(window, 'deviceNavigationMarker'))
    ).toBe(true);
    const play = page.getByRole('button', { name: '回転を再生' });
    await play.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(play).toBeFocused();
    await expect(play).toHaveCSS('outline-style', 'solid');
    await play.press('Enter');
    await expect.poll(pixels).not.toBe(paused);
  });

  test('device stays still under reduced motion and suspends offscreen', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await page.evaluate(() => document.fonts.ready);
    const canvas = page.locator('wireframe-device canvas');
    const pixels = () =>
      canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
    const play = page.getByRole('button', { name: '回転を再生' });
    await expect(play).toBeVisible();
    await page.waitForTimeout(100);
    const still = await pixels();
    await page.waitForTimeout(150);
    expect(await pixels()).toBe(still);
    await play.click();
    await expect.poll(pixels).not.toBe(still);
    // A short viewport makes the top row completely leave the viewport at all widths.
    await page.setViewportSize({ width: 390, height: 400 });
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
    );
    await page.waitForTimeout(100);
    const offscreen = await pixels();
    await page.waitForTimeout(150);
    expect(await pixels()).toBe(offscreen);
    await canvas.scrollIntoViewIfNeeded();
    await expect.poll(pixels).not.toBe(offscreen);
  });

  test('Canvas failure retains the static drawing without a nonfunctional control', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
    await page.goto('./');
    await expect(page.locator('wireframe-device svg')).toBeVisible();
    await expect(page.locator('wireframe-device canvas')).toBeHidden();
    await expect(page.locator('wireframe-device button')).toBeHidden();
  });
});

test.describe('device without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('keeps the static wireframe visible', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('wireframe-device svg')).toBeVisible();
    await expect(page.locator('wireframe-device button')).toBeHidden();
  });
});
