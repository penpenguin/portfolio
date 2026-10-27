import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(
  new URL('../../../src/layouts/Layout.astro', import.meta.url),
  'utf-8'
);

const getMobileNavBlock = () => {
  const pattern =
    /@media\s*\(max-width:\s*768px\)[\s\S]*?\.nav-links\s*{[\s\S]*?}/;
  const match = layout.match(pattern);
  return match ? match[0] : '';
};

describe('Layout モバイルナビゲーション', () => {
  it('小さい画面でナビゲーションリンクを折り返して横スクロールを防ぐ', () => {
    const mobileNavRule = getMobileNavBlock();
    expect(mobileNavRule).not.toBe('');
    expect(mobileNavRule).toMatch(/flex-wrap\s*:\s*wrap/);
    expect(mobileNavRule).toMatch(/justify-content\s*:\s*center/);
  });

  it('ナビの高さと本文余白をCSS変数で連動する', () => {
    expect(layout).toContain('--nav-offset');
    expect(layout).toMatch(/main\s*\{[^}]*margin-top:\s*var\(--nav-offset\)/);
    expect(layout).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*--nav-offset:\s*132px/
    );
  });
});

describe('資料集の共有ヘッダーと検索', () => {
  it('必要なセリフ体をswapで読み込む', () => {
    expect(layout).toContain('Cormorant+Garamond:wght@400;500');
    expect(layout).toContain('Noto+Serif+JP:wght@500');
    expect(layout).toContain('display=swap');
  });

  it('不透明な面と下線のナビを使用する', () => {
    expect(layout).toMatch(
      /\.navbar-content\s*\{[^}]*background:\s*var\(--primary-bg\)/s
    );
    expect(layout).toMatch(
      /\.nav-link--active\s*\{[^}]*text-decoration:\s*underline/s
    );
    expect(layout).not.toContain('backdrop-filter');
  });

  it('検索ダイアログにも操作色と読みやすい副文字を適用する', () => {
    expect(layout).toMatch(
      /body\s*\{[^}]*--pf-outline-focus:\s*var\(--focus-color\)/s
    );
    expect(layout).toMatch(
      /body\s*\{[^}]*--pf-text-muted:\s*var\(--text-secondary\)/s
    );
    expect(layout).toContain('--pf-shadow-lg: none');
  });
});
