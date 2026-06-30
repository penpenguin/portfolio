import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const astroConfig = readFileSync(
  new URL('../../../astro.config.mjs', import.meta.url),
  'utf-8'
);

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')
) as {
  devDependencies: Record<string, string>;
};

describe('Astro Markdown configuration', () => {
  it('uses the unified Markdown processor for remark plugins', () => {
    expect(astroConfig).toContain(
      "import { unified } from '@astrojs/markdown-remark';"
    );
    expect(astroConfig).toMatch(
      /processor:\s*unified\(\{\s*remarkPlugins:\s*\[remarkAdmonition\]/s
    );
    expect(astroConfig).not.toMatch(/\n\s{4}remarkPlugins:/);
  });

  it('declares the Markdown processor package as a direct dev dependency', () => {
    expect(packageJson.devDependencies).toHaveProperty(
      '@astrojs/markdown-remark'
    );
  });
});
