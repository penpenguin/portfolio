export type Point3 = readonly [number, number, number];
export type LineKind = 'outline' | 'component' | 'detail';
export type DevicePart =
  'head' | 'neck' | 'shaft' | 'pommel' | 'cooling' | 'wiring';
export type DeviceEdge = Readonly<{
  a: Point3;
  b: Point3;
  kind: LineKind;
  part: DevicePart;
}>;

export function createDeviceGeometry(): readonly DeviceEdge[] {
  const edges = new Map<string, DeviceEdge>();
  const vertices = new Map<string, Point3>();
  let part: DevicePart = 'shaft';
  const rank = { outline: 3, component: 2, detail: 1 };
  function vertex(point: Point3) {
    const rounded = point.map(
      (value) => Math.round(value * 1e8) / 1e8
    ) as unknown as Point3;
    const key = rounded.join(',');
    if (!vertices.has(key)) vertices.set(key, Object.freeze(rounded));
    return vertices.get(key)!;
  }
  function line(from: Point3, to: Point3, kind: LineKind = 'component') {
    const a = vertex(from),
      b = vertex(to);
    if (a === b) return;
    const key = [a.join(','), b.join(',')].sort().join('|');
    const previous = edges.get(key);
    if (!previous || rank[kind] > rank[previous.kind])
      edges.set(key, Object.freeze({ a, b, kind, part }));
  }
  function trace(
    points: readonly Point3[],
    kind: LineKind = 'component',
    closed = false
  ) {
    for (let i = 1; i < points.length; i++)
      line(points[i - 1], points[i], kind);
    if (closed) line(points[points.length - 1], points[0], kind);
  }
  function radial(
    radius: number,
    y: number,
    angle: number,
    tangent = 0
  ): Point3 {
    return [
      radius * Math.cos(angle) - tangent * Math.sin(angle),
      y,
      radius * Math.sin(angle) + tangent * Math.cos(angle),
    ];
  }
  function ring(radius: number, y: number, count = 8): Point3[] {
    return Array.from({ length: count }, (_, i) =>
      radial(radius, y, (i * Math.PI * 2) / count)
    );
  }
  function sleeve(
    sections: readonly (readonly [number, number])[],
    kind: LineKind = 'component'
  ) {
    const rings = sections.map(([radius, y]) => ring(radius, y));
    for (const points of rings) trace(points, kind, true);
    for (let row = 1; row < rings.length; row++)
      rings[row].forEach((point, i) => line(rings[row - 1][i], point, kind));
  }
  function plate(
    points: Point3[],
    offset: Point3,
    kind: LineKind = 'component'
  ) {
    const back = points.map(
      (p) => p.map((n, i) => n + offset[i]) as unknown as Point3
    );
    trace(points, kind, true);
    trace(back, 'detail', true);
    points.forEach((p, i) => line(p, back[i], kind));
  }

  function shaft() {
    part = 'shaft';
    // One long quiet octagonal span separates the head's machinery from the heel.
    sleeve(
      [
        [0.115, -4.3],
        [0.115, 1.15],
      ],
      'outline'
    );
    sleeve([
      [0.115, -4.3],
      [0.145, -4.18],
      [0.145, -3.9],
      [0.115, -3.82],
    ]);
    sleeve([
      [0.115, 0.6],
      [0.145, 0.68],
      [0.145, 0.92],
      [0.115, 1.0],
    ]);
  }
  function pommel() {
    part = 'pommel';
    sleeve(
      [
        [0.07, -5],
        [0.16, -4.83],
        [0.16, -4.42],
        [0.115, -4.3],
      ],
      'outline'
    );
  }
  function neck() {
    part = 'neck';
    sleeve(
      [
        [0.115, 1.15],
        [0.2, 1.28],
        [0.2, 1.48],
        [0.3, 1.65],
      ],
      'outline'
    );
    sleeve([
      [0.3, 1.65],
      [0.3, 1.82],
    ]);
  }

  function head() {
    part = 'head';
    const blades = [
      { degrees: 208, tip: 5, reach: 0.44, shoulder: 1.04 },
      { degrees: 25, tip: 4.55, reach: 0.72, shoulder: 1.02 },
      { degrees: 115, tip: 4.12, reach: 0.64, shoulder: 0.9 },
      { degrees: 300, tip: 3.58, reach: 0.98, shoulder: 1.06 },
    ];
    blades.forEach(({ degrees, tip, reach, shoulder }) => {
      const angle = (degrees * Math.PI) / 180;
      const at = (r: number, y: number, t: number) => radial(r, y, angle, t);
      const height = tip - 1.65;
      const profile = [
        [0.3, 1.65],
        [0.64, 1.65 + height * 0.2],
        [shoulder, 1.65 + height * 0.5],
        [shoulder - 0.2, 1.65 + height * 0.58],
        [reach, tip],
        [0.4, 1.65 + height * 0.48],
        [0.3, 1.65 + height * 0.22],
      ];
      const front = profile.map(([r, y], i) => at(r, y, i === 4 ? 0 : -0.055));
      const back = profile.map(([r, y], i) => at(r, y, i === 4 ? 0 : 0.055));
      trace(front, 'outline', true);
      trace(back, 'component', true);
      front.forEach((point, i) => line(point, back[i]));
      // Each blade has a forked seat on the neck, rather than a floating petal.
      const mounts = ring(0.3, 1.65);
      const seat = Math.round(degrees / 45) % 8;
      line(mounts[seat], front[0], 'outline');
      line(mounts[(seat + 1) % 8], back[0]);
      const armStart = ring(0.3, 1.82)[seat];
      trace([armStart, at(0.44, 2.03, -0.055), front[1]], 'outline');
      trace([armStart, at(0.44, 2.03, 0.055), back[1]]);
      // A folded inner rail follows the blade; it is not a triangulated mesh.
      trace([
        front[0],
        at(0.48, 1.65 + height * 0.28, -0.055),
        at(shoulder - 0.15, 1.65 + height * 0.49, -0.055),
        front[4],
      ]);
      for (let rib = 0; rib < 3; rib++) {
        const y = 1.65 + height * (0.23 + rib * 0.07);
        const r = 0.48 + rib * 0.075;
        trace(
          [
            at(r, y, -0.055),
            at(r + 0.13, y + 0.05, -0.055),
            at(r + 0.14, y + 0.13, -0.055),
            at(r + 0.01, y + 0.08, -0.055),
          ],
          'detail',
          true
        );
      }
      // Small socket heads stay near the seats, away from the sharp outline.
      for (const y of [1.83, 2.03]) {
        const r = 0.33 + (y - 1.83) * 0.6;
        trace(
          Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return at(r + 0.035 * Math.cos(a), y + 0.035 * Math.sin(a), -0.055);
          }),
          'detail',
          true
        );
      }
    });
  }

  function mechanism() {
    part = 'head';
    sleeve([
      [0.235, 1.82],
      [0.235, 3.62],
      [0.12, 3.93],
    ]);
    ring(0.235, 1.82).forEach((p, i) => line(p, ring(0.3, 1.82)[i]));
    // Two small split collars tie the axial instrument to its mounting ribs.
    for (const [y, radius] of [
      [2.16, 0.37],
      [3.18, 0.34],
    ]) {
      const low = ring(radius, y, 12),
        high = ring(radius, y + 0.09, 12);
      for (let sector = 0; sector < 4; sector++) {
        const i = sector * 3;
        trace(
          [low[i], low[i + 1], low[i + 2], high[i + 2], high[i + 1], high[i]],
          'component',
          true
        );
        line(radial(0.235, y, (sector * Math.PI) / 2), low[i]);
      }
    }
    for (const degrees of [22.5, 157.5, 247.5]) {
      const angle = (degrees * Math.PI) / 180;
      const at = (r: number, y: number, t: number) => radial(r, y, angle, t);
      const face = 0.235 * Math.cos(Math.PI / 8);
      // Raised control packages sit on the prism faces; leads return to them.
      for (const y of [2.38, 2.86]) {
        plate(
          [
            at(face, y, -0.09),
            at(face, y + 0.27, -0.09),
            at(face, y + 0.27, 0.09),
            at(face, y, 0.09),
          ],
          [0.12 * Math.cos(angle), 0, 0.12 * Math.sin(angle)]
        );
        for (const side of [-1, 1])
          for (let pin = 0; pin < 3; pin++) {
            const py = y + 0.045 + pin * 0.08;
            trace(
              [
                at(face + 0.12, py, side * 0.09),
                at(face + 0.12, py, side * 0.13),
                at(face, py + 0.035, side * 0.08),
              ],
              'detail'
            );
          }
      }
    }
  }

  function cooling() {
    part = 'cooling';
    const angle = Math.PI / 2;
    const at = (r: number, y: number, t: number) => radial(r, y, angle, t);
    // Fins grow directly from two axial rails in the head's open side.
    for (const t of [-0.13, 0.13]) {
      trace([
        at(0.235, 2.3, 0),
        at(0.3, 2.3, t),
        at(0.3, 3.3, t),
        at(0.235, 3.3, 0),
      ]);
    }
    for (let i = 0; i < 6; i++) {
      const y = 2.38 + i * 0.16;
      plate(
        [
          at(0.3, y, -0.13),
          at(0.62, y, -0.13),
          at(0.72, y, 0),
          at(0.62, y, 0.13),
          at(0.3, y, 0.13),
        ],
        [0, 0.035, 0],
        i === 0 || i === 5 ? 'component' : 'detail'
      );
      line(at(0.39, y, -0.09), at(0.59, y, 0.05), 'detail');
    }
  }

  function harnesses() {
    for (const [angle, destination] of [
      [0, 2.85],
      [Math.PI, 3.3],
    ]) {
      const at = (r: number, y: number, t = 0) => radial(r, y, angle, t);
      const section = (r: number, y: number, radius: number) =>
        Array.from({ length: 8 }, (_, i) =>
          at(
            r + radius * Math.cos((i * Math.PI) / 4),
            y,
            radius * Math.sin((i * Math.PI) / 4)
          )
        );
      const route = Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        return [
          0.345 * (1 - t) ** 2 + 2 * 0.68 * t * (1 - t) + 0.32 * t ** 2,
          1.65 + (destination - 1.65) * t,
        ] as const;
      });
      for (const [index, name] of [
        [0, 'neck'],
        [10, 'head'],
      ] as const) {
        part = name;
        const [r, y] = route[index];
        const mouth = section(r, y, 0.045);
        const seat = section(r, y + (index === 0 ? -0.1 : 0.1), 0.065);
        trace(mouth, 'component', true);
        trace(seat, 'component', true);
        for (const i of [0, 2, 4, 6]) line(mouth[i], seat[i]);
        line(at(name === 'neck' ? 0.3 : 0.235, y), mouth[4]);
      }
      part = 'wiring';
      const sections = route.map(([r, y]) => section(r, y, 0.045));
      for (const i of [0, 2, 4, 6]) trace(sections.map((points) => points[i]));
      // A compact clamp gathers the contours halfway along each conduit.
      trace(sections[5], 'detail', true);
      for (const tangent of [-0.085, 0.085]) {
        const signal = route.map(([r, y]) => at(r - 0.07, y, tangent));
        // Terminal lugs give both ends of the fine signal paths real sockets.
        for (const index of [0, 10]) {
          part = index === 0 ? 'neck' : 'head';
          trace(
            [
              signal[index],
              at(route[index][0] - 0.07, route[index][1] + 0.07, tangent),
              section(...route[index], 0.045)[tangent < 0 ? 6 : 2],
            ],
            'detail',
            true
          );
        }
        part = 'wiring';
        trace(signal, 'detail');
      }
    }
  }

  shaft();
  pommel();
  neck();
  head();
  mechanism();
  cooling();
  harnesses();

  // Split at shared mounting vertices before deduplication. A short bracket edge
  // can otherwise overdraw part of a longer beam and defeat the opacity hierarchy.
  const assembled = [...edges.values()];
  const junctions = [...vertices.values()];
  const byAxis = [0, 1, 2].map((axis) =>
    [...junctions].sort((a, b) => a[axis] - b[axis])
  );
  function lowerBound(points: Point3[], axis: number, value: number) {
    let low = 0,
      high = points.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (points[mid][axis] < value) low = mid + 1;
      else high = mid;
    }
    return low;
  }
  edges.clear();
  for (const edge of assembled) {
    const delta = edge.b.map((n, i) => n - edge.a[i]);
    const lengths = delta.map(Math.abs);
    const axis = lengths.indexOf(Math.max(...lengths));
    const splits = [
      { point: edge.a, t: 0 },
      { point: edge.b, t: 1 },
    ];
    const candidates = byAxis[axis];
    const start = lowerBound(
      candidates,
      axis,
      Math.min(edge.a[axis], edge.b[axis])
    );
    const end = lowerBound(
      candidates,
      axis,
      Math.max(edge.a[axis], edge.b[axis])
    );
    for (let j = start; j < end; j++) {
      const point = candidates[j];
      const t = (point[axis] - edge.a[axis]) / delta[axis];
      if (t <= 1e-8 || t >= 1 - 1e-8) continue;
      if (point.every((n, i) => Math.abs(n - edge.a[i] - t * delta[i]) < 1e-8))
        splits.push({ point, t });
    }
    splits.sort((a, b) => a.t - b.t);
    part = edge.part;
    for (let i = 1; i < splits.length; i++)
      line(splits[i - 1].point, splits[i].point, edge.kind);
  }
  return Object.freeze([...edges.values()]);
}
