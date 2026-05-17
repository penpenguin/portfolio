import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const blogDir = new URL('../../../src/content/blog', import.meta.url);

const readMarkdownFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return readMarkdownFiles(path);
    }

    return entry.name.endsWith('.md') ? [readFileSync(path, 'utf-8')] : [];
  });

describe('blog markdown code fences', () => {
  it('uses Shiki-compatible language info strings with title metadata', () => {
    const sources = readMarkdownFiles(blogDir.pathname);
    const invalidFences = sources.flatMap((source) =>
      Array.from(source.matchAll(/^```[A-Za-z0-9_+.-]+:[^\s]+/gm)).map(
        ([fence]) => fence
      )
    );

    expect(invalidFences).toEqual([]);
  });
});
