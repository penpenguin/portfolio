import { describe, expect, it } from 'vitest';
import { createStaffShells } from '../../../src/utils/wireframeStaffShells';
import { createDeviceGeometry } from '../../../src/utils/wireframeGeometry';
import { projectDevicePoint } from '../../../src/utils/wireframeDevice';

describe('industrial control staff geometry', () => {
  it('mounts a half-sector petal on the higher-angle prism corner deterministically', () => {
    const edges = createDeviceGeometry();
    // The first middle petal sits at 22.5 degrees, exactly between prism corners.
    const seat = [0.21868627, 1.1, 0.16715136];
    const corner = [0.16617009, 1.1, 0.16617009];
    const same = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-8);
    expect(
      edges.some(
        ({ a, b }) =>
          (same(a, seat) && same(b, corner)) ||
          (same(b, seat) && same(a, corner))
      )
    ).toBe(true);
  });
  it('draws shared mounting spans only once, including partially overlapping edges', () => {
    const edges = createDeviceGeometry();
    let overlaps = 0;
    const bounds = edges
      .map((edge) => ({
        edge,
        min: edge.a.map((n, axis) => Math.min(n, edge.b[axis])),
        max: edge.a.map((n, axis) => Math.max(n, edge.b[axis])),
      }))
      .sort((a, b) => a.min[0] - b.min[0]);
    // Broad-phase boxes avoid quadratic scans of disjoint curved petal segments.
    bounds.forEach(({ edge, min, max }, i) => {
      const delta = edge.b.map((n, axis) => n - edge.a[axis]);
      const axis = delta
        .map(Math.abs)
        .indexOf(Math.max(...delta.map(Math.abs)));
      for (
        let j = i + 1;
        j < bounds.length && bounds[j].min[0] <= max[0] + 1e-8;
        j++
      ) {
        const candidate = bounds[j];
        if (
          [1, 2].some(
            (k) =>
              candidate.min[k] > max[k] + 1e-8 ||
              candidate.max[k] < min[k] - 1e-8
          )
        )
          continue;
        const other = candidate.edge;
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
    expect(length).toBeGreaterThanOrEqual(9.7);
    expect(length).toBeLessThanOrEqual(10);
    expect(diameter).toBeGreaterThanOrEqual(3.2);
    expect(diameter).toBeLessThanOrEqual(3.6);
    const headLength =
      Math.max(...head.map((p) => p[1])) - Math.min(...head.map((p) => p[1]));
    expect(headLength / length).toBeGreaterThanOrEqual(0.43);
    expect(headLength / length).toBeLessThanOrEqual(0.46);
    const shaft = pointsFor('shaft');
    const shaftLength =
      Math.max(...shaft.map((p) => p[1])) - Math.min(...shaft.map((p) => p[1]));
    expect(shaftLength / length).toBeGreaterThanOrEqual(0.44);
    expect(
      (2 * Math.max(...shaft.map((p) => Math.hypot(p[0], p[2])))) / length
    ).toBeLessThan(0.06);
    const quiet = edges.filter(
      (e) =>
        e.part === 'shaft' &&
        Math.min(e.a[1], e.b[1]) <= -2.6 &&
        Math.max(e.a[1], e.b[1]) >= -1.1
    );
    expect(quiet.length).toBeGreaterThanOrEqual(6);
    expect(
      Math.max(...quiet.map((e) => Math.abs(e.a[1] - e.b[1])))
    ).toBeGreaterThanOrEqual(1.5);
    expect(
      quiet.every(
        (e) => e.a[0] === e.b[0] && e.a[2] === e.b[2] && e.kind !== 'detail'
      )
    ).toBe(true);
    expect(
      Math.max(...pointsFor('pommel').map((p) => Math.hypot(p[0], p[2])))
    ).toBeLessThan(diameter / 5);
  });

  it('adds a mounted upper cable, a lower auxiliary bar and a stepped heel', () => {
    const edges = createDeviceGeometry();
    const radius = (p: readonly number[]) => Math.hypot(p[0], p[2]);
    const cable = edges.filter(
      (e) => e.part === 'wiring' && Math.min(e.a[1], e.b[1]) < 0
    );
    expect(cable.length).toBeGreaterThan(0);
    expect(
      Math.max(...cable.flatMap((e) => [radius(e.a), radius(e.b)]))
    ).toBeGreaterThan(0.3);
    expect(
      cable.every((e) =>
        [e.a, e.b].every((p) => radius(p) <= 0.52 && p[1] >= -0.95)
      )
    ).toBe(true);
    const bar = edges.filter(
      ({ a, b, part }) =>
        part === 'shaft' &&
        Math.hypot(a[0] - b[0], a[2] - b[2]) <= 0.1 &&
        Math.abs(a[1] - b[1]) >= 0.85 &&
        radius(a) > 0.22 &&
        Math.min(a[1], b[1]) >= -3.9 &&
        Math.max(a[1], b[1]) <= -2.6
    );
    expect(bar.length).toBeGreaterThanOrEqual(2);
    const raised = (low: number, high: number) =>
      edges.filter(
        (e) =>
          e.part === 'shaft' &&
          [e.a, e.b].every((p) => p[1] >= low && p[1] <= high) &&
          Math.max(radius(e.a), radius(e.b)) > 0.15
      );
    expect(raised(-1, 0.35).length).toBeGreaterThan(0);
    expect(raised(-4.3, -2.6).length).toBeGreaterThan(0);
    expect(raised(-2.6, -1.1)).toHaveLength(0);
    expect(
      edges.some(
        (e) =>
          e.part === 'pommel' &&
          [e.a, e.b].every((p) => p[1] < -4.4 && radius(p) > 0.17)
      )
    ).toBe(true);
    // New appendages must join the existing physical structure, including both cable ends.
    const reached = new Set(
      edges.filter((e) => e.part === 'pommel').flatMap((e) => [e.a, e.b])
    );
    let size = 0;
    while (size !== reached.size) {
      size = reached.size;
      for (const { a, b } of edges)
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
    }
    expect(
      [...bar, ...cable, ...raised(-1, 0.35)].every(
        (e) => reached.has(e.a) && reached.has(e.b)
      )
    ).toBe(true);
  });

  it('places one asymmetric lower clamp, a gently offset auxiliary bar and a small terminal accent', () => {
    const edges = createDeviceGeometry();
    const clamp = edges.filter(
      (e) =>
        e.part === 'shaft' &&
        [e.a, e.b].every((p) => p[1] >= -2.8 && p[1] <= -2.6) &&
        Math.max(e.a[0], e.b[0]) > 0.22
    );
    expect(clamp.length).toBeGreaterThan(0);
    expect(
      edges.some(
        ({ a, b, part }) =>
          part === 'shaft' &&
          Math.min(a[1], b[1]) >= -3.9 &&
          Math.max(a[1], b[1]) < -2.7 &&
          Math.abs(a[1] - b[1]) > 0.85 &&
          Math.hypot(a[0] - b[0], a[2] - b[2]) > 0.04
      )
    ).toBe(true);
    const heel = edges.filter((e) => e.part === 'pommel');
    expect(
      Math.max(
        ...heel.flatMap((e) => [e.a, e.b]).map((p) => Math.hypot(p[0], p[2]))
      )
    ).toBeGreaterThan(0.2);
    expect(
      Math.max(
        ...heel.flatMap((e) => [e.a, e.b]).map((p) => Math.hypot(p[0], p[2]))
      )
    ).toBeLessThan(0.24);
    const reached = new Set(
      edges.filter((e) => e.part === 'neck').flatMap((e) => [e.a, e.b])
    );
    let count = 0;
    while (count !== reached.size) {
      count = reached.size;
      for (const { a, b } of edges)
        if (reached.has(a) || reached.has(b)) {
          reached.add(a);
          reached.add(b);
        }
    }
    expect(
      [...clamp, ...heel].every((e) => reached.has(e.a) && reached.has(e.b))
    ).toBe(true);
  });

  it('ties pairs of outer petals together and braces the two main curves with straight struts', () => {
    const edges = createDeviceGeometry();
    const outer = createStaffShells()
      .filter((p) => p.layer === 'outer')
      .sort((a, b) => a.azimuth - b.azimuth);
    const near = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-7);
    for (const petal of outer.filter((p) => p.profile.role === 'primary')) {
      for (const side of ['backLeft', 'backRight'] as const) {
        const lower = petal.anchors[0][side],
          upper = petal.anchors[1][side];
        expect(
          edges.some(
            (e) =>
              e.kind === 'component' && near(e.a, lower) && near(e.b, upper)
          )
        ).toBe(true);
      }
    }
    // A curved yoke leaves each first hinge and reaches the next petal's hinge.
    for (const i of [0, 2, 4]) {
      const source = outer[i].anchors[0].backRight;
      const destination = outer[i + 1].anchors[0].backLeft;
      const braces = edges.filter(
        (e) =>
          e.kind === 'component' &&
          e.part === 'head' &&
          [e.a, e.b].every((p) => Math.hypot(p[0], p[2]) > 0.5 && p[1] < 2.1)
      );
      const reached = new Set(
        braces.flatMap((e) => [e.a, e.b]).filter((p) => near(p, source))
      );
      let size = 0;
      while (size !== reached.size) {
        size = reached.size;
        for (const e of braces)
          if (reached.has(e.a) || reached.has(e.b)) {
            reached.add(e.a);
            reached.add(e.b);
          }
      }
      expect([...reached].some((p) => near(p, destination))).toBe(true);
    }
  });

  it('assembles all nineteen cupped petals with thickness and shared mounting points', () => {
    const edges = createDeviceGeometry();
    const head = edges.filter((e) => e.part === 'head');
    for (const shell of createStaffShells()) {
      for (const path of [
        shell.left,
        shell.right,
        shell.backLeft.filter((_, i) => shell.parameters[i] <= 0.5),
        shell.backRight.filter((_, i) => shell.parameters[i] <= 0.5),
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
    expect(Math.max(...headPoints.map((p) => p[1]))).toBeCloseTo(4.9);
  });

  it('gives the main petals a distinct contour weight and an elongated quarter-turn silhouette', () => {
    const edges = createDeviceGeometry();
    const near = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-7);
    for (const petal of createStaffShells()) {
      const kind = petal.profile.role === 'primary' ? 'outline' : 'component';
      for (const path of [petal.left, petal.right])
        expect(
          edges.some(
            (e) =>
              e.kind === kind &&
              near(e.a, path.at(-2)!) &&
              near(e.b, path.at(-1)!)
          )
        ).toBe(true);
    }
    const points = edges
      .filter((e) => e.part === 'head')
      .flatMap((e) => [e.a, e.b]);
    for (const phase of [Math.PI / 2, (3 * Math.PI) / 2]) {
      const projected = points.map((p) =>
        projectDevicePoint(p, phase, 267, 258)
      );
      const width =
        Math.max(...projected.map((p) => p.x)) -
        Math.min(...projected.map((p) => p.x));
      const height =
        Math.max(...projected.map((p) => p.y)) -
        Math.min(...projected.map((p) => p.y));
      expect(height / width).toBeGreaterThan(1.1);
    }
  });

  it('anchors open guards outboard of the main petal bellies and exposes three slender upper columns', () => {
    const edges = createDeviceGeometry();
    const near = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-7);
    for (const petal of createStaffShells().filter(
      (p) => p.profile.role === 'primary'
    ))
      for (const side of ['backLeft', 'backRight'] as const) {
        const anchor = petal.anchors[1][side];
        expect(
          edges.some(
            (e) =>
              e.kind !== 'detail' &&
              [e.a, e.b].some((p) => near(p, anchor)) &&
              Math.max(...[e.a, e.b].map((p) => Math.hypot(p[0], p[2]))) >
                Math.hypot(anchor[0], anchor[2]) + 0.08
          )
        ).toBe(true);
      }
    const columns = edges.filter(
      ({ a, b, kind, part }) =>
        part === 'head' &&
        kind === 'component' &&
        a[0] === b[0] &&
        a[2] === b[2] &&
        Math.max(a[1], b[1]) > 4 &&
        Math.min(a[1], b[1]) < 3.5 &&
        Math.hypot(a[0], a[2]) < 0.4
    );
    expect(columns).toHaveLength(6);
    expect(new Set(columns.map((e) => Math.max(e.a[1], e.b[1]))).size).toBe(3);
    expect(Math.max(...columns.flatMap((e) => [e.a[1], e.b[1]]))).toBeLessThan(
      4.5
    );
  });

  it('braces every petal with short cross-ribs and keeps a pair of straight axial rails', () => {
    const edges = createDeviceGeometry().filter((e) => e.part === 'head');
    const near = (a: readonly number[], b: readonly number[]) =>
      a.every((n, i) => Math.abs(n - b[i]) < 1e-7);
    for (const petal of createStaffShells()) {
      for (const rib of petal.crossRibs) {
        for (let i = 1; i < rib.points.length; i++)
          expect(
            edges.some(
              (e) =>
                e.kind === 'detail' &&
                near(e.a, rib.points[i - 1]) &&
                near(e.b, rib.points[i])
            )
          ).toBe(true);
      }
      for (let i = 1; i < petal.spine.length; i++)
        expect(
          edges.some(
            (e) =>
              e.kind !== 'detail' &&
              near(e.a, petal.spine[i - 1]) &&
              near(e.b, petal.spine[i])
          )
        ).toBe(false);
      // The upper back is not another pair of uninterrupted parallel contours.
      const index = petal.parameters.findIndex((t) => t >= 0.8);
      for (const side of ['backLeft', 'backRight'] as const)
        expect(
          edges.some(
            (e) =>
              near(e.a, petal[side][index]) && near(e.b, petal[side][index + 1])
          )
        ).toBe(false);
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

  it('exposes a mounted straight pin cluster inside the upright inner crown', () => {
    const edges = createDeviceGeometry().filter((e) => e.part === 'head');
    const pins = edges.filter(
      ({ a, b, kind }) =>
        kind === 'detail' &&
        a[0] === b[0] &&
        a[2] === b[2] &&
        Math.min(a[1], b[1]) >= 3.93 &&
        Math.abs(a[1] - b[1]) > 0.1 &&
        Math.max(a[1], b[1]) < 4.35 &&
        Math.hypot(a[0], a[2]) < 0.4
    );
    expect(pins).toHaveLength(18);
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
    // Every layer must be connected, including the component-weight inner petals.
    for (const shell of createStaffShells())
      for (const point of [
        ...shell.left,
        ...shell.right,
        ...shell.backLeft.filter((_, i) => shell.parameters[i] <= 0.5),
        ...shell.backRight.filter((_, i) => shell.parameters[i] <= 0.5),
      ])
        expect(
          [...reached].some((p) =>
            p.every((n, i) => Math.abs(n - point[i]) < 1e-7)
          )
        ).toBe(true);
    for (const part of ['shaft', 'neck', 'head']) {
      const contour = edges.filter(
        (e) =>
          e.part === part &&
          (part === 'shaft' ? e.kind === 'component' : e.kind === 'outline')
      );
      expect(contour.length).toBeGreaterThan(0);
      expect(contour.every((e) => reached.has(e.a) && reached.has(e.b))).toBe(
        true
      );
    }
  });
  it('concentrates fine detail in the head above the quieter shaft', () => {
    const edges = createDeviceGeometry();
    const fine = edges.filter((e) => e.kind === 'detail');
    expect(fine.length).toBeGreaterThan(0);
    expect(
      fine.filter((e) => e.a[1] >= 0.5 && e.b[1] >= 0.5).length / fine.length
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
          (p) => p[1] >= -0.95 && p[1] <= 3.5 && Math.hypot(p[0], p[2]) < 0.8
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
        e.a[1] === 0.5 &&
        e.b[1] === 0.5 &&
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
