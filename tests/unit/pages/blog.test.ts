import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const load = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ');

describe('ブログ機能', () => {
  it('git-worktree-runner 記事が公開状態で存在する', () => {
    const post = load(
      '../../../src/content/blog/2025/11/git-worktree-runner.md'
    );
    expect(post).toContain('title:');
    expect(post).toContain('git-worktree-runner');
    expect(post).not.toContain('draft: true');
  });

  it('ブログ詳細ページが年月slugで記事を取得する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toContain("getEntry('blog'");
    expect(detailPage).toContain('Astro.params.year');
    expect(detailPage).toContain('Astro.params.month');
    expect(detailPage).toContain('Astro.params.slug');
  });

  it('ブログ一覧は公開済み記事を降順で取得する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(index).toContain('sortPublishedPostsByDate');
    expect(index).toContain(
      'const sortedPosts = sortPublishedPostsByDate(blogPosts);'
    );
  });

  it('ブログ一覧は最新月のみを表示する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(index).toContain('latestMonth');
    expect(index).toContain('latestPosts');
  });

  it('ブログ一覧に最新月ラベルは表示しない', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(index).not.toContain('最新月:');
  });

  it('ブログ一覧のリード文は英語で表示する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(normalizeWhitespace(index)).toContain(
      'Development notes, implementation details, and design learnings, updated in short readable entries.'
    );
    expect(index).not.toContain('ブログや開発に関する記事を公開しています');
  });

  it('ブログ一覧は最新記事とアーカイブをBentoグリッドとして配置する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(index).toContain('const featuredPost = latestPosts[0];');
    expect(index).toContain('const secondaryPosts = latestPosts.slice(1);');
    expect(index).toContain('class="bento-grid blog-bento"');
    expect(index).toContain('post-card--featured');
    expect(index).toContain('archive-panel');
    expect(index).toContain('archive-summary');
    expect(index).toContain('archive-metric');
    expect(index).toContain('post-visual--fallback');
    expect(index.indexOf('archive-panel')).toBeLessThan(
      index.indexOf('secondaryPosts.map')
    );
    expect(index).toMatch(
      /\.blog-bento\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/
    );
    expect(index).toMatch(
      /\.archive-panel\s*\{[^}]*grid-column:\s*9\s*\/\s*span\s*4/s
    );
    expect(index).toMatch(/\.archive-panel\s*\{[^}]*align-self:\s*stretch/s);
  });

  it('月別アーカイブもBlog一覧と同じBentoカード構成を使う', () => {
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );
    expect(archivePage).toContain('const months = Array.from');
    expect(archivePage).toContain('const featuredPost = posts[0];');
    expect(archivePage).toContain('const secondaryPosts = posts.slice(1);');
    expect(archivePage).toContain(
      'class="bento-grid blog-bento blog-bento--archive"'
    );
    expect(archivePage).toContain('post-card--featured');
    expect(archivePage).toContain('post-visual--fallback');
    expect(archivePage).toContain('archive-panel');
    expect(archivePage).toContain('archive-summary');
    expect(archivePage).toContain('archive-metric');
    expect(archivePage).toContain('month-link--current');
    expect(archivePage.indexOf('archive-panel')).toBeLessThan(
      archivePage.indexOf('secondaryPosts.map')
    );
    expect(archivePage).toMatch(
      /\.archive-panel\s*\{[^}]*grid-column:\s*9\s*\/\s*span\s*4/s
    );
    expect(archivePage).toMatch(
      /\.archive-panel\s*\{[^}]*align-self:\s*stretch/s
    );
  });

  it('BlogのBentoカードは長文で縦に伸びすぎないように本文を制限する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    expect(index).not.toMatch(/\.post-card--featured\s*\{[^}]*grid-row:/);
    expect(index).toMatch(
      /\.post-description\s*\{[^}]*-webkit-line-clamp:\s*3/s
    );
    expect(index).toMatch(
      /\.post-card--featured\s+\.post-description\s*\{[^}]*-webkit-line-clamp:\s*4/s
    );
    expect(index).toMatch(
      /\.post-meta\s+h2\s*\{[^}]*font-size:\s*var\(--font-size-xl\)/s
    );
    expect(index).toMatch(/\.blog-bento\s*\{[^}]*align-items:\s*start/s);
    expect(index).not.toMatch(/\.post-card\s*\{[^}]*min-height:\s*100%/);
  });

  it('BlogのサムネイルはProjectと同じくカードを埋めるhairline frameで表示する', () => {
    const index = load('../../../src/pages/blog/index.astro');
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );

    for (const source of [index, archivePage]) {
      expect(source).toMatch(/\.post-image\s*\{[^}]*display:\s*block/s);
      expect(source).toMatch(/\.post-image\s*\{[^}]*object-fit:\s*cover/s);
      expect(source).toMatch(/\.post-image\s*\{[^}]*object-position:\s*top/s);
      expect(source).toMatch(
        /\.post-image\s*\{[^}]*background:\s*var\(--bento-muted-bg\)/s
      );
      expect(source).toMatch(
        /\.post-image\s*\{[^}]*border-bottom:\s*1px solid var\(--glass-border\)/s
      );
    }
  });

  it('空状態は...テキストではなく装飾SVGアイコンを使う', () => {
    const index = load('../../../src/pages/blog/index.astro');
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );

    expect(index).not.toMatch(/<div class="empty-icon">\.\.\.<\/div>/);
    expect(archivePage).not.toMatch(/<div class="empty-icon">\.\.\.<\/div>/);
    expect(index).toMatch(
      /<div class="empty-icon" aria-hidden="true">[\s\S]*<svg/
    );
    expect(archivePage).toMatch(
      /<div class="empty-icon" aria-hidden="true">[\s\S]*<svg/
    );
  });

  it('ブログ詳細ページはgetStaticPathsでdraftを除外してプリレンダーする', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toMatch(
      /export\s+(const|async function)\s+getStaticPaths/
    );
    expect(detailPage).toMatch(/!data\.draft/);
    expect(detailPage).toMatch(/params:\s*\{\s*year,\s*month,\s*slug\s*\}/);
  });

  it('月別アーカイブページが該当月で絞り込む', () => {
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );
    expect(archivePage).toContain("getCollection('blog'");
    expect(archivePage).toMatch(/id\.startsWith\(prefix\)/);
  });

  it('月別アーカイブの戻るリンクはcontent上部に配置する', () => {
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );
    const heroMatch = archivePage.match(
      /<header class="[^"]*blog-hero[^"]*card-glass[^"]*">([\s\S]*?)<\/header>/
    );

    expect(heroMatch?.[1]).toBeDefined();
    expect(heroMatch?.[1]).not.toContain('href="/blog"');
    expect(archivePage).toContain('archive-header');
    expect(archivePage).toContain('← ブログ一覧に戻る');
  });

  it('月別アーカイブの戻るボタンは小さく上下に余白がある', () => {
    const archivePage = load(
      '../../../src/pages/blog/[year]/[month]/index.astro'
    );
    expect(archivePage).toMatch(
      /\.archive-header\s*\{[^}]*margin-top:\s*0[^}]*margin-bottom:\s*var\(--space-md\)/
    );
    expect(archivePage).toMatch(
      /\.archive-header\s+\.btn\s*\{[^}]*font-size:\s*var\(--font-size-sm\)/
    );
  });

  it('ブログ詳細ページはcontainerとBentoカードラッパーで整形されている', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toContain('class="container"');
    expect(detailPage).toContain('content-wrapper card-glass');
  });

  it('ブログ詳細ページはMarkdownテーブルにBentoスタイルを当てる', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).toMatch(/\.content-wrapper\s+:global\(table\)\s*\{/);
    expect(detailPage).toMatch(/\.content-wrapper\s+:global\(th\)/);
    expect(detailPage).toMatch(/\.content-wrapper\s+:global\(td\)/);
    expect(detailPage).toMatch(/border-spacing:\s*0/);
  });

  it('ブログ詳細ページのMarkdownテーブルはtable要素の表示種別を維持する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(table\)\s*\{[^}]*display:\s*block/s
    );
    expect(detailPage).toMatch(
      /\.content-wrapper\s*\{[^}]*overflow-x:\s*auto/s
    );
  });

  it('ブログ詳細ページは本文コンテナとタイトルの幅を追加で制限しない', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).not.toMatch(
      /\.article-body\s+\.container,\s*\.article-footer\s+\.container\s*\{[^}]*max-width:\s*920px/s
    );
    expect(detailPage).not.toMatch(/max-width:\s*12em/);
  });

  it('ブログ詳細ページはインラインコードとpre内コードを別々に整形する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).toMatch(/\.content-wrapper\s+:global\(p code\)/);
    expect(detailPage).toMatch(/\.content-wrapper\s+:global\(pre code\)/);
    expect(detailPage).toMatch(/white-space:\s*pre/);
  });

  it('ブログ詳細ページのインラインコードは狭い画面で折り返せる', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(p code\),[\s\S]*?white-space:\s*nowrap/
    );
    expect(detailPage).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it('ブログ詳細ページのadmonitionはカード化せず控えめな単一カラムで表示する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(detailPage).toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)\s*\{[^}]*grid-template-columns:\s*1fr/s
    );
    expect(detailPage).not.toContain('--admonition-icon-url');
    expect(detailPage).not.toMatch(/mask:\s*var\(--admonition-icon-url\)/);
    expect(detailPage).toMatch(
      /\.content-wrapper\s+:global\(\.admonition p\),\s*\.content-wrapper\s+:global\(\.admonition ul\),\s*\.content-wrapper\s+:global\(\.admonition ol\)\s*\{[^}]*grid-column:\s*1/s
    );
    expect(detailPage).toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)\s*\{[^}]*border-left:\s*2px solid var\(--admonition-color\)[^}]*background:\s*transparent[^}]*box-shadow:\s*none/s
    );
    expect(detailPage).toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)::before\s*\{[^}]*content:\s*attr\(data-label\)[^}]*display:\s*block[^}]*margin-bottom:\s*var\(--space-xs\)/s
    );
    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)\s*\{[^}]*border-radius:/s
    );
    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)::before\s*\{[^}]*border-radius:/s
    );
    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)::after\s*\{/s
    );
    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)::(?:before|after)\s*\{[^}]*text-transform:\s*uppercase/s
    );
    expect(detailPage).not.toMatch(
      /\.content-wrapper\s+:global\(\.admonition\)::(?:before|after)\s*\{[^}]*letter-spacing:\s*0\.08em/s
    );
  });

  it('ブログ詳細のタグpillが小さめのフォントサイズで表示される', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toMatch(
      /\.tag\s*\{[^}]*font-size:\s*var\(--font-size-xs\)/
    );
  });

  it('ブログ詳細の「ブログ一覧に戻る」ボタンがコンパクトなスタイル', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toMatch(/\.breadcrumb\s*\.btn\s*\{/);
    expect(detailPage).toMatch(/font-size:\s*var\(--font-size-sm\)/);
  });

  it('ブログ詳細ページは記事ごとの感想吹き出しを条件付きで表示する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toContain('impression');
    expect(detailPage).toContain('author-impression');
    expect(detailPage).toMatch(/\{\s*impression\s*&&\s*\(/);
  });

  it('感想吹き出しはpenpenguinのGitHubプロフィール画像を参照する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toContain('https://github.com/penpenguin.png');
    expect(detailPage).toContain('author-impression__avatar');
  });

  it('感想吹き出しはしっぽを描画しない', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).not.toMatch(/\.author-impression__content::before\s*\{/);
    expect(detailPage).not.toMatch(/\.author-impression__content::after\s*\{/);
  });

  it('吹き出し本体にしっぽ用スタイルを残さない', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).not.toMatch(
      /\.author-impression__content\s*\{[^}]*clip-path:\s*polygon\(0\s+50%,\s*100%\s+0,\s*100%\s+100%\)/
    );
    expect(detailPage).not.toMatch(
      /\.author-impression__content\s*\{[^}]*border-right:\s*0/
    );
  });

  it('感想吹き出しのアイコンは44pxの丸で表示される', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
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

  it('感想吹き出し本体はBentoカードに近いトークンで表示される', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*background:\s*var\(--bento-card-bg\)/
    );
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*border:\s*1px\s+solid\s+var\(--glass-border\)/
    );
    expect(detailPage).toMatch(
      /\.author-impression__content\s*\{[^}]*box-shadow:\s*var\(--shadow-sm\)/
    );
  });

  it('スマホでも感想のアイコンと吹き出しは横並びを維持する', () => {
    const detailPage = load(
      '../../../src/pages/blog/[year]/[month]/[slug].astro'
    );
    expect(detailPage).not.toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.author-impression\s*\{[^}]*grid-template-columns:\s*1fr/
    );
  });
});
