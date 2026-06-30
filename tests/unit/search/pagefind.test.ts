import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) =>
  readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf-8');

describe('Pagefind search integration', () => {
  it('runs Pagefind after the Astro production build', () => {
    const packageJson = JSON.parse(readSource('package.json')) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.devDependencies).toHaveProperty('pagefind');
    expect(packageJson.scripts.build).toBe(
      'astro build && pagefind --site dist'
    );
    expect(packageJson.scripts['preview:search']).toBe(
      'npm run build && astro preview'
    );
  });

  it('loads the Pagefind Component UI through base-aware asset paths', () => {
    const layout = readSource('src/layouts/Layout.astro');

    expect(layout).toContain(
      "withBase('/pagefind/pagefind-component-ui.css')"
    );
    expect(layout).toContain("withBase('/pagefind/pagefind-component-ui.js')");
    expect(layout).toContain("withBase('/pagefind/')");
    expect(layout).toContain("withBase('/')");
    expect(layout).toContain('<pagefind-config');
    expect(layout).toContain('bundle-path={pagefindBundlePath}');
    expect(layout).toContain('base-url={pagefindBaseUrl}');
    expect(layout).toMatch(/<pagefind-modal\s+reset-on-close/);
    expect(layout).toContain('<pagefind-modal-trigger');
    expect(layout).toContain('shortcut="mod+k"');
    expect(layout).toContain('hide-shortcut');
    expect(layout).toMatch(
      /<pagefind-modal-trigger\s+class="search-trigger"/
    );
    expect(layout).not.toMatch(
      /<pagefind-modal-trigger[^>]*class="[^"]*\bnav-link\b/
    );
  });

  it('keeps Pagefind modal utilities alive across Astro view transitions', () => {
    const layout = readSource('src/layouts/Layout.astro');

    expect(layout).toMatch(
      /<pagefind-config\b[^>]*transition:persist[^>]*transition:animate="none"[^>]*>/s
    );
    expect(layout).toMatch(
      /<pagefind-modal\b[^>]*transition:persist[^>]*transition:animate="none"[^>]*>/s
    );
  });

  it('aligns the search trigger with the other header navigation items', () => {
    const layout = readSource('src/layouts/Layout.astro');

    expect(layout).toMatch(
      /\.nav-links\s*\{[^}]*align-items:\s*stretch/s
    );
    expect(layout).toContain(
      ':global(:is(*, #\\#):is(*, #\\#):is(*, #\\#) .search-trigger .pf-trigger-btn)'
    );
    expect(layout).toMatch(
      /:global\([\s\S]*?\.search-trigger \.pf-trigger-btn\)\s*\{[^}]*padding:\s*var\(--space-xs\) var\(--space-sm\)/s
    );
    expect(layout).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*:global\([\s\S]*?\.search-trigger \.pf-trigger-btn\)\s*\{[^}]*padding:\s*var\(--space-2xs\) var\(--space-xs\)/s
    );
  });

  it('indexes only the Blog detail content with metadata and filters', () => {
    const blogDetail = readSource(
      'src/pages/blog/[year]/[month]/[slug].astro'
    );

    expect(blogDetail).toContain(
      "import { withBase } from '../../../../utils/withBase';"
    );
    expect(blogDetail).toMatch(
      /<article class="blog-article" data-pagefind-filter="type:Blog">/
    );
    expect(blogDetail).toContain('data-pagefind-meta={`title, date:');
    expect(blogDetail).toContain(
      'class="article-description" data-pagefind-meta="description"'
    );
    expect(blogDetail).toMatch(
      /<span class="tag" data-pagefind-filter="tag">\s*\{tag\}\s*<\/span>/
    );
    expect(blogDetail).toMatch(
      /<div class="bento-panel content-wrapper card-glass" data-pagefind-body>/
    );
    expect(blogDetail).toContain('src={withBase(heroImage)}');
    expect(blogDetail).toContain(
      'data-pagefind-meta="image[src], image_alt[alt]"'
    );
  });

  it('indexes only the Project detail content with metadata and filters', () => {
    const projectDetail = readSource('src/pages/projects/[...slug].astro');

    expect(projectDetail).toMatch(
      /<article class="project-detail" data-pagefind-filter="type:Project">/
    );
    expect(projectDetail).toContain('data-pagefind-meta={`title, date:');
    expect(projectDetail).toContain(
      'class="project-description" data-pagefind-meta="description"'
    );
    expect(projectDetail).toMatch(
      /<span class="tag" data-pagefind-filter="tag">\s*\{tag\}\s*<\/span>/
    );
    expect(projectDetail).toMatch(
      /<div class="bento-panel content-wrapper card-glass" data-pagefind-body>/
    );
    expect(projectDetail).toContain(
      'data-pagefind-meta="image[src], image_alt[alt]"'
    );
  });
});
