import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pages = [
  '../index.astro',
  '../about.astro',
  '../projects/index.astro',
  '../blog/index.astro',
  '../career.astro',
  '../contact.astro',
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
    const source = load('../index.astro');

    expect(source).toContain('class="bento-grid');
    expect(source).toContain('bento-panel');
  });
});
