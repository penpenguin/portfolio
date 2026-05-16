import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const layoutPath = resolve(currentDir, '../../../src/layouts/Layout.astro');

function loadLayoutSource(): string {
  return readFileSync(layoutPath, 'utf-8');
}

describe('Layout footer copy', () => {
  it('brands the footer copyright with penpenguin', () => {
    expect(loadLayoutSource()).toMatch(
      /&copy;\s*\{new Date\(\)\.getFullYear\(\)\}\s*penpenguin\./
    );
  });

  it('does not mention Astro build messaging in the footer', () => {
    expect(loadLayoutSource()).not.toContain('Built with Astro');
  });
});
