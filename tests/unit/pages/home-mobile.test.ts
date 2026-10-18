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

const getRule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = page.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, 's'));
  return match?.[0] ?? '';
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

  it('Home上段のAbout Heroのコピーとサイズを維持する', () => {
    expect(page).toContain('About');
    expect(page).toContain(
      'Memos on systems, tools, and everyday experiments.'
    );
    expect(page).not.toContain('Enterprise Systems Programmer');
    expect(page).not.toContain('Enterprise systems, shipped end-to-end');
    expect(page).not.toContain('class="lead"');
    expect(page).not.toContain(
      '社内システムの要件定義、Webアプリケーション実装、クラウド基盤、運用改善まで。'
    );
    expect(page).not.toContain(
      '要件定義から運用改善まで、長期運用される業務システムを支援。'
    );
    const introRule = getRule('.bento-card--intro');
    expect(introRule).not.toContain('align-self: start');
    expect(introRule).toContain('min-height: auto');
    expect(introRule).not.toContain('min-height: 390px');

    const heroHeadingRule = getRule('.bento-card h1');
    expect(heroHeadingRule).toContain('font-size: 5.25rem');
    expect(heroHeadingRule).toContain('line-height: 0.95');
  });

  it('HomeはProjectsとBlogを主要導線として表示する', () => {
    expect(page).not.toContain('どんな人か');
    expect(page).not.toContain("href: '/about'");
    expect(page).not.toContain('href="/about"');
    expect(page).not.toContain("href: '/career'");
    expect(page).not.toContain('href="/career"');
    expect(page).not.toContain('経歴と技術スタック');
    expect(page).not.toContain(
      '経験年数、技術スタック、担当領域、プロジェクト履歴を確認できます。'
    );
    expect(page).toContain('href="/projects"');
    expect(page).toContain('href="/blog"');
    expect(page).not.toContain('Featured Project');
    expect(page).not.toContain('Featured Article');
    expect(page).not.toContain('相談・連絡する');
    expect(page).not.toContain("href: '/contact'");
  });

  it('HomeからCareer概要カードを削除する', () => {
    expect(page).not.toContain('overview-card--career');
    expect(page).not.toContain('overviewCards.map');
    expect(page).not.toContain('Career summary');
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

  it('BlogプレビューカードはProjectsの後に配置する', () => {
    const projectIndex = page.indexOf('bento-card--project');
    const blogIndex = page.indexOf('bento-card--blog');

    expect(projectIndex).toBeGreaterThan(-1);
    expect(blogIndex).toBeGreaterThan(projectIndex);
  });

  it('夜景と経験年数のタイルを削除する', () => {
    expect(page.match(/bento-card--(?:playground|metric)/g)).toBeNull();
    expect(
      page.match(/window-scene|meaningless-night-window\.webp/g)
    ).toBeNull();
    expect(page.match(/10\+|years building systems/g)).toBeNull();
  });

  it('Aboutの直後に操作できる水槽アプリを埋め込む', () => {
    const aquarium =
      page.match(
        /<section\b[^>]*bento-card--aquarium[^>]*>[\s\S]*?<\/section>/
      )?.[0] ?? '';
    const iframe = aquarium.match(/<iframe\b[^>]*>/)?.[0] ?? '';

    expect(iframe).toContain(
      'src="https://penpenguin.github.io/suiren-aquarium/"'
    );
    expect(iframe).toContain('title="水縁 — SUIREN"');
    expect(iframe).toContain('loading="eager"');
    expect(iframe).toContain('allow="fullscreen"');
    expect(iframe).toContain('allowfullscreen');
    expect(page.indexOf(aquarium)).toBeGreaterThan(
      page.indexOf('bento-card--intro')
    );
    expect(page.indexOf(aquarium)).toBeLessThan(
      page.indexOf('bento-card--project')
    );
  });

  it('HomeのBentoセルをProjectsとBlog表示に整理する', () => {
    expect(page).not.toContain('<h3>社内システム開発</h3>');
    expect(page).not.toContain('<h3>フルスタック開発</h3>');
    expect(page).not.toContain('<h3>CI/CD・自動化</h3>');
    expect(page).not.toContain('tile-number');
    expect(page).not.toContain('Core Stack');
    expect(page).toContain('class="bento-grid home-overview-grid"');
    expect(page).not.toContain('overview-card');
    expect(page).not.toContain('const overviewCards = [');
  });

  it('水槽のスクリプトだけを許可し、親ページへの同一オリジンアクセスを許可しない', () => {
    const iframe = page.match(/<iframe\b[^>]*>/)?.[0] ?? '';
    const sandbox = iframe.match(/\bsandbox="([^"]*)"/)?.[1];

    expect(sandbox?.split(/\s+/)).toEqual(['allow-scripts']);
  });
});
