import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const load = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('ブログ機能', () => {
  it('git-worktree-runner 記事が公開状態で存在する', () => {
    const post = load('../../content/blog/2025/11/git-worktree-runner.md');
    expect(post).toContain('title:');
    expect(post).toContain('git-worktree-runner');
    expect(post).not.toContain('draft: true');
  });

  it('ブログ詳細ページが年月slugで記事を取得する', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toContain("getEntry('blog'");
    expect(detailPage).toContain('Astro.params.year');
    expect(detailPage).toContain('Astro.params.month');
    expect(detailPage).toContain('Astro.params.slug');
  });

  it('ブログ一覧は公開済み記事を降順で取得する', () => {
    const index = load('../blog/index.astro');
    expect(index).toContain('sortPublishedPostsByDate');
    expect(index).toContain('const sortedPosts = sortPublishedPostsByDate(blogPosts);');
  });

  it('ブログ一覧は最新月のみを表示する', () => {
    const index = load('../blog/index.astro');
    expect(index).toContain('latestMonth');
    expect(index).toContain('latestPosts');
  });

  it('ブログ一覧に最新月ラベルは表示しない', () => {
    const index = load('../blog/index.astro');
    expect(index).not.toContain('最新月:');
  });

  it('ブログ一覧のリード文が日本語で案内されている', () => {
    const index = load('../blog/index.astro');
    expect(index).toContain('ブログや開発に関する記事を公開しています');
  });

  it('ブログ詳細ページはgetStaticPathsでdraftを除外してプリレンダーする', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(/export\s+(const|async function)\s+getStaticPaths/);
    expect(detailPage).toMatch(/!data\.draft/);
    expect(detailPage).toMatch(/params:\s*\{\s*year,\s*month,\s*slug\s*\}/);
  });

  it('月別アーカイブページが該当月で絞り込む', () => {
    const archivePage = load('../blog/[year]/[month]/index.astro');
    expect(archivePage).toContain("getCollection('blog'");
    expect(archivePage).toMatch(/id\.startsWith\(prefix\)/);
  });

  it('月別アーカイブの戻るリンクはcontent上部に配置する', () => {
    const archivePage = load('../blog/[year]/[month]/index.astro');
    const heroMatch = archivePage.match(
      /<section class="blog-hero">([\s\S]*?)<\/section>/
    );

    expect(heroMatch?.[1]).not.toContain('href="/blog"');
    expect(archivePage).toContain('archive-header');
    expect(archivePage).toContain('← ブログ一覧に戻る');
  });

  it('月別アーカイブの戻るボタンは小さく上下に余白がある', () => {
    const archivePage = load('../blog/[year]/[month]/index.astro');
    expect(archivePage).toMatch(
      /\.archive-header\s*\{[^}]*margin-top:\s*0[^}]*margin-bottom:\s*var\(--space-md\)/
    );
    expect(archivePage).toMatch(
      /\.archive-header\s+\.btn\s*\{[^}]*font-size:\s*var\(--font-size-sm\)/
    );
  });

  it('ブログ詳細ページはcontainerとglassラッパーで整形されている', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toContain('class="container"');
    expect(detailPage).toContain('content-wrapper glass');
  });

  it('ブログ詳細のタグpillが小さめのフォントサイズで表示される', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(/\.tag\s*\{[^}]*font-size:\s*var\(--font-size-xs\)/);
  });

  it('ブログ詳細の「ブログ一覧に戻る」ボタンがコンパクトなスタイル', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(/\.breadcrumb\s*\.btn\s*\{/);
    expect(detailPage).toMatch(/font-size:\s*var\(--font-size-sm\)/);
  });
});
