import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const layoutPath = resolve(currentDir, '../Layout.astro');

function loadLayoutSource(): string {
  return readFileSync(layoutPath, 'utf-8');
}

describe('Layout navigation active state', () => {
  it('determines the active navigation item from the current URL', () => {
    expect(loadLayoutSource()).toMatch(/Astro\.url\.pathname/);
  });

  it('marks the active link with aria-current to aid accessibility', () => {
    const layout = loadLayoutSource();
    expect(layout).toMatch(/aria-current=\{[^}]*'page'/);
  });

  it('prevents clicking the active navigation item via pointer-events', () => {
    const layout = loadLayoutSource();
    expect(layout).toMatch(/\.nav-link--active\s*\{[^}]*pointer-events:\s*none/);
  });

  it('refreshes the active link after Astro view transitions', () => {
    const layout = loadLayoutSource();
    expect(layout).toMatch(/document\.addEventListener\(['"]astro:page-load['"],\s*setActiveNavigation\)/);
    expect(layout).toMatch(/document\.addEventListener\(['"]astro:after-swap['"],\s*setActiveNavigation\)/);
  });
});
