import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../index.astro', import.meta.url), 'utf-8');

const getMobileBlock = () => {
  const pattern = /@media\s*\(max-width:\s*768px\)[\s\S]*?<\/style>/;
  const match = page.match(pattern);
  return match ? match[0] : '';
};

describe('Home モバイルレイアウト', () => {
  it('ヒーローのコードカード幅が画面に収まる', () => {
    const mobileStyles = getMobileBlock();
    expect(mobileStyles).not.toBe('');
    expect(mobileStyles).toContain('padding: var(--space-xl) 0');
    expect(mobileStyles).toContain('max-width: 520px');
    expect(mobileStyles).toContain('width: 100%');
    expect(mobileStyles).toContain('.hero-visual');
    expect(mobileStyles).toContain('justify-content: center');
    expect(mobileStyles).toContain('text-align: left');
  });
});
