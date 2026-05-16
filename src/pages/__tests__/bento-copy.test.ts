import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const home = readFileSync(new URL('../index.astro', import.meta.url), 'utf-8');
const projects = readFileSync(
  new URL('../projects/index.astro', import.meta.url),
  'utf-8'
);
const contact = readFileSync(
  new URL('../contact.astro', import.meta.url),
  'utf-8'
);

describe('Bento copy direction', () => {
  it('主要ページの汎用コピーを職能寄せに置き換える', () => {
    const combined = [home, projects, contact].join('\n');

    expect(combined).not.toContain("Hello, I'm a Programmer");
    expect(combined).not.toContain('My Projects');
    expect(combined).not.toContain('作品集');
    expect(combined).not.toContain('お気軽にご連絡ください');
    expect(combined).toContain('Enterprise systems, shipped end-to-end');
    expect(combined).toContain('Built Systems');
    expect(combined).toContain('業務システム開発の相談');
  });
});
