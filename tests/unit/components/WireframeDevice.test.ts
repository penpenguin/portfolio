import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WireframeDevice from '../../../src/components/WireframeDevice.astro';

describe('wireframe device server rendering', () => {
  it('provides a disabled full-stage control with a named static drawing until Canvas is ready', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WireframeDevice);
    expect(html).toMatch(/<button[^>]*data-device-stage[^>]*disabled/);
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toMatch(/<button[^>]*>[\s\S]*<canvas[\s\S]*<\/button>/);
    expect(html).toContain(
      'aria-label="基板、支持柱、ヒートシンク、端子を持つ装置の線画"'
    );
    expect(html.match(/<line\b/g)!.length).toBeGreaterThan(100);
    expect(html).toContain('fill="none"');
    expect(html).not.toContain('device-toggle');
    expect(html).not.toContain('<iframe');
  });
});
