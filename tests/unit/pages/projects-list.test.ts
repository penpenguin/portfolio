import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('../../../src/pages/projects/index.astro', import.meta.url),
  'utf-8'
);

const getMobileBlock = () => {
  const pattern = /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/;
  const match = source.match(pattern);
  return match ? match[0] : '';
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ');

describe('Projects list Bento layout', () => {
  it('Projects heroのリード文は英語で表示する', () => {
    expect(normalizeWhitespace(source)).toContain(
      'Music tools, web apps, and operations support, documented with design intent and working outputs.'
    );
    expect(source).not.toContain(
      '音楽ツール、Webアプリ、運用支援まで。実装したものを、設計意図と動作する形で残しています。'
    );
  });

  it('uses the shared base-aware thumbnail with project tone and loading policy', () => {
    expect(source).toContain(
      "import BlogThumbnail from '../../components/BlogThumbnail.astro'"
    );
    expect(source).toMatch(/<BlogThumbnail\s+src=\{project.data.heroImage\}/s);
    expect(source).toContain('tone={project.data.thumbnailTone}');
    expect(source).toContain("loading={index === 0 ? 'eager' : 'lazy'}");
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

  it('delegates absent images to the common NoImage without excluding them', () => {
    expect(source).toContain('<BlogThumbnail');
    expect(source).not.toMatch(/project\.data\.heroImage\s*\?\s*\(/);
    expect(source).toContain('project-summary');
  });

  it('featuredカードは派手なグラデーションではなく静かなsurfaceで強調する', () => {
    expect(source).toMatch(
      /\.project-card--featured\s*\{[^}]*background:\s*var\(--bento-card-bg\);/s
    );
    expect(source).not.toMatch(
      /\.project-card--featured\s*\{[^}]*linear-gradient/s
    );
  });

  it('preserves regular and featured thumbnail heights', () => {
    expect(source).toMatch(
      /\.project-image\s*\{[^}]*--thumbnail-height:\s*220px/s
    );
    expect(source).toMatch(
      /\.project-card--featured\s+\.project-image\s*\{[^}]*--thumbnail-height:\s*360px/s
    );
    expect(getMobileBlock()).toMatch(
      /\.project-card--featured\s+\.project-image\s*\{[^}]*--thumbnail-height:\s*220px/s
    );
  });

  it('does not repeat project titles inside a decorative fallback', () => {
    expect(source).not.toMatch(/(?:linear|radial)-gradient/);
    expect(source).not.toContain('project-card__fallback-art');
    expect(source).not.toContain('project-card__fallback-visual');
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
