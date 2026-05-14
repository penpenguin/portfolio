import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8')) as {
  dependencies?: Record<string, string>;
};

const deployWorkflow = readFileSync('.github/workflows/deploy.yml', 'utf-8');

describe('dependency upgrade baseline', () => {
  it('uses Astro 6 or newer', () => {
    expect(packageJson.dependencies?.astro).toMatch(/^\^6\./);
  });

  it('uses Node 22 for GitHub Actions build and test jobs', () => {
    expect(deployWorkflow).toContain('node-version: 22');
    expect(deployWorkflow).not.toContain('node-version: 20');
  });
});
