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

  it('balances footer text spacing against the bottom viewport edge', () => {
    const layout = loadLayoutSource();
    expect(layout).toMatch(
      /\.footer\s*{[^}]*padding:\s*var\(--space-lg\)\s+0\s+var\(--space-md\)/s
    );
    expect(layout).toMatch(
      /\.footer-content\s*{[^}]*padding-top:\s*var\(--space-md\)/s
    );
  });
});
