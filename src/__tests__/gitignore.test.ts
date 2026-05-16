import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const gitignore = readFileSync(resolve(process.cwd(), '.gitignore'), 'utf8');

describe('.gitignore', () => {
  it('ignores Playwright generated artifacts', () => {
    expect(gitignore).toMatch(/^test-results\/$/m);
    expect(gitignore).toMatch(/^playwright-report\/$/m);
  });
});
