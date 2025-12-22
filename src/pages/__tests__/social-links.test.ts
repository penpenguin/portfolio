import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const contactSource = readFileSync(
  new URL('../contact.astro', import.meta.url),
  'utf-8',
);
const aboutSource = readFileSync(
  new URL('../about.astro', import.meta.url),
  'utf-8',
);
const layoutSource = readFileSync(
  new URL('../../layouts/Layout.astro', import.meta.url),
  'utf-8',
);
const envExampleSource = readFileSync(
  new URL('../../../.env.example', import.meta.url),
  'utf-8',
);

describe('Xリンクの削除', () => {
  it('ContactページにXリンクが含まれない', () => {
    expect(contactSource).not.toMatch(/PUBLIC_X_URL/);
    expect(contactSource).not.toMatch(/https:\/\/x\.com/);
  });

  it('AboutページにXリンクが含まれない', () => {
    expect(aboutSource).not.toMatch(/PUBLIC_X_URL/);
    expect(aboutSource).not.toMatch(/https:\/\/x\.com/);
  });

  it('LayoutフッターにXリンクが含まれない', () => {
    expect(layoutSource).not.toMatch(/PUBLIC_X_URL/);
    expect(layoutSource).not.toMatch(/https:\/\/x\.com/);
  });

  it('.env.exampleにX関連の設定が含まれない', () => {
    expect(envExampleSource).not.toMatch(/PUBLIC_X_URL/);
    expect(envExampleSource).not.toMatch(/https:\/\/x\.com/);
  });
});
