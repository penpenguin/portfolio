import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const configSource = readFileSync(
  new URL('../../../eslint.config.js', import.meta.url),
  'utf-8'
);

describe('ESLint flat config', () => {
  it('uses the flat Astro recommended preset', () => {
    expect(configSource).toContain("eslintPluginAstro.configs['flat/recommended']");
    expect(configSource).not.toContain('eslintPluginAstro.configs.recommended');
  });
});
