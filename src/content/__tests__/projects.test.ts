import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const readProject = (slug: string) =>
  readFileSync(new URL(`../projects/${slug}.md`, import.meta.url), 'utf-8');

const loadConfig = () =>
  readFileSync(resolve(currentDir, '../../content.config.ts'), 'utf-8');

describe('projects content entries', () => {
  it('cadenzioのプロジェクトページが存在し必要なfrontmatterを含む', () => {
    const content = readProject('cadenzio');
    expect(content).toMatch(/title:\s*'Cadenzio/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/cadenzio'/
    );
    expect(content).toMatch(/tags:\s*\[[^\]]+]/);
  });

  it('PetaTasのプロジェクトページが存在し必要なfrontmatterを含む', () => {
    const content = readProject('petatas');
    expect(content).toMatch(/title:\s*'PetaTas/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/PetaTas'/
    );
    expect(content).toMatch(/description:\s*'/);
  });

  it('Astro 6 content loaderでprojects collectionを定義する', () => {
    const config = loadConfig();

    expect(config).toMatch(/const\s+projects\s*=\s*defineCollection\(\{/);
    expect(config).toMatch(/base:\s*['"]\.\/src\/content\/projects['"]/);
    expect(config).toMatch(/pattern:\s*['"]\*\*\/\*\.md['"]/);
  });
});
