import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../global.css', import.meta.url), 'utf-8');

const getVar = (name: string) => {
  const pattern = new RegExp(`${name}\\s*:\\s*([^;]+);`);
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
    expect(getVar('--glass-bg')).toBe('rgba(255, 255, 255, 0.45)');
    expect(getVar('--glass-border')).toBe('rgba(148, 163, 184, 0.28)');
    expect(getVar('--glass-subtle')).toBe('rgba(255, 255, 255, 0.35)');
  });
});
