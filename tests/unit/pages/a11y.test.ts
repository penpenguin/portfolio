import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(
  new URL('../../../src/layouts/Layout.astro', import.meta.url),
  'utf-8'
);
const globalStyles = readFileSync(
  new URL('../../../src/styles/global.css', import.meta.url),
  'utf-8'
);

describe('スキップリンク', () => {
  it('レイアウトにスキップリンクを持たない', () => {
    expect(layout).not.toMatch(/class="skip-link"/);
    expect(layout).not.toMatch(/href="#main-content"/);
    expect(layout).not.toMatch(/id="main-content"/);
  });
});

describe('キーボードフォーカスの視認性', () => {
  it('ボタンスタイルにフォーカス可視アウトラインが定義されている', () => {
    expect(globalStyles).toMatch(
      /\.btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--text-accent\)[^}]*outline-offset:\s*3px[^}]*\}/
    );
  });

  it('ナビゲーションリンクがフォーカス時にハイライトされる', () => {
    expect(globalStyles).toMatch(
      /\.nav-link:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--text-accent\)[^}]*\}/
    );
  });
});
