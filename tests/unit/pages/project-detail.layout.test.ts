import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectDetailPath = resolve(
  currentDir,
  '../../../src/pages/projects/[...slug].astro'
);

function loadProjectDetailSource(): string {
  return readFileSync(projectDetailPath, 'utf-8');
}

describe('Project detail layout', () => {
  it('keeps searchable content in a div beneath the Layout main landmark', () => {
    const source = loadProjectDetailSource();
    expect(source).toMatch(
      /<div class="project-content">\s*<div class="container">\s*<div[^>]*data-pagefind-body>\s*<Content \/>\s*<\/div>\s*<\/div>\s*<\/div>/s
    );
    expect(source).not.toMatch(/<main\b|role="main"/);
  });

  it('falls back to a centered single-column layout when no hero image is provided', () => {
    const source = loadProjectDetailSource();
    expect(source).toContain(
      'const heroImage = project.data.heroImage?.trim();'
    );
    expect(source).toContain('{heroImage && (');
    expect(source).toContain('src={heroImage}');
    expect(source).toMatch(
      /const projectHeroClass = heroImage\s*\?\s*'project-hero'\s*:\s*'project-hero project-hero--single';/
    );
    expect(source).toMatch(
      /<div class=\{`bento-hero \$\{projectHeroClass\} card-glass`\}>/
    );
    expect(source).toMatch(
      /\.project-hero--single\s*\{\s*grid-template-columns:\s*1fr;?/s
    );
    expect(source).toMatch(
      /\.project-hero--single\s*\{\s*[^}]*text-align:\s*center/
    );
    expect(source).toMatch(
      /\.project-hero--single\s*\{\s*[^}]*justify-items:\s*center/
    );
    expect(source).toMatch(
      /\.project-hero--single\s+\.project-info\s*\{\s*align-items:\s*center/
    );
    expect(source).toMatch(
      /\.project-hero--single\s+\.project-links\s*\{\s*justify-content:\s*center/
    );
  });

  it('renders Astro 6 content layer project entries by id', () => {
    const source = loadProjectDetailSource();

    expect(source).toContain(
      "import { getCollection, render } from 'astro:content';"
    );
    expect(source).toContain('params: { slug: project.id }');
    expect(source).toContain('const { Content } = await render(project);');
    expect(source).not.toContain('project.slug');
    expect(source).not.toContain('project.render()');
  });

  it('reserves a 16:10 shared thumbnail and preserves foreground search metadata', () => {
    const source = loadProjectDetailSource();
    expect(source).toMatch(
      /<BlogThumbnail[^>]*tone="original"[^>]*loading="eager"[^>]*pagefindImage/s
    );
    expect(source).toMatch(
      /\.project-image\s*\{[^}]*--thumbnail-height:\s*auto/s
    );
    expect(source).toMatch(
      /\.project-image\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10/s
    );
    expect(source).toMatch(
      /\.project-image\s*\{[^}]*border:\s*1px solid var\(--border-editorial\)/s
    );
  });
});

it('keeps non-interactive detail tags on the editorial border', () => {
  expect(loadProjectDetailSource()).toMatch(
    /\.tag\s*\{[^}]*border:\s*1px solid var\(--border-editorial\)/s
  );
});
