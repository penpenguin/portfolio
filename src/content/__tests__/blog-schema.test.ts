import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const loadConfig = () =>
  readFileSync(resolve(currentDir, '../config.ts'), 'utf-8');

describe('blog collection schema', () => {
  it('declares draft field so draft filtering works', () => {
    const config = loadConfig();
    expect(config).toMatch(/draft:\s*z\.boolean/);
  });
});
