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

const visualRunnerScript = readFileSync(
  new URL('../../../scripts/run-playwright-visual.mjs', import.meta.url),
  'utf-8'
);

describe('Playwright visual test runner', () => {
  it('uses a wrapper that starts a built preview before Playwright checks availability', () => {
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

  it('launches npm command shims through a shell on Windows', () => {
    expect(visualRunnerScript).toMatch(
      /spawn\(\s*localBin\('astro'\)[\s\S]*shell:\s*isWindows/
    );
    expect(visualRunnerScript).toMatch(
      /spawn\(\s*localBin\('playwright'\)[\s\S]*shell:\s*isWindows/
    );
  });

  it('requires Astro to report the exact tested URL before continuing', () => {
    expect(visualRunnerScript).toContain(
      'Local\\s+http:\\/\\/127\\.0\\.0\\.1:4324\\/portfolio'
    );
    expect(visualRunnerScript).not.toContain(
      'astro\\s+v[\\d.]+ ready in|Local'
    );
    expect(visualRunnerScript).not.toContain("'--strictPort'");
  });

  it('kills the Astro process tree on Windows', () => {
    expect(visualRunnerScript).toContain("'taskkill'");
    expect(visualRunnerScript).toContain("'/pid'");
    expect(visualRunnerScript).toContain("'/t'");
    expect(visualRunnerScript).toContain("'/f'");
  });

  it('only reuses a server when the caller explicitly supplies a preview', () => {
    expect(visualRunnerScript).toContain(
      "process.env.PLAYWRIGHT_EXTERNAL_WEB_SERVER === '1'"
    );
    expect(visualRunnerScript).toContain('Reusing external preview server');
    expect(visualRunnerScript).not.toContain('!process.env.CI');
  });

  it('builds and serves production assets for direct Playwright invocations without implicit reuse', () => {
    expect(playwrightConfig).toContain('npm run build && npm run preview');
    expect(playwrightConfig).toContain('reuseExistingServer: false');
  });

  it('fails fast when Astro reports a different local URL', () => {
    expect(visualRunnerScript).toContain(
      'Astro preview server started at ${reportedURL} instead of ${baseURL}'
    );
    expect(visualRunnerScript).toContain('Is port ${port} already in use?');
  });
});
