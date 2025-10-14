import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readProject = (slug: string) =>
  readFileSync(new URL(`../projects/${slug}.md`, import.meta.url), 'utf-8');

describe('projects content entries', () => {
  it('cadenzioのプロジェクトページが存在し必要なfrontmatterを含む', () => {
    const content = readProject('cadenzio');
    expect(content).toMatch(/title:\s*'Cadenzio/);
    expect(content).toMatch(/github:\s*'https:\/\/github\.com\/penpenguin\/cadenzio'/);
    expect(content).toMatch(/tags:\s*\[[^\]]+]/);
  });

  it('PetaTasのプロジェクトページが存在し必要なfrontmatterを含む', () => {
    const content = readProject('petatas');
    expect(content).toMatch(/title:\s*'PetaTas/);
    expect(content).toMatch(/github:\s*'https:\/\/github\.com\/penpenguin\/PetaTas'/);
    expect(content).toMatch(/description:\s*'/);
  });
});
