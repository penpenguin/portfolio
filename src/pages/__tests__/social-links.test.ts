import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const contactSource = readFileSync(
  new URL('../contact.astro', import.meta.url),
  'utf-8'
);
const aboutSource = readFileSync(
  new URL('../about.astro', import.meta.url),
  'utf-8'
);
const layoutSource = readFileSync(
  new URL('../../layouts/Layout.astro', import.meta.url),
  'utf-8'
);
const envExampleSource = readFileSync(
  new URL('../../../.env.example', import.meta.url),
  'utf-8'
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

describe('Contactページの連絡先アイコン', () => {
  it('EmailとGitHubの略号テキストではなく装飾SVGアイコンを使う', () => {
    expect(contactSource).not.toMatch(/<div class="method-icon">EM<\/div>/);
    expect(contactSource).not.toMatch(/<div class="method-icon">GH<\/div>/);
    expect(contactSource).toMatch(
      /<div class="method-icon method-icon--email" aria-hidden="true">[\s\S]*<svg/
    );
    expect(contactSource).toMatch(
      /<div class="method-icon method-icon--github" aria-hidden="true">[\s\S]*<svg/
    );
  });
});

describe('ContactページのBentoレイアウト', () => {
  it('モバイルでは連絡先と稼働状況を1カラムにする', () => {
    const mobileMatch = contactSource.match(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/
    );

    expect(mobileMatch?.[0]).toContain('grid-template-columns: 1fr');
  });
});
