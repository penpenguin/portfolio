import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')
) as {
  scripts: Record<string, string>;
};

const playwrightConfig = readFileSync(
  new URL('../../../playwright.config.ts', import.meta.url),
  'utf-8'
);

describe('Playwright visual test runner', () => {
  it('uses a wrapper that starts Astro before Playwright checks availability', () => {
    expect(packageJson.scripts['test:visual']).toBe(
      'node scripts/run-playwright-visual.mjs'
    );
  });

  it('can skip Playwright webServer when the wrapper provides the server', () => {
    expect(playwrightConfig).toContain('PLAYWRIGHT_EXTERNAL_WEB_SERVER');
    expect(playwrightConfig).toMatch(
      /webServer:\s*usesExternalWebServer\s*\?\s*undefined\s*:/s
    );
  });
});
