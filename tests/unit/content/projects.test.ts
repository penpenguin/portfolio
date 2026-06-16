import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const readProject = (slug: string) =>
  readFileSync(
    new URL(`../../../src/content/projects/${slug}.md`, import.meta.url),
    'utf-8'
  );

const loadConfig = () =>
  readFileSync(resolve(currentDir, '../../../src/content.config.ts'), 'utf-8');

const hashFile = (path: string) =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

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

  it('PDF Redactorのプロジェクトページが存在し公開リンクを含む', () => {
    const content = readProject('pdf-redactor');
    expect(content).toMatch(/title:\s*'PDF Redactor/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/pdf-redactor'/
    );
    expect(content).toMatch(
      /link:\s*'https:\/\/penpenguin\.github\.io\/pdf-redactor\/'/
    );
    expect(content).toMatch(/tags:\s*\[[^\]]*'React'[^\]]*'PDFium'[^\]]*]/);
  });

  it('Bookmarklet Exporterのプロジェクトページが存在し公開リンクを含む', () => {
    const content = readProject('bookmarklet-exporter');
    expect(content).toMatch(/title:\s*'Bookmarklet Exporter/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/bookmarklet-exporter'/
    );
    expect(content).toMatch(
      /link:\s*'https:\/\/penpenguin\.github\.io\/bookmarklet-exporter\/'/
    );
    expect(content).toMatch(
      /tags:\s*\[[^\]]*'Astro'[^\]]*'Monaco Editor'[^\]]*]/
    );
  });

  it('Card Lighting Demoのプロジェクトページが存在し公開リンクを含む', () => {
    const content = readProject('card-lighting-demo');
    expect(content).toMatch(/title:\s*'Card Lighting Demo/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/card-lighting-demo'/
    );
    expect(content).toMatch(
      /link:\s*'https:\/\/penpenguin\.github\.io\/card-lighting-demo\/'/
    );
    expect(content).toMatch(/tags:\s*\[[^\]]*'Astro'[^\]]*'Tweakpane'[^\]]*]/);
  });

  it('Fake Kirdyのプロジェクトページが存在し公開リンクを含む', () => {
    const content = readProject('fake-kirdy');
    expect(content).toMatch(/title:\s*'Fake Kirdy/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/fake-kirdy'/
    );
    expect(content).toMatch(
      /link:\s*'https:\/\/penpenguin\.github\.io\/fake-kirdy\/'/
    );
    expect(content).toMatch(
      /tags:\s*\[[^\]]*'Phaser'[^\]]*'Matter\.js'[^\]]*]/
    );
  });

  it('Meaninglessの公開スクリーンショットを最新キャプチャに更新している', () => {
    const imagePath = resolve(
      currentDir,
      '../../../public/assets/projects/meaningless.webp'
    );

    expect(hashFile(imagePath)).toBe(
      'f80648bccec39d6f99f652141527fd43f69327eaeb41dae41620bc38cc89b053'
    );
  });

  it('Bonsai Boxのプロジェクトページが存在し公開リンクを含む', () => {
    const content = readProject('bonsai-box');
    expect(content).toMatch(/title:\s*'Bonsai Box/);
    expect(content).toMatch(
      /github:\s*'https:\/\/github\.com\/penpenguin\/bonsai-box'/
    );
    expect(content).toMatch(
      /link:\s*'https:\/\/penpenguin\.github\.io\/bonsai-box\/'/
    );
    expect(content).toMatch(/tags:\s*\[[^\]]*'Three\.js'[^\]]*'Vite'[^\]]*]/);
  });

  it('Astro 6 content loaderでprojects collectionを定義する', () => {
    const config = loadConfig();

    expect(config).toMatch(/const\s+projects\s*=\s*defineCollection\(\{/);
    expect(config).toMatch(/base:\s*['"]\.\/src\/content\/projects['"]/);
    expect(config).toMatch(/pattern:\s*['"]\*\*\/\*\.md['"]/);
  });

  it('公開ページを持つプロジェクトに公開用スクリーンショットをheroImageとして設定する', () => {
    const projectDir = resolve(currentDir, '../../../src/content/projects');
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
