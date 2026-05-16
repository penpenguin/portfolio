import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('../projects/index.astro', import.meta.url),
  'utf-8'
);

const getMobileBlock = () => {
  const pattern = /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/;
  const match = source.match(pattern);
  return match ? match[0] : '';
};

describe('Projects list Bento layout', () => {
  it('project画像はGitHub Pagesのbase pathを考慮して解決する', () => {
    expect(source).toContain("import { withBase } from '../../utils/withBase'");
    expect(source).toContain('src={withBase(project.data.heroImage)}');
    expect(source).toMatch(/\.project-image\s*\{[^}]*object-position:\s*top/);
  });

  it('プロジェクト一覧は公開日の降順で並べ、最新をfeaturedにする', () => {
    expect(source).toContain('const sortedProjects = [...projects].sort');
    expect(source).toMatch(
      /b\.data\.pubDate\.getTime\(\)\s*-\s*a\.data\.pubDate\.getTime\(\)/
    );
    expect(source).toMatch(/sortedProjects\.map\(\(project,\s*index\)\s*=>/);
  });

  it('先頭プロジェクトをfeaturedカードとして扱う', () => {
    expect(source).toMatch(
      /class:list=\{\[[\s\S]*'bento-panel project-card card card-glass'[\s\S]*'project-card--featured': index === 0/
    );
  });

  it('画像がない場合はUI部品を描かない背景アートとして代替ビジュアルを表示する', () => {
    expect(source).toContain('project-card__fallback-visual');
    expect(source).toContain('project-card__fallback-art');
    expect(source).not.toContain('project-card__fallback-mark');
    expect(source).not.toContain('project-card__fallback-line');
    expect(source).not.toContain('project-card__fallback-mosaic');
    expect(source).not.toContain('project-card__fallback-tile');
    expect(source).not.toContain('project-card__fallback-graph');
    expect(source).not.toContain('project-card__fallback-bar');
    expect(source).toContain('project-summary');
    expect(source).toMatch(/project\.data\.heroImage\s*\?\s*\(/);
    expect(source).toMatch(
      /\.project-card__fallback-visual\s*\{[^}]*var\(--bento-muted-bg\)/s
    );
  });

  it('画像なしfeaturedカードに空白を作る固定高を持たせない', () => {
    expect(source).not.toMatch(
      /\.project-card--featured\s+\.project-header\s*\{[^}]*min-height:\s*100%/
    );
  });

  it('モバイルではプロジェクトカードを1カラムにする', () => {
    const mobileStyles = getMobileBlock();
    expect(mobileStyles).not.toBe('');
    expect(mobileStyles).toContain('grid-template-columns: 1fr');
  });
});
