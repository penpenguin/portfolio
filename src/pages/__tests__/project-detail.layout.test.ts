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
    expect(source).toMatch(
      /const projectHeroClass = project\.data\.heroImage\s*\?\s*'project-hero'\s*:\s*'project-hero project-hero--single';/,
    );
    expect(source).toMatch(/<div class=\{projectHeroClass\}>/);
    expect(source).toMatch(
      /\.project-hero--single\s*\{\s*grid-template-columns:\s*1fr;?/s,
    );
    expect(source).toMatch(/\.project-hero--single\s*\{\s*[^}]*text-align:\s*center/);
    expect(source).toMatch(
      /\.project-hero--single\s*\{\s*[^}]*justify-items:\s*center/,
    );
    expect(source).toMatch(
      /\.project-hero--single\s+\.project-info\s*\{\s*align-items:\s*center/,
    );
    expect(source).toMatch(
      /\.project-hero--single\s+\.project-links\s*\{\s*justify-content:\s*center/,
    );
  });
});
