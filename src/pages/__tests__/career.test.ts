import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const career = readFileSync(new URL('../career.astro', import.meta.url), 'utf-8');

const getRuleBody = (selector: string) => {
  const styleMatch = career.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const css = styleMatch ? styleMatch[1] : '';
  const pattern = new RegExp(`${selector}\\s*{([\\s\\S]*?)}`, 'm');
  const ruleMatch = css.match(pattern);
  return ruleMatch ? ruleMatch[1].trim() : '';
};

describe('career timeline glass palette', () => {
  it('タイムラインマーカーがセンターに配置される', () => {
    const marker = getRuleBody('\\.timeline-marker');
    expect(marker).toContain('left: 31px;');
    expect(marker).toContain('top: 50%;');
    expect(marker).toContain('transform: translate(-50%, -50%);');
  });

  it('タイムラインドットのベースカラーがガラス調トーンを参照する', () => {
    const base = getRuleBody('\\.timeline-dot');
    expect(base).toContain('var(--timeline-dot-bg)');
    expect(base).toContain('var(--timeline-dot-border)');
  });

  it('タイムラインの縦線上部がグラデーションでフェードする', () => {
    const line = getRuleBody('\\.timeline::before');
    expect(line).toContain('linear-gradient');
    expect(line).toContain('rgba(148, 163, 184, 0) 0%');
    expect(line).toContain('var(--glass-border) 2%');
    expect(line).toContain('var(--glass-border) 98%');
    expect(line).toContain('rgba(148, 163, 184, 0) 100%');
  });

  it('現在ステップのドットがアクセントカラーでハイライトされる', () => {
    const current = getRuleBody('\\.timeline-marker\\.current\\s+\\.timeline-dot');
    expect(current).toContain('var(--timeline-dot-active)');
    expect(current).toContain('var(--text-accent)');
    expect(current).toContain('var(--timeline-dot-glow)');
  });
});
