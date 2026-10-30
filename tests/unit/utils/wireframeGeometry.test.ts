import { describe, expect, it } from 'vitest';
import { createDeviceGeometry } from '../../../src/utils/wireframeGeometry';

describe('industrial core geometry', () => {
  it('builds a deterministic chamfered skeleton without zero-length or duplicate edges', () => {
    const edges = createDeviceGeometry();
    expect(edges).toEqual(createDeviceGeometry());
    const keys = new Set<string>();
    for (const { a, b } of edges) {
      expect([...a, ...b].every(Number.isFinite)).toBe(true);
      expect(Math.hypot(...a.map((n, i) => n - b[i]))).toBeGreaterThan(1e-8);
      const key = [a.join(','), b.join(',')].sort().join('|');
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
    const frame = edges.filter((edge) => edge.part === 'frame');
    expect(frame.some(({ a, b }) => a[0] !== b[0] && a[1] !== b[1])).toBe(true);
    expect(frame.some((edge) => edge.kind === 'outline')).toBe(true);
  });

  it('connects three open vertical collars to the skeleton, with a hub spanning their depth', () => {
    const edges = createDeviceGeometry();
    const core = edges.filter((edge) => edge.part === 'core');
    const collars = new Set(
      core
        .filter(
          ({ a, b }) =>
            a[2] === b[2] &&
            Math.abs(Math.hypot(a[0] - 0.02, a[1] - 0.18) - 0.4) < 1e-7 &&
            Math.abs(Math.hypot(b[0] - 0.02, b[1] - 0.18) - 0.4) < 1e-7
        )
        .map(({ a }) => a[2])
    );
    expect(collars.size).toBe(3);
    expect(core.some(({ a, b }) => Math.abs(a[2] - b[2]) > 0.4)).toBe(true);
    const framePoints = new Set(
      edges
        .filter((edge) => edge.part === 'frame')
        .flatMap(({ a, b }) => [a.join(','), b.join(',')])
    );
    const attachments = new Set(
      core
        .flatMap(({ a, b }) => [a.join(','), b.join(',')])
        .filter((point) => framePoints.has(point))
    );
    expect(attachments.size).toBeGreaterThanOrEqual(3);
  });

  it('mixes horizontal and vertical electronics while keeping an open lower-right bay', () => {
    const boards = createDeviceGeometry().filter(
      (edge) => edge.part === 'boards'
    );
    expect(
      boards.some(({ a, b }) => a[1] === b[1] && Math.abs(a[0] - b[0]) > 0.5)
    ).toBe(true);
    expect(boards.some(({ a, b }) => Math.abs(a[1] - b[1]) > 0.7)).toBe(true);
    expect(
      boards
        .flatMap(({ a, b }) => [a, b])
        .some(([x, y, z]) => x > 0.3 && y > -0.4 && y < 0 && z > 0)
    ).toBe(false);
  });

  it('keeps a projecting cooler compact and connects routed harness ends to hardware', () => {
    const edges = createDeviceGeometry();
    const cooler = edges.filter((edge) => edge.part === 'cooling');
    expect(cooler.length).toBeGreaterThan(0);
    const xs = cooler.flatMap(({ a, b }) => [a[0], b[0]]);
    expect(Math.max(...xs)).toBeGreaterThan(0.52);
    expect(Math.max(...xs)).toBeLessThan(0.8);
    const frame = new Set(
      edges
        .filter((edge) => edge.part === 'frame')
        .flatMap(({ a, b }) => [a.join(','), b.join(',')])
    );
    const coolerMounts = new Set(
      cooler
        .flatMap(({ a, b }) => [a.join(','), b.join(',')])
        .filter((point) => frame.has(point))
    );
    expect(coolerMounts.size).toBeGreaterThanOrEqual(2);
    const hardware = new Set(
      edges
        .filter((edge) => edge.part !== 'wiring')
        .flatMap(({ a, b }) => [a.join(','), b.join(',')])
    );
    const connections = new Map<string, number>();
    for (const { a, b } of edges.filter((edge) => edge.part === 'wiring'))
      for (const point of [a, b])
        connections.set(
          point.join(','),
          (connections.get(point.join(',')) ?? 0) + 1
        );
    const ends = [...connections]
      .filter(([, count]) => count === 1)
      .map(([point]) => point);
    expect(ends.length).toBeGreaterThanOrEqual(6);
    expect(ends.every((point) => hardware.has(point))).toBe(true);
  });
});
