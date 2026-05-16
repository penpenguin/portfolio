import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readCareerContent = () =>
  readFileSync(
    new URL('../../../src/content/pages/career.md', import.meta.url),
    'utf-8'
  );

describe('career content entry', () => {
  it('career timeline is defined in markdown frontmatter', () => {
    const content = readCareerContent();

    expect(content).toMatch(/timeline:\s*$/m);
    expect(content).toMatch(/title:\s*'通信設計管理システム開発'/);
    expect(content).toMatch(/period:\s*'2023\.04 - 2025\.06'/);
    expect(content).toMatch(/role:\s*'サブリーダー \/ リードプログラマー'/);
    expect(content).toMatch(/teamSize:\s*'20名'/);
    expect(content).toMatch(/techStack:\s*$/m);
    expect(content).toMatch(/-\s*'Java 21'/);
  });
});
