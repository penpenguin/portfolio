import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../index.astro', import.meta.url), 'utf-8');

const getMobileBlock = () => {
  const pattern = /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/;
  const match = page.match(pattern);
  return match ? match[0] : '';
};

describe('Home モバイルレイアウト', () => {
  it('Bentoグリッドが小さい画面では1カラムに収まる', () => {
    const mobileStyles = getMobileBlock();
    expect(mobileStyles).not.toBe('');
    expect(page).toContain('class="page-shell bento-shell"');
    expect(page).toContain('class="bento-grid"');
    expect(page).toMatch(/class="[^"]*bento-card[^"]*bento-card--intro[^"]*"/);
    expect(mobileStyles).toContain('.bento-card');
    expect(mobileStyles).toContain('min-height: auto');
  });
});
