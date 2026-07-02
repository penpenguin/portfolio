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

  it('Home上段はAbout Heroと経験カードを表示する', () => {
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
    expect(page).toContain('10+');
    expect(page).not.toContain('years in production systems');
    expect(page).toContain('years building systems');
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--metric card-glass"'
    );

    const metricRule = getRule('.bento-card--metric');
    expect(metricRule).not.toContain('align-self: start');
    expect(metricRule).toContain('min-height: auto');

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

  it('Meaninglessは常時表示の動く窓シーンとして見せる', () => {
    expect(page).toContain('Meaningless');
    expect(page).not.toContain("title: 'Meaningless'");
    expect(page).not.toContain('<h2 class="playground-title">');
    expect(page).not.toContain('.playground-title');
    expect(page).not.toContain('Browser Oddities');
    expect(page).not.toContain('Fake Kirdy');
    expect(page).not.toContain('Phaser / Matter.js');
    expect(page).not.toContain('playground-copy');
    expect(page).toContain(
      'class="bento-panel bento-card bento-card--playground card-glass"'
    );
    expect(page).toContain('aria-label="Meaningless window scene"');
    expect(page).toContain('meaningless-night-window.webp');
    expect(page).not.toContain('fake-kirdy.webp');
    expect(page).toContain('withBase(playground.previewImage)');
    expect(page).not.toContain('data-game-src={playground.gameUrl}');
    expect(page).not.toContain(
      "gameUrl: 'https://penpenguin.github.io/meaningless/'"
    );
    expect(page).not.toContain('playground-actions');
    expect(page).not.toContain('別タブで開く');
    expect(page).not.toContain('https://penpenguin.github.io/fake-kirdy/');
    expect(page).not.toMatch(/<iframe[\s\S]*meaningless/);
    expect(page).not.toContain('frame.className =');
    expect(page).not.toContain('const setupPlayground = () =>');
    expect(page).not.toContain('data-playground-toggle');
    expect(page).not.toContain('aria-label="Meaninglessを再生"');
    expect(page).toContain('alt="Window view of Meaningless at night"');
    expect(page).toContain('class="window-scene"');
    expect(page).toContain('class="window-scene__image"');
    expect(page).toContain('class="window-scene__mullion"');
    expect(page).toContain('class="window-scene__city-lights"');
    expect(page).toContain('class="window-scene__road-lights"');
    expect(page).toContain('class="window-scene__tail-lamps"');
    expect(page).toContain(
      'class="window-scene__tail-lamps-track window-scene__tail-lamps-track--near"'
    );
    expect(page).toContain(
      'class="window-scene__tail-lamps-track window-scene__tail-lamps-track--bend"'
    );
    expect(page).toContain(
      'class="window-scene__tail-lamps-track window-scene__tail-lamps-track--far"'
    );
    expect(page).toContain('class="window-scene__aircraft-beacons"');
    expect(page).toContain('class="window-scene__tree-line"');
    expect(page).toContain('class="window-scene__skyline-glow"');
    expect(page).not.toContain('city-drift');
    expect(page).not.toContain('trees-sway');
    expect(page).not.toContain('skyline-breathe');
    expect(page).not.toContain('infinite alternate');
    expect(page).toMatch(/\.bento-card--playground\s*{[\s\S]*gap:\s*0/);
    expect(page).toMatch(
      /\.window-scene::before\s*{[\s\S]*animation:\s*glass-reflection/
    );
    expect(page).toMatch(
      /\.window-scene::after\s*{[\s\S]*animation:\s*night-vignette/
    );
    expect(page).toMatch(
      /\.window-scene__image\s*{[\s\S]*animation:\s*city-pan/
    );
    expect(page).toMatch(
      /\.window-scene__skyline-glow\s*{[\s\S]*animation:\s*city-bloom/
    );
    expect(page).toMatch(
      /\.window-scene__city-lights\s*{[\s\S]*animation:\s*lights-glimmer/
    );
    expect(page).toMatch(
      /\.window-scene__city-lights\s*{[\s\S]*circle at 61% 47%/
    );
    expect(page).toMatch(
      /\.window-scene__city-lights\s*{[\s\S]*circle at 72% 51%/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights\s*{[\s\S]*animation:\s*road-lights 7\.6s/
    );
    expect(page).toMatch(/\.window-scene__road-lights\s*{[\s\S]*bottom:\s*16%/);
    expect(page).toMatch(/\.window-scene__road-lights\s*{[\s\S]*left:\s*29%/);
    expect(page).toMatch(
      /\.window-scene__road-lights\s*{[\s\S]*transform:\s*rotate\(-10deg\) skewX\(-24deg\)/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights\s*{[\s\S]*transform-origin:\s*12% 60%/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights::before\s*{[\s\S]*animation:\s*road-headlights 4\.2s/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights::before\s*{[\s\S]*top:\s*34%/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights::after\s*{[\s\S]*animation:\s*road-tail-lights 4\.8s/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights::after\s*{[\s\S]*top:\s*55%/
    );
    expect(page).toMatch(
      /\.window-scene__road-lights\s*{[\s\S]*opacity:\s*0\.34/
    );
    expect(page).not.toMatch(
      /\.window-scene__tail-lamps\s*{[\s\S]*animation:\s*tail-lamps-flow 6\.8s linear infinite/
    );
    expect(page).not.toContain('@keyframes tail-lamps-flow');
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--near\s*{[\s\S]*animation:\s*tail-lamps-near-flow 7\.4s linear infinite/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--near\s*{[\s\S]*rgba\(255, 52, 52, 0\.58\) 0 1\.1px/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--bend\s*{[\s\S]*animation:\s*tail-lamps-bend-flow 8\.8s linear infinite/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--bend\s*{[\s\S]*transform:\s*rotate\(-18deg\) skewX\(-18deg\)/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--bend\s*{[\s\S]*rgba\(255, 52, 52, 0\.46\) 0 0\.85px/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--far\s*{[\s\S]*animation:\s*tail-lamps-far-flow 10\.2s linear infinite/
    );
    expect(page).toMatch(
      /\.window-scene__tail-lamps-track--far\s*{[\s\S]*rgba\(255, 52, 52, 0\.32\) 0 0\.65px/
    );
    expect(page).toMatch(
      /\.window-scene__aircraft-beacons\s*{[\s\S]*animation:\s*beacon-blink 2\.8s steps\(1, end\) infinite/
    );
    expect(page).toMatch(
      /\.window-scene__aircraft-beacons\s*{[\s\S]*circle at 60\.5% 43%/
    );
    expect(page).toMatch(
      /\.window-scene__aircraft-beacons\s*{[\s\S]*rgba\(255, 42, 42, 0\.95\)/
    );
    expect(page).toMatch(
      /\.window-scene__aircraft-beacons::after\s*{[\s\S]*animation:\s*beacon-blink 3\.4s steps\(1, end\) infinite/
    );
    expect(page).toMatch(
      /@keyframes road-headlights\s*{[\s\S]*translate3d\(-18%, 0, 0\)[\s\S]*translate3d\(28%, 0, 0\)/
    );
    expect(page).toMatch(
      /@keyframes road-tail-lights\s*{[\s\S]*translate3d\(24%, 0, 0\)[\s\S]*translate3d\(-22%, 0, 0\)/
    );
    expect(page).toMatch(
      /@keyframes tail-lamps-near-flow\s*{[\s\S]*translate3d\(-10%, 0, 0\)[\s\S]*translate3d\(18%, 0, 0\)/
    );
    expect(page).toMatch(
      /@keyframes tail-lamps-bend-flow\s*{[\s\S]*translate3d\(-8%, 0, 0\)[\s\S]*translate3d\(14%, -8%, 0\)/
    );
    expect(page).toMatch(
      /@keyframes tail-lamps-far-flow\s*{[\s\S]*translate3d\(-6%, 0, 0\)[\s\S]*translate3d\(10%, -3%, 0\)/
    );
    expect(page).toMatch(
      /@keyframes beacon-blink\s*{[\s\S]*opacity:\s*0\.18[\s\S]*opacity:\s*1/
    );
    expect(page).toMatch(
      /\.window-scene__tree-line\s*{[\s\S]*animation:\s*trees-breathe/
    );
    expect(page).toMatch(
      /@keyframes glass-reflection\s*{[\s\S]*translate3d\(-6%, 0, 0\)[\s\S]*translate3d\(5%, -1%, 0\)/
    );
    expect(page).toMatch(
      /@keyframes night-vignette\s*{[\s\S]*opacity:\s*0\.78[\s\S]*opacity:\s*0\.92/
    );
    expect(page).toMatch(
      /@keyframes city-bloom\s*{[\s\S]*opacity:\s*0\.3[\s\S]*opacity:\s*0\.48/
    );
    expect(page).toMatch(
      /@keyframes lights-glimmer\s*{[\s\S]*opacity:\s*0\.66[\s\S]*brightness\(1\.22\)/
    );
    expect(page).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*\.window-scene__city-lights[\s\S]*animation:\s*none/
    );
    expect(page).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*\.window-scene::before[\s\S]*\.window-scene::after[\s\S]*animation:\s*none/
    );
    expect(page).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*\.window-scene__tail-lamps-track--near[\s\S]*\.window-scene__tail-lamps-track--bend[\s\S]*\.window-scene__tail-lamps-track--far[\s\S]*\.window-scene__aircraft-beacons[\s\S]*\.window-scene__aircraft-beacons::after[\s\S]*animation:\s*none/
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
});
