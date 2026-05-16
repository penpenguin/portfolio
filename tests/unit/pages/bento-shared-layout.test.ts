import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pages = [
  '../../../src/pages/index.astro',
  '../../../src/pages/about.astro',
  '../../../src/pages/projects/index.astro',
  '../../../src/pages/blog/index.astro',
  '../../../src/pages/career.astro',
  '../../../src/pages/contact.astro',
];

const load = (path: string) =>
  readFileSync(new URL(path, import.meta.url), 'utf-8');

describe('Bento shared layout usage', () => {
  it.each(pages)('%s uses shared page shell and hero classes', (path) => {
    const source = load(path);

    expect(source).toContain('page-shell');
    expect(source).toContain('bento-hero');
    expect(source).toContain('bento-eyebrow');
  });

  it('home uses the shared bento grid and panels', () => {
    const source = load('../../../src/pages/index.astro');

    expect(source).toContain('class="bento-grid');
    expect(source).toContain('bento-panel');
  });
});
