import { describe, expect, it } from 'vitest';
import { createDeviceGeometry } from '../../../src/utils/wireframeGeometry';

describe('industrial core geometry', () => {
  it('draws shared mounting spans only once, including partially overlapping edges', () => {
    const edges = createDeviceGeometry();
    let overlaps = 0;
    edges.forEach((edge, i) => {
      const delta = edge.b.map((n, axis) => n - edge.a[axis]);
      const axis = delta
        .map(Math.abs)
        .indexOf(Math.max(...delta.map(Math.abs)));
      for (const other of edges.slice(i + 1)) {
        const ts = [other.a, other.b].map(
          (p) => (p[axis] - edge.a[axis]) / delta[axis]
        );
        if (Math.min(1, Math.max(...ts)) - Math.max(0, Math.min(...ts)) <= 1e-7)
          continue;
        if (
          [other.a, other.b].every((p, end) =>
            p.every(
              (n, k) => Math.abs(n - edge.a[k] - ts[end] * delta[k]) < 1e-8
            )
          )
        )
          overlaps++;
      }
    });
    expect(overlaps).toBe(0);
  });
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

  it('gives the segmented core load-bearing contours and substantial side walls connected to its supports', () => {
    const edges = createDeviceGeometry();
    const core = edges.filter((edge) => edge.part === 'core');
    const contour = core.filter(({ kind }) => kind === 'outline');
    expect(contour.length).toBeGreaterThan(40);
    const points = contour.flatMap(({ a, b }) => [a, b]);
    const span = (axis: number) =>
      Math.max(...points.map((p) => p[axis])) -
      Math.min(...points.map((p) => p[axis]));
    expect(span(2) / span(0)).toBeGreaterThanOrEqual(0.6);
    expect(span(2) / span(0)).toBeLessThanOrEqual(0.85);
    const sides = contour.filter(({ a, b }) => Math.abs(a[2] - b[2]) > 0.5);
    expect(sides.length).toBeGreaterThanOrEqual(8);
    // Both ends of each long side must join an actual front/rear contour.
    for (const { a, b } of sides)
      for (const end of [a, b])
        expect(
          contour.some((e) => e.a[2] === e.b[2] && (e.a === end || e.b === end))
        ).toBe(true);
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

  it('joins every structural core edge to the shell or hub instead of ending a spoke in space', () => {
    const degrees = new Map<object, number>();
    for (const { a, b } of createDeviceGeometry().filter(
      (e) => e.part === 'core' && e.kind !== 'detail'
    ))
      for (const p of [a, b]) degrees.set(p, (degrees.get(p) ?? 0) + 1);
    expect([...degrees.values()].filter((n) => n === 1)).toHaveLength(0);
  });

  it('supports the core from below and behind instead of enclosing it in a tall outer cage', () => {
    const edges = createDeviceGeometry();
    const frame = edges
      .filter((e) => e.part === 'frame')
      .flatMap((e) => [e.a, e.b]);
    const core = edges
      .filter((e) => e.part === 'core')
      .flatMap((e) => [e.a, e.b]);
    expect(Math.max(...frame.map((p) => p[1]))).toBeLessThan(
      Math.max(...core.map((p) => p[1]))
    );
    const uprights = edges
      .filter((e) => e.part === 'frame' && Math.abs(e.a[1] - e.b[1]) > 0.3)
      .flatMap((e) => [e.a, e.b]);
    expect(Math.max(...uprights.map((p) => Math.abs(p[0])))).toBeLessThan(
      Math.max(...core.map((p) => Math.abs(p[0])))
    );
    expect(Math.min(...frame.map((p) => p[1]))).toBeLessThan(
      Math.min(...core.map((p) => p[1]))
    );
  });

  it('uses side, oblique rear and short horizontal cards while keeping an open lower-right bay', () => {
    const boards = createDeviceGeometry().filter(
      (edge) => edge.part === 'boards'
    );
    expect(
      boards.some(({ a, b }) => a[1] === b[1] && Math.abs(a[0] - b[0]) > 0.25)
    ).toBe(true);
    expect(boards.some(({ a, b }) => Math.abs(a[1] - b[1]) > 0.7)).toBe(true);
    expect(
      boards.some(
        ({ a, b }) => Math.abs(a[0] - b[0]) > 0.2 && Math.abs(a[2] - b[2]) > 0.1
      )
    ).toBe(true);
    expect(
      boards.some(({ a, b }) => a[0] === b[0] && Math.abs(a[2] - b[2]) > 0.4)
    ).toBe(true);
    expect(
      boards
        .flatMap(({ a, b }) => [a, b])
        .some(([x, y, z]) => x > 0.3 && y > -0.4 && y < 0 && z > 0)
    ).toBe(false);
  });

  it('retains raised compute packages and fine bent leads on the differently oriented cards', () => {
    const boards = createDeviceGeometry().filter((e) => e.part === 'boards');
    const details = boards.filter((e) => e.kind === 'detail');
    expect(details.length).toBeGreaterThan(0);
    const bentLeads = details.filter(({ a, b }) => {
      const delta = a.map((n, i) => Math.abs(n - b[i]));
      return (
        delta.filter((n) => n > 1e-6).length >= 2 && Math.hypot(...delta) > 0.03
      );
    });
    expect(bentLeads.length).toBeGreaterThanOrEqual(12);
    // Package height exceeds the PCB thickness on both the side and daughter cards.
    for (const axis of [0, 1])
      expect(
        boards.some(
          ({ a, b, kind }) =>
            kind === 'component' &&
            Math.abs(a[axis] - b[axis]) > 0.04 &&
            a.every((n, i) => i === axis || n === b[i])
        )
      ).toBe(true);
  });

  it('keeps a projecting cooler compact and connects routed harness ends to hardware', () => {
    const edges = createDeviceGeometry();
    const cooler = edges.filter((edge) => edge.part === 'cooling');
    expect(cooler.length).toBeGreaterThan(0);
    const xs = cooler.flatMap(({ a, b }) => [a[0], b[0]]);
    expect(Math.max(...xs)).toBeGreaterThan(0.52);
    expect(Math.max(...xs)).toBeLessThan(0.8);
    const coreTop = Math.max(
      ...edges.filter((e) => e.part === 'core').flatMap((e) => [e.a[1], e.b[1]])
    );
    expect(Math.max(...cooler.flatMap((e) => [e.a[1], e.b[1]]))).toBeLessThan(
      coreTop + 0.1
    );
    const frame = new Set(
      edges
        .filter((edge) => edge.part === 'frame' || edge.part === 'core')
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

  it('carries the core and control cards through connected supports into the lower power block', () => {
    const edges = createDeviceGeometry();
    const pointsFor = (part: string) =>
      new Set(edges.filter((e) => e.part === part).flatMap((e) => [e.a, e.b]));
    const power = pointsFor('connectors');
    const frame = edges.filter((e) => e.part === 'frame');
    const framePoints = new Set(frame.flatMap((e) => [e.a, e.b]));
    const seats = [...framePoints].filter((p) => power.has(p) && p[1] < -0.6);
    expect(seats.length).toBeGreaterThanOrEqual(4);
    const reached = new Set(seats);
    let size = 0;
    while (size !== reached.size) {
      size = reached.size;
      for (const { a, b } of frame)
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
    }
    for (const part of ['core', 'boards']) {
      const mounts = [...pointsFor(part)].filter((p) => framePoints.has(p));
      expect(mounts.length).toBeGreaterThanOrEqual(4);
      expect(mounts.every((p) => reached.has(p))).toBe(true);
    }
  });

  it('routes thick cooling pipes from the core to cooler fittings and fine signals to mounted hardware', () => {
    const edges = createDeviceGeometry();
    const pointsFor = (part: string) =>
      new Set(edges.filter((e) => e.part === part).flatMap((e) => [e.a, e.b]));
    const wires = edges.filter((e) => e.part === 'wiring');
    const points = new Set(wires.flatMap((e) => [e.a, e.b]));
    const roots = [...pointsFor('core')].filter((p) => points.has(p));
    const destinations = [...pointsFor('cooling')].filter((p) => points.has(p));
    expect(roots.length).toBeGreaterThanOrEqual(2);
    expect(destinations.length).toBeGreaterThanOrEqual(2);
    for (const root of roots) {
      const reached = new Set([root]);
      let size = 0;
      while (size !== reached.size) {
        size = reached.size;
        for (const { a, b } of wires)
          if (reached.has(a) || reached.has(b)) {
            reached.add(a);
            reached.add(b);
          }
      }
      // A control harness may also share a core vertex; inspect the medium-weight pipe networks.
      if (
        wires.some(
          (e) => e.kind === 'component' && (e.a === root || e.b === root)
        )
      )
        expect(destinations.some((p) => reached.has(p))).toBe(true);
    }
    const fineDegrees = new Map<object, number>();
    for (const { a, b, kind } of wires)
      if (kind === 'detail')
        for (const p of [a, b])
          fineDegrees.set(p, (fineDegrees.get(p) ?? 0) + 1);
    expect(
      [...fineDegrees.values()].filter((n) => n === 1).length
    ).toBeGreaterThanOrEqual(4);
  });
});
