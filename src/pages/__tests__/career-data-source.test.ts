import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('../career.astro', import.meta.url), 'utf-8');

describe('Career data source', () => {
  it('reads timeline entries from career content collection', () => {
    expect(page).toContain("getEntry('career', 'career')");
    expect(page).toMatch(/const\s*\{\s*timeline\s*\}\s*=\s*careerEntry\.data/);
  });

  it('renders timeline by mapping content entries and marks first item as current', () => {
    expect(page).toMatch(/\{timeline\.map\(\(item,\s*index\)\s*=>/);
    expect(page).toMatch(/current:\s*index\s*===\s*0/);
  });
});
