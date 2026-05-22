import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const loadPage = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('ページ内の職種表記統一', () => {
  it('aboutページは職種名よりできることを前面に出す', () => {
    const about = loadPage('../../../src/pages/about.astro');
    expect(about).toContain('現場の要件を、運用に残るWebシステムへ落とし込む');
    expect(about).toContain(
      'メーカー系の社内システムを中心に、要件整理、Webアプリケーション実装、クラウド基盤、CI/CD、運用改善まで担当してきました。'
    );
    expect(about).not.toContain('できること、やってきたこと');
    expect(about).not.toContain('Business Systems / Web Applications');
    expect(about).not.toContain('Enterprise systems programmer');
    expect(about).not.toContain('プログラマーです');
    expect(about).not.toContain('システムプログラマー');
    expect(about).not.toContain('エンジニア');
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
