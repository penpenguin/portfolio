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

  it('stickyヘッダーをフローに置き、本文の固定オフセットを撤去する', () => {
    expect(layout).toMatch(/\.navbar\s*\{[^}]*position:\s*sticky/s);
    expect(layout).toMatch(/\.navbar\s*\{[^}]*top:\s*0/s);
    expect(layout).not.toContain('--nav-offset');
    expect(layout).not.toContain('calc(100vh - 160px)');
    expect(layout).toContain('<main class="site-main">');
    expect(layout).toMatch(/\.site-main\s*\{[^}]*flex:\s*1 0 auto/s);
    expect(layout).toContain('min-height: 100svh');
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
      /\.navbar\s*\{[^}]*background:\s*var\(--primary-bg\)/s
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
