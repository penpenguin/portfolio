import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const career = readFileSync(
  new URL('../career.astro', import.meta.url),
  'utf-8'
);

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
    expect(marker).toContain(
      'left: calc(var(--timeline-line-x) - var(--timeline-dot-size) / 2);'
    );
    expect(marker).toContain('top: 50%;');
    expect(marker).toContain('transform: translateY(-50%);');
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
    const current = getRuleBody(
      '\\.timeline-marker\\.current\\s+\\.timeline-dot'
    );
    expect(current).toContain('var(--timeline-dot-active)');
    expect(current).toContain('var(--text-accent)');
    expect(current).toContain('var(--timeline-dot-glow)');
  });
});

describe('career print view', () => {
  const heroHeadingMatch = career.match(
    /<div class="[^"]*hero-content[^"]*">([\s\S]*?)<\/div>/
  );
  const heroContent = heroHeadingMatch ? heroHeadingMatch[1] : '';

  it('印刷用の見出しが含まれている', () => {
    expect(heroContent).toMatch(/class="print-only[^"]*">職務経歴書</);
  });

  it('印刷時に既存の見出しと説明を非表示にするスタイルが定義されている', () => {
    expect(career).toMatch(
      /@media print[\s\S]*\.screen-only[\s\S]*display:\s*none/i
    );
    expect(career).toMatch(
      /@media print[\s\S]*\.print-only[\s\S]*display:\s*(block|inline|flex)/i
    );
  });

  it('保有資格セクションがページ途中で分割されないようスタイルが定義されている', () => {
    expect(career).toMatch(
      /@media print[\s\S]*\.certifications[\s\S]*page-break-inside:\s*avoid/i
    );
  });
});

describe('career certifications icon', () => {
  it('資格タイルはFE略号テキストではなく装飾SVGアイコンを使う', () => {
    expect(career).not.toMatch(/<div class="cert-icon">FE<\/div>/);
    expect(career).toMatch(
      /<div class="cert-icon cert-icon--credential" aria-hidden="true">[\s\S]*<svg/
    );
  });
});
