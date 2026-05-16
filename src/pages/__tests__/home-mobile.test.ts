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
    expect(mobileStyles).toContain('grid-template-columns: 1fr');
    expect(mobileStyles).toContain('min-height: auto');
  });

  it('Heroから装飾専用の抽象ビジュアルを削除する', () => {
    expect(page).not.toContain('systems-visual');
    expect(page).not.toContain('<strong>Requirements</strong>');
    expect(page).not.toContain('<strong>Web System</strong>');
    expect(page).not.toContain('<strong>Operations</strong>');
  });

  it('Home HeroにCTAボタンを表示しない', () => {
    expect(page).not.toContain('実績を見る');
    expect(page).not.toContain('相談する');
    expect(page).not.toContain('class="action-row"');
  });

  it('スタックを領域別に分類して表示する', () => {
    expect(page).toContain('Backend');
    expect(page).toContain('Frontend');
    expect(page).toContain('Platform');
  });

  it('HomeのBentoセルを価値・証拠・技術・実績・焦点に絞る', () => {
    expect(page).not.toContain('<h3>社内システム開発</h3>');
    expect(page).not.toContain('<h3>フルスタック開発</h3>');
    expect(page).not.toContain('<h3>CI/CD・自動化</h3>');
    expect(page).not.toContain('tile-number');
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--project card-glass"'
    );
    expect(page).toContain('Featured Project');
    expect(page).toContain("getCollection('projects')");
    expect(page).toContain('const [featuredProject] = [...projects].sort');
    expect(page).toContain('featuredProject');
  });
});
