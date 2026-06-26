import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const layoutPath = resolve(currentDir, '../../../src/layouts/Layout.astro');

function loadLayoutSource(): string {
  return readFileSync(layoutPath, 'utf-8');
}

describe('Layout agent discovery metadata', () => {
  it('advertises the LLM guide as a base-aware markdown alternate link', () => {
    const layout = loadLayoutSource();

    expect(layout).toMatch(/rel=['"]alternate['"]/);
    expect(layout).toMatch(/type=['"]text\/markdown['"]/);
    expect(layout).toMatch(/title=['"]LLM guide['"]/);
    expect(layout).toMatch(/href=\{withBase\(['"]\/llms\.txt['"]\)\}/);
  });

  it('describes the WebMCP portfolio tools for AI agents', () => {
    const layout = loadLayoutSource();

    expect(layout).toMatch(/name=['"]ai-agent-capabilities['"]/);
    expect(layout).toMatch(
      /content=['"]WebMCP; portfolio search; projects; blog; contact routes['"]/
    );
  });
});
