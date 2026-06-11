import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  new URL('../../../src/styles/global.css', import.meta.url),
  'utf-8'
);

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
  it('ベース背景がLinear風の精密なニュートラルトーンになっている', () => {
    expect(getVar('--primary-bg')).toBe('#f7f8fb');
    expect(getVar('--secondary-bg')).toBe('#ffffff');
    expect(getVar('--accent-bg')).toBe('#f3f3ff');
  });

  it('テキストとアクセントカラーがLinear基調になっている', () => {
    expect(getVar('--text-primary')).toBe('#111113');
    expect(getVar('--text-secondary')).toBe('#52545a');
    expect(getVar('--text-accent')).toBe('#5e6ad2');
  });

  it('Bentoカード用のサーフェスがhairline border向けに整理されている', () => {
    expect(getVar('--glass-bg')).toBe('rgba(255, 255, 255, 0.94)');
    expect(getVar('--glass-border')).toBe('rgba(9, 9, 11, 0.1)');
    expect(getVar('--glass-subtle')).toBe('rgba(255, 255, 255, 0.78)');
    expect(getVar('--bento-card-bg')).toBe('rgba(255, 255, 255, 0.96)');
    expect(getVar('--bento-muted-bg')).toBe('#f7f8fa');
  });

  it('カードの角丸と影がBento向けに控えめになっている', () => {
    expect(getVar('--radius-lg')).toBe('0.5rem');
    expect(getRuleValue('.card', 'border-radius')).toBe('var(--radius-lg)');
    expect(getRuleValue('.card-glass', 'background')).toBe(
      'var(--bento-card-bg)'
    );
    expect(getRuleValue('.card-glass', 'box-shadow')).toBe('var(--shadow-sm)');
    expect(getRuleValue('.card:hover', 'transform')).toBe('translateY(-1px)');
  });

  it('CTAはLinear風の控えめなaccent surfaceを使う', () => {
    expect(getRuleValue('.btn', 'padding')).toBe('0.72rem 1rem');
    expect(getRuleValue('.btn', 'min-height')).toBe('2.5rem');
    expect(getRuleValue('.btn', 'font-size')).toBe('var(--font-size-sm)');
    expect(getRuleValue('.btn-primary', 'background')).toBe(
      'var(--text-accent)'
    );
    expect(getRuleValue('.btn-primary', 'border')).toBe(
      '1px solid var(--text-accent)'
    );
    expect(getRuleValue('.btn-primary:hover', 'background')).toBe('#4f59c7');
    expect(getRuleValue('.btn-primary:hover', 'transform')).toBe(
      'translateY(-1px)'
    );
    expect(getRuleValue('.btn-primary::before', 'background')).toBeNull();
  });

  it('Bento surface hover is precise and does not rely on heavy depth', () => {
    expect(getRuleValue('.card-glass:hover', 'background')).toBe(
      'var(--secondary-bg)'
    );
    expect(getRuleValue('.card-glass:hover', 'border-color')).toBe(
      'rgba(9, 9, 11, 0.16)'
    );
    expect(getRuleValue('.card-glass:hover', 'box-shadow')).toBe(
      'var(--shadow-md)'
    );
    expect(getRuleValue('.bento-eyebrow', 'line-height')).toBeNull();
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
    expect(getVar('--scrollbar-track')).toBe('#eceef2');
    expect(getVar('--scrollbar-thumb')).toBe('rgba(82, 84, 90, 0.38)');
    expect(getVar('--scrollbar-thumb-hover')).toBe('rgba(94, 106, 210, 0.66)');

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
