import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));

const loadPage = (relativePath: string) =>
  readFileSync(resolve(currentDir, relativePath), 'utf-8');

describe('ページ内の職種表記統一', () => {
  it('aboutページで「プログラマー」表記を使用している', () => {
    const about = loadPage('../about.astro');
    expect(about).toContain('プログラマー');
    expect(about).not.toContain('システムプログラマー');
    expect(about).not.toContain('エンジニア');
  });

  it('careerページで「プログラマー」表記を使用している', () => {
    const career = loadPage('../career.astro');
    expect(career).toContain('プログラマー');
    expect(career).not.toContain('システムプログラマー');
    expect(career).not.toContain('エンジニア');
  });

  it('トップページの英語表記がProgrammerに統一されている', () => {
    const index = loadPage('../index.astro');
    expect(index).toContain('Programmer');
    expect(index).not.toContain('Systems Engineer');
    expect(index).not.toContain('Engineer');
  });
});
