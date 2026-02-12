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
    expect(index).toContain(
      'const sortedPosts = sortPublishedPostsByDate(blogPosts);'
    );
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
    expect(detailPage).toMatch(
      /export\s+(const|async function)\s+getStaticPaths/
    );
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
    expect(detailPage).toMatch(
      /\.tag\s*\{[^}]*font-size:\s*var\(--font-size-xs\)/
    );
  });

  it('ブログ詳細の「ブログ一覧に戻る」ボタンがコンパクトなスタイル', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(/\.breadcrumb\s*\.btn\s*\{/);
    expect(detailPage).toMatch(/font-size:\s*var\(--font-size-sm\)/);
  });

  it('ブログ詳細ページは記事ごとの感想吹き出しを条件付きで表示する', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toContain('impression');
    expect(detailPage).toContain('author-impression');
    expect(detailPage).toMatch(/\{\s*impression\s*&&\s*\(/);
  });

  it('感想吹き出しはpenpenguinのGitHubプロフィール画像を参照する', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toContain('https://github.com/penpenguin.png');
    expect(detailPage).toContain('author-impression__avatar');
  });

  it('感想吹き出しはしっぽを描画しない', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).not.toMatch(/\.author-impression__content::before\s*\{/);
    expect(detailPage).not.toMatch(/\.author-impression__content::after\s*\{/);
  });

  it('吹き出し本体にしっぽ用スタイルを残さない', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).not.toMatch(
      /\.author-impression__content\s*\{[^}]*clip-path:\s*polygon\(0\s+50%,\s*100%\s+0,\s*100%\s+100%\)/
    );
    expect(detailPage).not.toMatch(
      /\.author-impression__content\s*\{[^}]*border-right:\s*0/
    );
  });

  it('感想吹き出しのアイコンは44pxの丸で表示される', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(
      /\.author-impression__avatar\s*\{[^}]*border-radius:\s*999px/
    );
    expect(detailPage).toMatch(
      /\.author-impression__avatar\s*\{[^}]*width:\s*44px/
    );
    expect(detailPage).toMatch(
      /\.author-impression__avatar\s*\{[^}]*height:\s*44px/
    );
  });

  it('感想吹き出し本体はcard-glassに近いトークンで表示される', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*background:\s*var\(--glass-bg\)/
    );
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*border:\s*1px\s+solid\s+var\(--glass-border\)/
    );
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*box-shadow:\s*var\(--shadow-glass\)/
    );
  });

  it('スマホでも感想のアイコンと吹き出しは横並びを維持する', () => {
    const detailPage = load('../blog/[year]/[month]/[slug].astro');
    expect(detailPage).not.toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.author-impression\s*\{[^}]*grid-template-columns:\s*1fr/
    );
  });
});
