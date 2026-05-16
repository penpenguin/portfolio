import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const playwrightConfig = readFileSync(
  new URL('../../playwright.config.ts', import.meta.url),
  'utf-8'
);
const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);

describe('Playwright visual checks', () => {
  it('adds a visual test script and Playwright dependency', () => {
    expect(packageJson.scripts['test:visual']).toBe('playwright test');
    expect(packageJson.devDependencies['@playwright/test']).toBeDefined();
  });

  it('has a project-local Playwright config and Bento layout spec', () => {
    expect(
      existsSync(new URL('../../playwright.config.ts', import.meta.url))
    ).toBe(true);
    expect(
      existsSync(
        new URL('../../tests/visual/bento-layout.spec.ts', import.meta.url)
      )
    ).toBe(true);
  });

  it('uses a strict fixed dev server port to avoid hanging on fallback ports', () => {
    expect(playwrightConfig).toContain(
      "baseURL: 'http://127.0.0.1:4324/portfolio/'"
    );
    expect(playwrightConfig).toContain(
      "command: 'npm run dev -- --host 127.0.0.1 --port 4324 --strictPort'"
    );
    expect(playwrightConfig).toContain(
      "url: 'http://127.0.0.1:4324/portfolio/'"
    );
  });
});
