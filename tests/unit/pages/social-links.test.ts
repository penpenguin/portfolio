import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const contactSource = readFileSync(
  new URL('../../../src/pages/contact.astro', import.meta.url),
  'utf-8'
);
const careerSource = readFileSync(
  new URL('../../../src/pages/career.astro', import.meta.url),
  'utf-8'
);
const layoutSource = readFileSync(
  new URL('../../../src/layouts/Layout.astro', import.meta.url),
  'utf-8'
);
const envExampleSource = readFileSync(
  new URL('../../../.env.example', import.meta.url),
  'utf-8'
);
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ');

describe('Xリンクの削除', () => {
  it('ContactページにXリンクが含まれない', () => {
    expect(contactSource).not.toMatch(/PUBLIC_X_URL/);
    expect(contactSource).not.toMatch(/https:\/\/x\.com/);
  });

  it('CareerページにXリンクが含まれない', () => {
    expect(careerSource).not.toMatch(/PUBLIC_X_URL/);
    expect(careerSource).not.toMatch(/https:\/\/x\.com/);
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
  it('Contact heroのリード文は英語で表示する', () => {
    expect(normalizeWhitespace(contactSource)).toContain(
      'Get in touch for production web systems, existing system improvements, and implementation support with operations in mind.'
    );
    expect(contactSource).not.toContain(
      '業務システム開発の相談、既存システムの改善、運用を見据えた実装支援についてご連絡ください。'
    );
  });

  it('モバイルでは連絡先と稼働状況を1カラムにする', () => {
    const mobileMatch = contactSource.match(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/
    );

    expect(mobileMatch?.[0]).toContain('grid-template-columns: 1fr');
  });
});
