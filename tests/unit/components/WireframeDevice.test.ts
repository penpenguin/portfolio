import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import WireframeDevice from '../../../src/components/WireframeDevice.astro';
import {
  initialAngle,
  projectDevice,
} from '../../../src/utils/wireframeDevice';

describe('wireframe device server rendering', () => {
  it('provides a disabled full-stage control with a named static drawing until Canvas is ready', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WireframeDevice);
    expect(html).toMatch(/<button[^>]*data-device-stage[^>]*disabled/);
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toMatch(/<button[^>]*>[\s\S]*<canvas[\s\S]*<\/button>/);
    expect(html).toContain(
      'aria-label="鋭い先端機構と細長い軸を持つSF制御杖の線画"'
    );
    expect(html.match(/<line\b/g)!.length).toBeGreaterThan(100);
    expect(html).toContain('fill="none"');
    expect(html).not.toContain('device-toggle');
    expect(html).not.toContain('<iframe');
  });

  it('serializes the shared initial projection at bounded precision without changing its line hierarchy', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WireframeDevice);
    const tags = html.match(/<line\b[^>]*>/g)!;
    const projected = projectDevice(initialAngle, 240, 240);
    expect(tags).toHaveLength(projected.length);
    tags.forEach((tag, i) => {
      const attributes = Object.fromEntries(
        [...tag.matchAll(/([\w-]+)="([^"]+)"/g)].map((match) => [
          match[1],
          match[2],
        ])
      );
      const expected = {
        x1: projected[i].from.x,
        y1: projected[i].from.y,
        x2: projected[i].to.x,
        y2: projected[i].to.y,
        'stroke-opacity': projected[i].opacity,
      };
      for (const [name, value] of Object.entries(expected)) {
        expect(attributes[name]).toMatch(/^-?\d+(\.\d{1,3})?$/);
        expect(Math.abs(Number(attributes[name]) - value)).toBeLessThanOrEqual(
          0.000501
        );
      }
      expect(Number(attributes['stroke-width'])).toBe(projected[i].width);
      expect(attributes['vector-effect']).toBe('non-scaling-stroke');
      expect(attributes.stroke).toBe('#5B5A60');
    });
  });
});
