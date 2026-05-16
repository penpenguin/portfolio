import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const load = (relativePath: string): string =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('Projects pages date localization', () => {
  it('project list uses formatDate for published date', () => {
    const source = load('../../../src/pages/projects/index.astro');

    expect(source).toContain(
      "import { formatDate } from '../../utils/formatDate';"
    );
    expect(source).toMatch(/formatDate\(project\.data\.pubDate\)/);
  });

  it('project detail uses formatDate for published and updated dates', () => {
    const source = load('../../../src/pages/projects/[...slug].astro');

    expect(source).toContain(
      "import { formatDate } from '../../utils/formatDate';"
    );
    expect(source).toMatch(/formatDate\(project\.data\.pubDate\)/);
    expect(source).toMatch(/formatDate\(project\.data\.updatedDate\)/);
  });
});
