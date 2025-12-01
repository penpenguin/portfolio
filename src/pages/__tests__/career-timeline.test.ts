import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../career.astro', import.meta.url), 'utf-8');

const getRule = (selector: string) => {
  const pattern = new RegExp(`${selector}\\s*{[^}]*}`, 'm');
  const match = page.match(pattern);
  return match ? match[0] : '';
};

const getMobileBlock = () => {
  const match = page.match(/@media\s*\(max-width:\s*768px\)[\s\S]*?}/);
  return match ? match[0] : '';
};

describe('Career タイムライン', () => {
  it('ライン位置とドットが同じX座標を共有する', () => {
    const lineRule = getRule('\\.timeline::before');
    const markerRule = getRule('\\.timeline-marker');
    expect(lineRule.includes('left: var(--timeline-line-x)')).toBe(true);
    expect(markerRule.includes('left: calc(var(--timeline-line-x) - var(--timeline-dot-size) / 2)')).toBe(true);
    expect(markerRule).toMatch(/transform\s*:\s*translateY\(-50%\)/);
  });

  it('モバイルではライン位置を狭めドットサイズを調整する', () => {
    const mobile = getMobileBlock();
    expect(mobile).toMatch(/--timeline-line-x\s*:\s*\d+px/);
    expect(mobile).toMatch(/--timeline-dot-size\s*:\s*\d+px/);
  });
});
