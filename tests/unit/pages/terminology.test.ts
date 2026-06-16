import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const loadPage = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('ページ内の職種表記統一', () => {
  it('careerページ上部は職種名よりできることを前面に出す', () => {
    const career = loadPage('../../../src/pages/career.astro');
    expect(career).toContain('10+ years in production systems');
    expect(career).not.toContain('技術スタックと経験年数');
    expect(career).not.toContain(
      '10年以上の経験と技術スタックを中心に整理しています。'
    );
    expect(career).not.toContain(
      '現場の要件を、運用に残るWebシステムへ落とし込む'
    );
    expect(career).not.toContain('できること、やってきたこと');
    expect(career).not.toContain('Business Systems / Web Applications');
    expect(career).not.toContain('Enterprise systems programmer');
    expect(career).not.toContain('プログラマーです');
    expect(career).not.toContain('システムプログラマー');
    expect(career).not.toContain('エンジニア');
  });

  it('careerコンテンツで「プログラマー」表記を使用している', () => {
    const career = loadPage('../../../src/content/pages/career.md');
    expect(career).toContain('プログラマー');
    expect(career).not.toContain('システムプログラマー');
    expect(career).not.toContain('エンジニア');
  });

  it('トップページの英語表記がProgrammerに統一されている', () => {
    const index = loadPage('../../../src/pages/index.astro');
    expect(index).toContain('Programmer');
    expect(index).not.toContain('Systems Engineer');
    expect(index).not.toContain('Engineer');
  });
});
