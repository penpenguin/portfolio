import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(
  new URL('../../../src/pages/index.astro', import.meta.url),
  'utf-8'
);

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
    expect(page).toContain('class="bento-grid home-overview-grid"');
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

  it('Home上段は元の職能Heroと経験カードを表示する', () => {
    expect(page).toContain('Enterprise Systems Programmer');
    expect(page).toContain('Enterprise systems, shipped end-to-end');
    expect(page).not.toContain('class="lead"');
    expect(page).not.toContain(
      '社内システムの要件定義、Webアプリケーション実装、クラウド基盤、運用改善まで。'
    );
    expect(page).toContain('10+');
    expect(page).toContain('years in production systems');
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--metric card-glass"'
    );
  });

  it('HomeはAboutとContactを除いた主要導線を表示する', () => {
    expect(page).not.toContain('どんな人か');
    expect(page).toContain('経歴と技術スタック');
    expect(page).not.toContain("href: '/about'");
    expect(page).not.toContain('href="/about"');
    expect(page).toContain('href="/projects"');
    expect(page).toContain('href="/blog"');
    expect(page).toContain("href: '/career'");
    expect(page).toContain(
      '経験年数、技術スタック、担当領域、プロジェクト履歴を確認できます。'
    );
    expect(page).not.toContain('Featured Project');
    expect(page).not.toContain('Featured Article');
    expect(page).not.toContain('相談・連絡する');
    expect(page).not.toContain("href: '/contact'");
  });

  it('経歴と技術スタックカードは右側に空きを作らない幅で配置する', () => {
    expect(page).toContain(
      'class="bento-panel overview-card overview-card--career card-glass"'
    );
    expect(page).toMatch(
      /\.overview-card--career\s*\{[^}]*grid-column:\s*span\s*2/s
    );
    expect(page).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.overview-card\s*\{[^}]*grid-column:\s*span\s*1/s
    );
  });

  it('ProjectsとBlogは最新1件のプレビューカードとして表示する', () => {
    expect(page).toContain("getCollection('projects')");
    expect(page).toContain("getCollection('blog')");
    expect(page).toContain('formatDate');
    expect(page).toContain('sortPublishedPostsByDate');
    expect(page).toContain('latestProject');
    expect(page).toContain('latestPost');
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--project card-glass"'
    );
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--blog card-glass"'
    );
    expect(page).toContain('project-summary');
    expect(page).toContain('project-tags');
    expect(page).toContain('blog-summary');
    expect(page).toContain('blog-tags');
    expect(page).toContain('Blog一覧を見る');
  });

  it('BlogプレビューカードはProjectsの次の行に配置する', () => {
    const projectIndex = page.indexOf('bento-card--project');
    const overviewIndex = page.indexOf('overviewCards.map');
    const blogIndex = page.indexOf('bento-card--blog');

    expect(projectIndex).toBeGreaterThan(-1);
    expect(overviewIndex).toBeGreaterThan(projectIndex);
    expect(blogIndex).toBeGreaterThan(overviewIndex);
  });

  it('Meaninglessは初期表示で読み込まず再生時だけiframeを生成する', () => {
    expect(page).toContain('Meaningless');
    expect(page).not.toContain('Browser Oddities');
    expect(page).not.toContain('Fake Kirdy');
    expect(page).not.toContain('Phaser / Matter.js');
    expect(page).not.toContain('playground-copy');
    expect(page).toContain('bento-card--playground');
    expect(page).toContain('meaningless.webp');
    expect(page).not.toContain('fake-kirdy.webp');
    expect(page).toContain('withBase(playground.previewImage)');
    expect(page).toContain('data-game-src={playground.gameUrl}');
    expect(page).toContain(
      "gameUrl: 'https://penpenguin.github.io/meaningless/'"
    );
    expect(page).not.toContain('https://penpenguin.github.io/fake-kirdy/');
    expect(page).not.toMatch(
      /<iframe[\s\S]*src="https:\/\/penpenguin\.github\.io\/meaningless\//
    );
    expect(page).toMatch(
      /frame\.setAttribute\(\s*'sandbox',\s*'allow-scripts allow-same-origin allow-pointer-lock'\s*\)/
    );
    expect(page).toMatch(
      /\.playground-preview\.is-playing img\s*{[\s\S]*display: none;[\s\S]*}/
    );
    expect(page).toContain("frame.className = 'playground-frame'");
    expect(page).toMatch(
      /:global\(\.playground-frame\)\s*{[\s\S]*inset: 0;[\s\S]*width: 100%;[\s\S]*height: 100%;[\s\S]*z-index: 1;[\s\S]*}/
    );
    expect(page).toMatch(/\.playground-actions\s*{[\s\S]*z-index: 2;[\s\S]*}/);
    expect(page).toContain('aria-label="Meaninglessを再生"');
    expect(page).toContain('class="playground-button__label"');
    expect(page).toContain('class="playground-button__icon"');
    expect(page).toMatch(
      /const closeLabel\s*=\s*playgroundToggle\.dataset\.playgroundCloseLabel\s*\?\?\s*'プレビューを閉じる'/
    );
    expect(page).toContain('data-playground-close-label="Meaninglessを閉じる"');
    expect(page).toContain("frame.setAttribute('title', frameTitle)");
    expect(page).not.toContain("playgroundToggle.textContent = 'Close'");
    expect(page).toContain('const setupPlayground = () =>');
    expect(page).toContain(
      "document.addEventListener('astro:page-load', setupPlayground)"
    );
    expect(page).toContain("playgroundToggle.dataset.playgroundBound = 'true'");
    expect(page).not.toContain(
      "const playgroundCard = document.querySelector('[data-playground-card]')"
    );
    expect(page).toMatch(
      /\.playground-preview\.is-playing \.playground-actions\s*{[\s\S]*top: var\(--space-xs\);[\s\S]*right: var\(--space-xs\);[\s\S]*left: auto;[\s\S]*padding: 0;[\s\S]*}/
    );
    expect(page).toMatch(
      /\.playground-preview\.is-playing \.playground-button\s*{[\s\S]*width: 2\.5rem;[\s\S]*}/
    );
    expect(page).toMatch(
      /\.playground-preview\.is-playing \.playground-button\s*{[\s\S]*height: 2\.5rem;[\s\S]*}/
    );
    expect(page).toMatch(
      /\.playground-preview\.is-playing \.playground-button\s*{[\s\S]*border-radius: 999px;[\s\S]*}/
    );
  });

  it('HomeのBentoセルを概要導線と元のProjects表示に整理する', () => {
    expect(page).not.toContain('<h3>社内システム開発</h3>');
    expect(page).not.toContain('<h3>フルスタック開発</h3>');
    expect(page).not.toContain('<h3>CI/CD・自動化</h3>');
    expect(page).not.toContain('tile-number');
    expect(page).not.toContain('Core Stack');
    expect(page).toContain('class="bento-grid home-overview-grid"');
    expect(page).toContain('overview-card');
    expect(page).toContain('const overviewCards = [');
  });
});
