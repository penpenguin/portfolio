import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../global.css', import.meta.url), 'utf-8');

const getVar = (name: string) => {
  const pattern = new RegExp(`${name}\\s*:\\s*([^;]+);`);
  const match = css.match(pattern);
  return match ? match[1].trim() : null;
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRuleValue = (selector: string, property: string) => {
  const selectorPattern = escapeRegex(selector);
  const propertyPattern = escapeRegex(property);
  const pattern = new RegExp(`${selectorPattern}\\s*{[^}]*${propertyPattern}\\s*:\\s*([^;]+);`);
  const match = css.match(pattern);
  return match ? match[1].trim() : null;
};

describe('global.css カラーパレット', () => {
  it('ベース背景がホワイトトーンになっている', () => {
    expect(getVar('--primary-bg')).toBe('#f5f7fd');
    expect(getVar('--secondary-bg')).toBe('#ffffff');
  });

  it('テキストとアクセントカラーがダークテキスト基調に変わっている', () => {
    expect(getVar('--text-primary')).toBe('#1f2937');
    expect(getVar('--text-secondary')).toBe('#4b5563');
    expect(getVar('--text-accent')).toBe('#3b82f6');
  });

  it('ガラスモーフィズム用のサーフェスがより透明になっている', () => {
    expect(getVar('--glass-bg')).toBe('rgba(255, 255, 255, 0.4)');
    expect(getVar('--glass-border')).toBe('rgba(148, 163, 184, 0.24)');
    expect(getVar('--glass-subtle')).toBe('rgba(255, 255, 255, 0.3)');
  });

  it('カードのブラーがやや抑えられている', () => {
    expect(getRuleValue('.card-glass', 'backdrop-filter')).toBe('blur(8px)');
    expect(getRuleValue('.card-glass', '-webkit-backdrop-filter')).toBe('blur(8px)');
  });

  it('スクロールバーのトラックとつまみが明確に区別できる', () => {
    expect(getVar('--scrollbar-track')).toBe('#e2e8f0');
    expect(getVar('--scrollbar-thumb')).toBe('rgba(59, 130, 246, 0.55)');
    expect(getVar('--scrollbar-thumb-hover')).toBe('rgba(37, 99, 235, 0.7)');

    expect(getRuleValue('::-webkit-scrollbar-track', 'background')).toBe('var(--scrollbar-track)');
    expect(getRuleValue('::-webkit-scrollbar-thumb', 'background')).toBe('var(--scrollbar-thumb)');
    expect(getRuleValue('::-webkit-scrollbar-thumb:hover', 'background')).toBe('var(--scrollbar-thumb-hover)');
  });

  it('コードブロックがモバイルでもはみ出さずに折り返される', () => {
    expect(getRuleValue('pre', 'white-space')).toBe('pre-wrap');
    expect(getRuleValue('pre', 'word-break')).toBe('break-word');
  });
});
