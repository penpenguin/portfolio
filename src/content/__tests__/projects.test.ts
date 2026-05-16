import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

  it('公開ページを持つプロジェクトに公開用スクリーンショットをheroImageとして設定する', () => {
    const projectDir = resolve(currentDir, '../projects');
    const publicDir = resolve(currentDir, '../../../public');
    const entries = readdirSync(projectDir).filter((file) =>
      file.endsWith('.md')
    );

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      const content = readFileSync(resolve(projectDir, entry), 'utf-8');
      const match = content.match(/heroImage:\s*'([^']+)'/);

      if (entry === 'petatas.md') {
        expect(
          match,
          'petatas should use the fallback project visual'
        ).toBeNull();
        continue;
      }

      expect(match, `${entry} should define heroImage`).not.toBeNull();
      expect(match?.[1]).toMatch(/^\/assets\/projects\/.+\.webp$/);
      expect(existsSync(resolve(publicDir, match?.[1].slice(1) ?? ''))).toBe(
        true
      );
    }
  });
});
