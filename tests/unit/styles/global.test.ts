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
  it('ベース背景が資料集の明るいグレーになっている', () => {
    expect(getVar('--primary-bg')).toBe('#ededed');
    expect(getVar('--secondary-bg')).toBe('#e9e9e9');
    expect(getVar('--accent-bg')).toBe('#e4e4e4');
  });

  it('テキストとアクセントカラーが用途別の無彩色になっている', () => {
    expect(getVar('--text-primary')).toBe('#171719');
    expect(getVar('--text-secondary')).toBe('#5b5a60');
    expect(getVar('--text-accent')).toBe('#171719');
  });

  it('Bentoカード用のサーフェスがhairline border向けに整理されている', () => {
    expect(getVar('--glass-bg')).toBe('#e9e9e9');
    expect(getVar('--glass-border')).toBe('#c6c5c9');
    expect(getVar('--glass-subtle')).toBe('#e4e4e4');
    expect(getVar('--bento-card-bg')).toBe('#e9e9e9');
    expect(getVar('--bento-muted-bg')).toBe('#e4e4e4');
  });

  it('カードの角丸と影がBento向けに控えめになっている', () => {
    expect(getVar('--radius-lg')).toBe('0.125rem');
    expect(getRuleValue('.card', 'border-radius')).toBe('var(--radius-lg)');
    expect(getRuleValue('.card-glass', 'background')).toBe(
      'var(--bento-card-bg)'
    );
    expect(getRuleValue('.card-glass', 'box-shadow')).toBe('var(--shadow-sm)');
    expect(getRuleValue('.card:hover', 'transform')).toBeNull();
  });

  it('CTAは濃いグレーの面を使う', () => {
    expect(getRuleValue('.btn', 'padding')).toBe('0.72rem 1rem');
    expect(getRuleValue('.btn', 'min-height')).toBe('2.75rem');
    expect(getRuleValue('.btn', 'font-size')).toBe('var(--font-size-sm)');
    expect(getRuleValue('.btn-primary', 'background')).toBe(
      'var(--text-accent)'
    );
    expect(getRuleValue('.btn-primary', 'border')).toBe(
      '1px solid var(--text-accent)'
    );
    expect(getRuleValue('.btn-primary:hover', 'background')).toBe(
      'var(--button-hover)'
    );
    expect(getRuleValue('.btn-primary:hover', 'transform')).toBe(null);
    expect(getRuleValue('.btn-primary::before', 'background')).toBeNull();
  });

  it('keeps passive panels still and separates editorial borders from controls', () => {
    expect(getVar('--border-editorial')).toBe('#d3d2d6');
    expect(getRuleValue('.card-glass', 'border')).toBe(
      '1px solid var(--border-editorial)'
    );
    expect(getRuleValue('.card-glass:hover', 'background')).toBeNull();
    expect(getRuleValue('.card-glass:hover', 'border-color')).toBeNull();
    expect(getVar('--glass-border')).toBe('#c6c5c9');
    expect(getRuleValue('.btn-glass:hover', 'border-color')).toBe(
      'var(--border-strong)'
    );
  });

  it('ページ間で共有するBentoレイアウトユーティリティを持つ', () => {
    expect(getRuleValue('.page-shell', 'padding')).toBe('var(--space-lg) 0');
    expect(getRuleValue('.bento-hero', 'border-radius')).toBe(
      'var(--radius-xl)'
    );
    expect(getRuleValue('.bento-panel', 'border-radius')).toBe(
      'var(--radius-xl)'
    );
    expect(getMobileRuleValue('.page-shell', 'padding')).toBe(
      'var(--space-md) 0'
    );
    expect(getRuleValue('.bento-grid', 'gap')).toBe('var(--grid-gap)');
    expect(getRuleValue('.pill-list', 'display')).toBe('flex');
  });

  it('モバイルでは共通Bentoレイアウトが1カラムに収まる', () => {
    expect(getMobileRuleValue('.page-shell', 'padding')).toBe(
      'var(--space-md) 0'
    );
    expect(getMobileRuleValue('.bento-grid', 'grid-template-columns')).toBe(
      '1fr'
    );
  });

  it('スクロールバーのトラックとつまみが明確に区別できる', () => {
    expect(getVar('--scrollbar-track')).toBe('#e4e4e4');
    expect(getVar('--scrollbar-thumb')).toBe('#77767d');
    expect(getVar('--scrollbar-thumb-hover')).toBe('#5b5a60');

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

  it('コードブロックは個別に横スクロールする', () => {
    expect(getRuleValue('pre', 'white-space')).toBe('pre');
    expect(getRuleValue('pre', 'word-break')).toBe('normal');
  });

  it('モバイルでは画面外側の余白を詰める', () => {
    expect(getMobileRuleValue('body', 'padding')).toBe('0');
    expect(getMobileRuleValue('.container', 'padding')).toBe(
      '0 var(--page-gutter)'
    );
  });
});

describe('資料集の可読性と操作状態', () => {
  it('本文・日付の文字色はすべての明るい面で4.5:1以上になる', () => {
    const luminance = (hex: string) => {
      const channels = hex
        .slice(1)
        .match(/../g)!
        .map((v) => parseInt(v, 16) / 255);
      const linear = channels.map((v) =>
        v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      );
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    for (const text of ['--text-primary', '--text-secondary', '--text-muted']) {
      for (const surface of [
        '--primary-bg',
        '--bento-card-bg',
        '--bento-muted-bg',
      ]) {
        const values = [
          luminance(getVar(text)!),
          luminance(getVar(surface)!),
        ].sort((a, b) => a - b);
        expect((values[1] + 0.05) / (values[0] + 0.05)).toBeGreaterThanOrEqual(
          4.5
        );
      }
    }
  });

  it('装飾的な影を除き、フォーカスを独立した色で表示する', () => {
    for (const name of [
      '--shadow-sm',
      '--shadow-md',
      '--shadow-lg',
      '--shadow-xl',
    ]) {
      expect(getVar(name)).toBe('none');
    }
    expect(getVar('--focus-color')).toBe('#625e72');
    expect(getRuleValue('.btn:focus-visible', 'outline')).toBe(
      '2px solid var(--focus-color)'
    );
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).not.toMatch(/\b0\.[2-9]s\b/);
  });
});
