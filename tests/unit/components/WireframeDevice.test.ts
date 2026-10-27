import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WireframeDevice from '../../../src/components/WireframeDevice.astro';

describe('wireframe device server rendering', () => {
  it('provides a named static line drawing and hides controls until Canvas is ready', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WireframeDevice);
    expect(html).toContain('role="img"');
    expect(html).toContain(
      'aria-label="基板、支持柱、ヒートシンク、端子を持つ装置の線画"'
    );
    expect(html.match(/<line\b/g)!.length).toBeGreaterThan(100);
    expect(html).toContain('fill="none"');
    expect(html).toMatch(/<button[^>]*hidden/);
    expect(html).not.toContain('<iframe');
  });
});
