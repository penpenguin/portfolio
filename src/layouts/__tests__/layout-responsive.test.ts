import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(new URL('../Layout.astro', import.meta.url), 'utf-8');

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
});
