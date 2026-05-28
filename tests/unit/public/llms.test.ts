import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const llmsPath = resolve(currentDir, '../../../public/llms.txt');

function loadLlmsGuide(): string {
  return readFileSync(llmsPath, 'utf-8');
}

describe('llms.txt', () => {
  it('documents the portfolio WebMCP tools for agents', () => {
    const guide = loadLlmsGuide();

    expect(guide).toContain('WebMCP');
    expect(guide).toContain('portfolio.search_content');
    expect(guide).toContain('portfolio.find_projects');
    expect(guide).toContain('portfolio.find_blog_posts');
    expect(guide).toContain('portfolio.get_career_summary');
    expect(guide).toContain('portfolio.get_contact_routes');
  });
});
