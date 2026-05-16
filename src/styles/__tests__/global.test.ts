import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../global.css', import.meta.url), 'utf-8');

const getVar = (name: string) => {
  const pattern = new RegExp(`${name}\\s*:\\s*([^;]+);`);
  const match = css.match(pattern);
  return match ? match[1].trim() : null;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRuleValue = (selector: string, property: string) => {
  const selectorPattern = escapeRegex(selector);
  const propertyPattern = escapeRegex(property);
  const pattern = new RegExp(
    `${selectorPattern}\\s*{[^}]*${propertyPattern}\\s*:\\s*([^;]+);`
  );
  const match = css.match(pattern);
  return match ? match[1].trim() : null;
};

const getMobileRuleValue = (selector: string, property: string) => {
  const mediaStartPattern = /@media\s*\(max-width:\s*768px\)\s*{/;
  const startMatch = css.match(mediaStartPattern);
  if (!startMatch || startMatch.index === undefined) {
    return null;
  }

  const startIndex = startMatch.index + startMatch[0].length;
  let depth = 1;
  let cursor = startIndex;

  while (cursor < css.length && depth > 0) {
    const char = css[cursor];
    if (char === '{') {
      depth += 1;
    }
    if (char === '}') {
      depth -= 1;
    }
    cursor += 1;
  }

  const mobileBlock = css.slice(startIndex, cursor - 1);
  const selectorPattern = escapeRegex(selector);
  const propertyPattern = escapeRegex(property);
  const pattern = new RegExp(
    `${selectorPattern}\\s*{[^}]*${propertyPattern}\\s*:\\s*([^;]+);`
  );
  const match = mobileBlock.match(pattern);
  return match ? match[1].trim() : null;
};

describe('global.css カラーパレット', () => {
  it('ベース背景がApple風のニュートラルトーンになっている', () => {
    expect(getVar('--primary-bg')).toBe('#f5f5f7');
    expect(getVar('--secondary-bg')).toBe('#ffffff');
    expect(getVar('--accent-bg')).toBe('#eef2ff');
  });

  it('テキストとアクセントカラーがミニマルな高コントラスト基調になっている', () => {
    expect(getVar('--text-primary')).toBe('#1d1d1f');
    expect(getVar('--text-secondary')).toBe('#5f6368');
    expect(getVar('--text-accent')).toBe('#2563eb');
  });

  it('Bentoカード用のサーフェスが不透明寄りになっている', () => {
    expect(getVar('--glass-bg')).toBe('rgba(255, 255, 255, 0.86)');
    expect(getVar('--glass-border')).toBe('rgba(29, 29, 31, 0.1)');
    expect(getVar('--glass-subtle')).toBe('rgba(255, 255, 255, 0.68)');
    expect(getVar('--bento-card-bg')).toBe('rgba(255, 255, 255, 0.9)');
  });

  it('カードの角丸と影がBento向けに控えめになっている', () => {
    expect(getVar('--radius-lg')).toBe('0.5rem');
    expect(getRuleValue('.card', 'border-radius')).toBe('var(--radius-lg)');
    expect(getRuleValue('.card-glass', 'background')).toBe(
      'var(--bento-card-bg)'
    );
    expect(getRuleValue('.card-glass', 'box-shadow')).toBe('var(--shadow-md)');
  });

  it('ページ間で共有するBentoレイアウトユーティリティを持つ', () => {
    expect(getRuleValue('.page-shell', 'padding')).toBe(
      'var(--space-xl) 0 var(--space-2xl)'
    );
    expect(getRuleValue('.bento-hero', 'border-radius')).toBe(
      'var(--radius-xl)'
    );
    expect(getRuleValue('.bento-panel', 'border-radius')).toBe(
      'var(--radius-xl)'
    );
    expect(getRuleValue('.bento-grid', 'gap')).toBe('var(--space-md)');
    expect(getRuleValue('.bento-eyebrow', 'text-transform')).toBe('uppercase');
    expect(getRuleValue('.pill-list', 'display')).toBe('flex');
  });

  it('モバイルでは共通Bentoレイアウトが1カラムに収まる', () => {
    expect(getMobileRuleValue('.page-shell', 'padding')).toBe(
      'var(--space-lg) 0 var(--space-2xl)'
    );
    expect(getMobileRuleValue('.bento-grid', 'grid-template-columns')).toBe(
      '1fr'
    );
  });

  it('スクロールバーのトラックとつまみが明確に区別できる', () => {
    expect(getVar('--scrollbar-track')).toBe('#e5e7eb');
    expect(getVar('--scrollbar-thumb')).toBe('rgba(95, 99, 104, 0.45)');
    expect(getVar('--scrollbar-thumb-hover')).toBe('rgba(37, 99, 235, 0.7)');

    expect(getRuleValue('::-webkit-scrollbar-track', 'background')).toBe(
      'var(--scrollbar-track)'
    );
    expect(getRuleValue('::-webkit-scrollbar-thumb', 'background')).toBe(
      'var(--scrollbar-thumb)'
    );
    expect(getRuleValue('::-webkit-scrollbar-thumb:hover', 'background')).toBe(
      'var(--scrollbar-thumb-hover)'
    );
  });

  it('コードブロックがモバイルでもはみ出さずに折り返される', () => {
    expect(getRuleValue('pre', 'white-space')).toBe('pre-wrap');
    expect(getRuleValue('pre', 'word-break')).toBe('break-word');
  });

  it('モバイルでは画面外側の余白を詰める', () => {
    expect(getMobileRuleValue('body', 'padding')).toBe('0 var(--space-xs)');
    expect(getMobileRuleValue('.container', 'padding')).toBe(
      '0 var(--space-xs)'
    );
  });
});
