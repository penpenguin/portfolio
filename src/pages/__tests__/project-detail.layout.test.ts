import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectDetailPath = resolve(currentDir, '../projects/[...slug].astro');

function loadProjectDetailSource(): string {
  return readFileSync(projectDetailPath, 'utf-8');
}

describe('Project detail layout', () => {
  it('falls back to a centered single-column layout when no hero image is provided', () => {
    const source = loadProjectDetailSource();
    expect(source).toContain("import { withBase } from '../../utils/withBase'");
    expect(source).toContain('src={withBase(project.data.heroImage)}');
    expect(source).toMatch(
      /const projectHeroClass = project\.data\.heroImage\s*\?\s*'project-hero'\s*:\s*'project-hero project-hero--single';/
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
});
