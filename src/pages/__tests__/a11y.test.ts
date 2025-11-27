import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(
  new URL('../../layouts/Layout.astro', import.meta.url),
  'utf-8',
);
const globalStyles = readFileSync(
  new URL('../../styles/global.css', import.meta.url),
  'utf-8',
);

describe('スキップリンク', () => {
  it('レイアウトにメインコンテンツへスキップするリンクがある', () => {
    expect(layout).toMatch(
      /<a[^>]*class="skip-link"[^>]*href="#main-content"[^>]*>メインコンテンツへスキップ<\/a>/,
    );
  });

  it('メイン要素にスキップリンクがフォーカスを移動できる', () => {
    expect(layout).toMatch(/<main[^>]*id="main-content"[^>]*tabindex="-1"[^>]*>/);
  });
});

describe('キーボードフォーカスの視認性', () => {
  it('ボタンスタイルにフォーカス可視アウトラインが定義されている', () => {
    expect(globalStyles).toMatch(
      /\.btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--text-accent\)[^}]*outline-offset:\s*3px[^}]*\}/,
    );
  });

  it('ナビゲーションリンクがフォーカス時にハイライトされる', () => {
    expect(globalStyles).toMatch(
      /\.nav-link:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--text-accent\)[^}]*\}/,
    );
  });
});
