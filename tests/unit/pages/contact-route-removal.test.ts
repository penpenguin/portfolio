import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) =>
  readFileSync(new URL(`../../../${path}`, import.meta.url), 'utf-8');

describe('Contact route removal', () => {
  it('does not ship a Contact page route', () => {
    expect(
      existsSync(new URL('../../../src/pages/contact.astro', import.meta.url))
    ).toBe(false);
  });

  it.each(['src/layouts/Layout.astro', 'src/pages/blog/index.astro'])(
    '%s does not link to the removed Contact page',
    (path) => {
      expect(readSource(path)).not.toMatch(/['"]\/contact\/?['"]/);
    }
  );
});
