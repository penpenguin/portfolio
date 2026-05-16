import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);

describe('ESLint configuration', () => {
  it('provides a lint script for source and config files', () => {
    expect(packageJson.scripts.lint).toBe('eslint .');
  });

  it('installs ESLint with Astro and TypeScript support', () => {
    expect(packageJson.devDependencies.eslint).toBeDefined();
    expect(packageJson.devDependencies['@eslint/js']).toBeDefined();
    expect(packageJson.devDependencies['eslint-plugin-astro']).toBeDefined();
    expect(packageJson.devDependencies['typescript-eslint']).toBeDefined();
  });

  it('uses a project-local flat config with Astro recommended rules', () => {
    const configUrl = new URL('../../eslint.config.js', import.meta.url);

    expect(existsSync(configUrl)).toBe(true);

    const config = readFileSync(configUrl, 'utf-8');
    expect(config).toContain('eslint-plugin-astro');
    expect(config).toContain('typescript-eslint');
    expect(config).toContain('eslintPluginAstro.configs.recommended');
  });
});
