import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const faviconPath = resolve(process.cwd(), 'public/favicon.svg');

function loadFavicon(): string {
  return readFileSync(faviconPath, 'utf-8');
}

describe('favicon.svg', () => {
  it('declares the portfolio-specific favicon id', () => {
    expect(loadFavicon()).toContain('id="portfolio-favicon"');
  });

  it('matches the site background palette', () => {
    const svg = loadFavicon();
    expect(svg).toContain('#F5F7FD');
    expect(svg).toContain('#E0E7FF');
  });

  it('retains the neon cyberpunk accents', () => {
    const svg = loadFavicon();
    expect(svg).toContain('#8B5CF6');
    expect(svg).toContain('#22D3EE');
    expect(svg).toContain('#FF00F5');
  });

  it('applies a neon glow filter for the cyberpunk accent', () => {
    const svg = loadFavicon();
    expect(svg).toContain('id="portfolio-neon-glow"');
    expect(svg).toContain('<feGaussianBlur');
  });
});
