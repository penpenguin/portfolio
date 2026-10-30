import { describe, expect, it } from 'vitest';
import { createDeviceGeometry } from '../../../src/utils/wireframeGeometry';

describe('industrial control staff geometry', () => {
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
  it('builds a deterministic shared geometry without zero-length or duplicate edges', () => {
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
  });

  it('separates a long slender shaft, neck, sharp head and modest pommel', () => {
    const edges = createDeviceGeometry();
    const pointsFor = (part: string) =>
      edges.filter((e) => e.part === part).flatMap((e) => [e.a, e.b]);
    for (const part of ['head', 'neck', 'shaft', 'pommel'])
      expect(pointsFor(part).length).toBeGreaterThan(0);
    const all = edges.flatMap((e) => [e.a, e.b]);
    const length =
      Math.max(...all.map((p) => p[1])) - Math.min(...all.map((p) => p[1]));
    const head = pointsFor('head');
    const diameter = 2 * Math.max(...head.map((p) => Math.hypot(p[0], p[2])));
    expect(length / diameter).toBeGreaterThanOrEqual(4.5);
    expect(length / diameter).toBeLessThanOrEqual(5.5);
    const headLength =
      Math.max(...head.map((p) => p[1])) - Math.min(...head.map((p) => p[1]));
    expect(headLength / length).toBeGreaterThanOrEqual(0.3);
    expect(headLength / length).toBeLessThanOrEqual(0.38);
    const shaft = pointsFor('shaft');
    const shaftLength =
      Math.max(...shaft.map((p) => p[1])) - Math.min(...shaft.map((p) => p[1]));
    expect(shaftLength / length).toBeGreaterThanOrEqual(0.54);
    expect(
      (2 * Math.max(...shaft.map((p) => Math.hypot(p[0], p[2])))) / length
    ).toBeLessThan(0.04);
    const quiet = edges.filter(
      (e) =>
        e.part === 'shaft' &&
        Math.min(e.a[1], e.b[1]) < -1 &&
        Math.max(e.a[1], e.b[1]) > -3.5
    );
    expect(quiet.length).toBeGreaterThanOrEqual(6);
    expect(
      quiet.every(
        (e) => e.a[0] === e.b[0] && e.a[2] === e.b[2] && e.kind !== 'detail'
      )
    ).toBe(true);
    expect(
      Math.max(...pointsFor('pommel').map((p) => Math.hypot(p[0], p[2])))
    ).toBeLessThan(diameter / 5);
  });

  it('tapers unequal blade outlines to sharp tips in different radial planes with real thickness', () => {
    const edges = createDeviceGeometry().filter((e) => e.part === 'head');
    const outline = edges.filter((e) => e.kind === 'outline');
    const points = [...new Set(outline.flatMap((e) => [e.a, e.b]))];
    const tips = points.filter(
      (p) =>
        p[1] > 3.3 &&
        outline
          .filter((e) => e.a === p || e.b === p)
          .every((e) => (e.a === p ? e.b : e.a)[1] < p[1])
    );
    expect(tips.length).toBe(4);
    expect(new Set(tips.map((p) => p[1])).size).toBe(4);
    const quadrants = tips.map((p) =>
      [Math.sign(p[0]), Math.sign(p[2])].join(',')
    );
    expect(new Set(quadrants).size).toBe(4);
    const thicknessEdges = edges.filter(
      ({ a, b }) =>
        a[1] === b[1] &&
        Math.hypot(a[0] - b[0], a[2] - b[2]) >= 0.08 &&
        Math.hypot(a[0] - b[0], a[2] - b[2]) <= 0.14
    );
    expect(thicknessEdges.length).toBeGreaterThanOrEqual(12);
    for (const tip of tips) {
      const neighbours = outline
        .filter((e) => e.a === tip || e.b === tip)
        .map((e) => (e.a === tip ? e.b : e.a));
      expect(neighbours.length).toBe(2);
      expect(
        Math.hypot(
          neighbours[0][0] - neighbours[1][0],
          neighbours[0][2] - neighbours[1][2]
        )
      ).toBeGreaterThan(0.15);
    }
  });

  it('joins the visible shell supports through the neck and shaft to the pommel', () => {
    const edges = createDeviceGeometry().filter((e) => e.kind !== 'detail');
    const roots = edges
      .filter((e) => e.part === 'pommel')
      .flatMap((e) => [e.a, e.b]);
    expect(roots.length).toBeGreaterThan(0);
    const reached = new Set(roots);
    let size = 0;
    while (size !== reached.size) {
      size = reached.size;
      for (const { a, b } of edges)
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
    }
    for (const part of ['shaft', 'neck', 'head']) {
      const contour = edges.filter(
        (e) => e.part === part && e.kind === 'outline'
      );
      expect(contour.length).toBeGreaterThan(0);
      expect(contour.every((e) => reached.has(e.a) && reached.has(e.b))).toBe(
        true
      );
    }
  });
  it('concentrates mounted mechanisms and fine detail in the head while leaving the shaft quiet', () => {
    const edges = createDeviceGeometry();
    const fine = edges.filter((e) => e.kind === 'detail');
    expect(fine.length).toBeGreaterThan(0);
    expect(
      fine.filter((e) => e.a[1] >= 1.15 && e.b[1] >= 1.15).length / fine.length
    ).toBeGreaterThan(0.9);
    const internal = edges.filter(
      (e) => e.part === 'head' && e.kind === 'component'
    );
    expect(
      internal.some(
        (e) =>
          Math.abs(e.a[1] - e.b[1]) > 1 &&
          Math.max(Math.hypot(e.a[0], e.a[2]), Math.hypot(e.b[0], e.b[2])) < 0.3
      )
    ).toBe(true);
    const cooling = edges.filter((e) => e.part === 'cooling');
    expect(cooling.length).toBeGreaterThan(0);
    expect(
      cooling.every((e) =>
        [e.a, e.b].every(
          (p) => p[1] > 2 && p[1] < 3.5 && Math.hypot(p[0], p[2]) < 0.8
        )
      )
    ).toBe(true);
    const head = new Set(
      edges.filter((e) => e.part === 'head').flatMap((e) => [e.a, e.b])
    );
    expect(
      new Set(cooling.flatMap((e) => [e.a, e.b]).filter((p) => head.has(p)))
        .size
    ).toBeGreaterThanOrEqual(2);
  });

  it('routes outlined conduits and fine signals from neck fittings to actual head terminals', () => {
    const edges = createDeviceGeometry();
    const wires = edges.filter((e) => e.part === 'wiring');
    const hardware = new Set(
      edges.filter((e) => e.part !== 'wiring').flatMap((e) => [e.a, e.b])
    );
    const neck = new Set(
      edges.filter((e) => e.part === 'neck').flatMap((e) => [e.a, e.b])
    );
    const head = new Set(
      edges
        .filter((e) => e.part === 'head' || e.part === 'cooling')
        .flatMap((e) => [e.a, e.b])
    );
    expect(wires.some((e) => e.kind === 'component')).toBe(true);
    expect(wires.some((e) => e.kind === 'detail')).toBe(true);
    const points = new Set(wires.flatMap((e) => [e.a, e.b]));
    expect([...points].some((p) => neck.has(p))).toBe(true);
    expect([...points].some((p) => head.has(p))).toBe(true);
    const reached = new Set([...points].filter((p) => neck.has(p)));
    let size = 0;
    while (size !== reached.size) {
      size = reached.size;
      for (const { a, b } of wires)
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
    }
    expect([...reached].some((p) => head.has(p))).toBe(true);
    const ends = [...points].filter(
      (p) => wires.filter((e) => e.a === p || e.b === p).length === 1
    );
    expect(ends.length).toBeGreaterThan(0);
    expect(ends.every((p) => hardware.has(p))).toBe(true);
    expect(
      wires.every((e) =>
        [e.a, e.b].every(
          (p) => p[1] >= 1.4 && p[1] <= 3.5 && Math.hypot(p[0], p[2]) < 0.8
        )
      )
    ).toBe(true);
  });

  it('lands exposed terminal leads on their packages or the axial prism faces', () => {
    const head = createDeviceGeometry().filter((e) => e.part === 'head');
    const components = new Set(
      head.filter((e) => e.kind !== 'detail').flatMap((e) => [e.a, e.b])
    );
    const fine = head.filter((e) => e.kind === 'detail');
    const points = [...new Set(fine.flatMap((e) => [e.a, e.b]))];
    const ends = points.filter(
      (p) =>
        fine.filter((e) => e.a === p || e.b === p).length === 1 &&
        !components.has(p)
    );
    expect(ends.length).toBeGreaterThan(0);
    // Read the actual lower prism section; a lead may meet a face, not only a wire edge.
    const section = head.filter(
      (e) =>
        e.a[1] === 1.82 &&
        e.b[1] === 1.82 &&
        [e.a, e.b].every((p) => Math.hypot(p[0], p[2]) < 0.24)
    );
    expect(section.length).toBeGreaterThan(0);
    for (const p of ends)
      expect(
        section.some(({ a, b }) => {
          const dx = b[0] - a[0],
            dz = b[2] - a[2];
          const t =
            ((p[0] - a[0]) * dx + (p[2] - a[2]) * dz) / (dx * dx + dz * dz);
          return (
            t >= 0 &&
            t <= 1 &&
            Math.hypot(p[0] - a[0] - t * dx, p[2] - a[2] - t * dz) < 1e-7
          );
        })
      ).toBe(true);
  });
});
