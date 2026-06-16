import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const agents = readFileSync(
  new URL('../../../AGENTS.md', import.meta.url),
  'utf-8'
);

describe('AGENTS.md design guidance', () => {
  it('requires agents to consult DESIGN.md for visual changes', () => {
    expect(agents).toContain('DESIGN.md');
    expect(agents).toContain('visual changes');
  });

  it('preserves BentoUI structure during design polish', () => {
    expect(agents).toContain('BentoUI');
    expect(agents).toContain('grid composition');
    expect(agents).toContain('section structure');
    expect(agents).toContain('content order');
  });
});
