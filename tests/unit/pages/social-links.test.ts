import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(
  new URL('../../../src/layouts/Layout.astro', import.meta.url),
  'utf-8'
);
const envExampleSource = readFileSync(
  new URL('../../../.env.example', import.meta.url),
  'utf-8'
);

describe('Public environment configuration', () => {
  it('keeps GitHub configuration without the retired email setting', () => {
    expect(envExampleSource).toContain('PUBLIC_GITHUB_URL=');
    expect(envExampleSource).not.toContain('PUBLIC_EMAIL');
  });
});

describe('Xリンクの削除', () => {
  it('LayoutフッターにXリンクが含まれない', () => {
    expect(layoutSource).not.toMatch(/PUBLIC_X_URL/);
    expect(layoutSource).not.toMatch(/https:\/\/x\.com/);
  });

  it('.env.exampleにX関連の設定が含まれない', () => {
    expect(envExampleSource).not.toMatch(/PUBLIC_X_URL/);
    expect(envExampleSource).not.toMatch(/https:\/\/x\.com/);
  });
});
