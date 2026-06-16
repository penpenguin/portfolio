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

    for (const selector of [
      '.bento-card--intro',
      '.bento-card--project',
      '.bento-card--blog',
      '.bento-card--playground',
    ]) {
      const rule = getRule(source, selector);
      expect(rule).toContain('background: var(--bento-card-bg)');
      expect(rule).not.toContain('linear-gradient');
      expect(rule).not.toContain('radial-gradient');
    }
  });

  it('career overview Bento cards use quiet surfaces instead of loud gradients', () => {
    const source = readPage('../../../src/pages/career.astro');

    for (const selector of [
      '.career-card--hero',
      '.career-card--experience',
      '.career-card--stack',
    ]) {
      const rule = getRule(source, selector);
      expect(rule).toContain('background: var(--bento-card-bg)');
      expect(rule).not.toContain('linear-gradient');
      expect(rule).not.toContain('radial-gradient');
    }
  });

  it('blog Bento cards use quiet surfaces while fallback visuals keep their original art', () => {
    for (const path of [
      '../../../src/pages/blog/index.astro',
      '../../../src/pages/blog/[year]/[month]/index.astro',
    ]) {
      const source = readPage(path);

      for (const selector of ['.post-card--featured', '.archive-panel']) {
        const rule = getRule(source, selector);
        expect(rule).not.toContain('linear-gradient');
        expect(rule).not.toContain('radial-gradient');
      }

      const fallback = getRule(source, '.post-visual--fallback');
      expect(fallback).toContain(
        'linear-gradient(135deg, rgba(14, 165, 233, 0.14), transparent 44%)'
      );

      const fallbackArt = getRule(source, '.post-visual__art');
      expect(fallbackArt).toContain('radial-gradient(');
      expect(fallbackArt).toContain('linear-gradient(');
    }
  });
});
