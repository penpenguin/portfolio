import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const layoutPath = resolve(currentDir, '../Layout.astro');

function loadLayoutSource(): string {
  return readFileSync(layoutPath, 'utf-8');
}

describe('Layout favicon link', () => {
  it('uses the base-aware helper for the favicon asset', () => {
    expect(loadLayoutSource()).toMatch(/withBase\(['"]\/favicon\.svg['"]\)/);
  });

  it('does not hardcode a root-relative favicon path', () => {
    expect(loadLayoutSource()).not.toContain('href="/favicon.svg"');
  });
});
