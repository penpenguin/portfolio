import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const loadConfig = () =>
  readFileSync(resolve(currentDir, '../config.ts'), 'utf-8');

describe('career collection schema', () => {
  it('defines career collection with timeline fields', () => {
    const config = loadConfig();

    expect(config).toMatch(/const\s+career\s*=\s*defineCollection\(/);
    expect(config).toMatch(/timeline:\s*z\.array\(/);
    expect(config).toMatch(/teamSize:\s*z\.string\(\)/);
    expect(config).toMatch(/responsibilities:\s*z\.string\(\)/);
    expect(config).toMatch(/techStack:\s*z\.array\(z\.string\(\)\)/);
    expect(config).toMatch(/collections\s*=\s*\{[^}]*career[^}]*\}/);
  });
});
