import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readPage = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf-8');

const getRule = (source: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, 's'));
  return match?.[0] ?? '';
};

describe('Bento surface polish', () => {
  it('home Bento cards use quiet surfaces instead of loud gradients', () => {
    const source = readPage('../../../src/pages/index.astro');

    expect(getRule(source, '.bento-card--intro')).toContain(
      'background: var(--about-bg)'
    );

    for (const selector of ['.bento-card--project', '.bento-card--blog']) {
      const rule = getRule(source, selector);
      expect(rule).toContain('background: var(--bento-card-bg)');
      expect(rule).not.toContain('linear-gradient');
      expect(rule).not.toContain('radial-gradient');
    }
    expect(getRule(source, '.bento-card--device')).toContain(
      'background: var(--bento-muted-bg)'
    );
  });

  it('blog Bento cards use quiet surfaces with a shared thumbnail fallback', () => {
    for (const path of [
      '../../../src/pages/blog/index.astro',
      '../../../src/pages/blog/[year]/[month]/index.astro',
    ]) {
      const source = readPage(path);

      const featured = getRule(source, '.post-card--featured');
      expect(featured).not.toContain('linear-gradient');
      expect(featured).not.toContain('radial-gradient');

      expect(source).toContain('<BlogThumbnail');
      expect(source).not.toMatch(/(?:linear|radial)-gradient/);
    }

    const archive = getRule(
      readPage('../../../src/components/BlogArchive.astro'),
      '.archive-panel'
    );
    expect(archive).toContain('background: var(--bento-card-bg)');
    expect(archive).not.toContain('gradient');
  });
});
