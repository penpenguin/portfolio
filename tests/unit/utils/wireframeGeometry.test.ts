import { describe, expect, it } from 'vitest';
import { createStaffShells } from '../../../src/utils/wireframeStaffShells';
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
    expect(headLength / length).toBeGreaterThanOrEqual(0.35);
    expect(headLength / length).toBeLessThanOrEqual(0.4);
    const shaft = pointsFor('shaft');
    const shaftLength =
      Math.max(...shaft.map((p) => p[1])) - Math.min(...shaft.map((p) => p[1]));
    expect(shaftLength / length).toBeGreaterThanOrEqual(0.52);
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

  it('assembles both curved shells with thickness and shared mounting points', () => {
    const edges = createDeviceGeometry();
    const head = edges.filter((e) => e.part === 'head');
    for (const shell of createStaffShells()) {
      for (const path of [
        shell.outer,
        shell.inner,
        shell.backOuter,
        shell.backInner,
      ]) {
        for (const point of path) {
          expect(
            head.some((e) =>
              [e.a, e.b].some((p) =>
                p.every((n, i) => Math.abs(n - point[i]) < 1e-7)
              )
            )
          ).toBe(true);
        }
      }
    }
    const headPoints = [...new Set(head.flatMap((e) => [e.a, e.b]))];
    expect(headPoints.filter((p) => p[1] === 5)).toHaveLength(1);
  });

  it('braces curved bands with short cross-ribs and keeps a pair of straight axial rails', () => {
    const edges = createDeviceGeometry().filter((e) => e.part === 'head');
    const near = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-7);
    for (const shell of createStaffShells())
      for (const i of [8, 24, 40]) {
        const midpoint = shell.outer[i].map(
          (n, axis) => (n + shell.inner[i][axis]) / 2
        );
        const cross = edges.filter((e) =>
          [e.a, e.b].some((p) => near(p, midpoint))
        );
        expect(
          cross.some((e) => [e.a, e.b].some((p) => near(p, shell.outer[i])))
        ).toBe(true);
        expect(
          cross.some((e) => [e.a, e.b].some((p) => near(p, shell.inner[i])))
        ).toBe(true);
      }
    const rails = edges.filter(
      ({ a, b, kind }) =>
        kind === 'component' &&
        a[0] === b[0] &&
        a[2] === b[2] &&
        Math.abs(a[1] - b[1]) > 1.2 &&
        Math.hypot(a[0], a[2]) > 0.3
    );
    expect(rails.length).toBeGreaterThanOrEqual(2);
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
    // The secondary arm uses component lines; connectivity must include it too.
    for (const shell of createStaffShells())
      for (const point of [
        ...shell.outer,
        ...shell.inner,
        ...shell.backOuter,
        ...shell.backInner,
      ])
        expect(
          [...reached].some((p) =>
            p.every((n, i) => Math.abs(n - point[i]) < 1e-7)
          )
        ).toBe(true);
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
          (p) => p[1] >= 1.25 && p[1] <= 3.5 && Math.hypot(p[0], p[2]) < 0.8
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
        e.a[1] === 1.45 &&
        e.b[1] === 1.45 &&
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
