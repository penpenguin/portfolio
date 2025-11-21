import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const load = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('ブログ機能', () => {
  it('公開用のサンプル記事が存在し、draft指定を持たない', () => {
    const post = load('../../content/blog/sample-post.md');
    expect(post).toContain('title:');
    expect(post).not.toContain('draft: true');
  });

  it('ブログ詳細ページが記事をslugで取得する', () => {
    const detailPage = load('../blog/[slug].astro');
    expect(detailPage).toContain("getEntryBySlug('blog'");
    expect(detailPage).toContain('Astro.params.slug');
  });

  it('ブログ一覧はdraft記事を除外する', () => {
    const index = load('../blog/index.astro');
    expect(index).toContain('filter((post)');
    expect(index).toContain('!post.data.draft');
  });

  it('ブログ一覧のリード文が日本語で案内されている', () => {
    const index = load('../blog/index.astro');
    expect(index).toContain('ブログや開発に関する記事を公開しています');
  });

  it('ブログ詳細ページはgetStaticPathsでdraftを除外してプリレンダーする', () => {
    const detailPage = load('../blog/[slug].astro');
    expect(detailPage).toMatch(/export\s+(const|async function)\s+getStaticPaths/);
    expect(detailPage).toMatch(/!data\.draft/);
    expect(detailPage).toMatch(/params:\s*\{\s*slug:\s*post\.slug\s*\}/);
  });

  it('ブログ詳細ページはcontainerとglassラッパーで整形されている', () => {
    const detailPage = load('../blog/[slug].astro');
    expect(detailPage).toContain('class="container"');
    expect(detailPage).toContain('content-wrapper glass');
  });

  it('ブログ詳細のタグpillが小さめのフォントサイズで表示される', () => {
    const detailPage = load('../blog/[slug].astro');
    expect(detailPage).toMatch(/\.tag\s*\{[^}]*font-size:\s*var\(--font-size-xs\)/);
  });

  it('ブログ詳細の「ブログ一覧に戻る」ボタンがコンパクトなスタイル', () => {
    const detailPage = load('../blog/[slug].astro');
    expect(detailPage).toMatch(/\.breadcrumb\s*\.btn\s*\{/);
    expect(detailPage).toMatch(/font-size:\s*var\(--font-size-sm\)/);
  });
});
