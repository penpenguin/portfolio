import { createStaffShells } from './wireframeStaffShells';

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
  const petals = createStaffShells();
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
    // Keep a continuous octagonal shaft through the unevenly spaced fittings.
    sleeve([
      [0.115, -4.3],
      [0.115, 0.15],
    ]);
    sleeve([
      [0.115, -4.3],
      [0.145, -4.18],
      [0.145, -3.9],
      [0.115, -3.82],
    ]);
    sleeve([
      [0.115, -0.95],
      [0.17, -0.915],
      [0.17, -0.845],
      [0.115, -0.81],
    ]);
    sleeve([
      [0.115, -2.8],
      [0.16, -2.78],
      [0.16, -2.66],
      [0.115, -2.64],
    ]);
    // Only this lower sleeve has an offset jaw. Its inner edge meets two collar corners.
    plate(
      [
        [0.16, -2.78, -0.06],
        [0.25, -2.75, -0.06],
        [0.25, -2.64, -0.06],
        [0.16, -2.66, -0.06],
      ],
      [0, 0, 0.12]
    );
    line([0.25, -2.75, -0.06], [0.25, -2.64, 0.06], 'detail');
    // A short rigid offset member closes the lower silhouette. Both ends
    // return to shaft corners, leaving the middle free of raised machinery.
    const angle = Math.PI;
    for (const t of [-0.025, 0.025])
      trace([
        radial(0.115, -3.82, angle),
        radial(0.23, -3.72, angle, t),
        radial(0.285, -2.82, angle, t),
        radial(0.25, -2.7, angle, t),
        radial(0.115, -2.66, angle),
      ]);
    for (const [r, y] of [
      [0.23, -3.72],
      [0.285, -2.82],
      [0.25, -2.7],
    ])
      line(radial(r, y, angle, -0.025), radial(r, y, angle, 0.025));
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
    sleeve([
      [0.16, -4.76],
      [0.215, -4.72],
      [0.215, -4.62],
      [0.16, -4.58],
    ]);
    for (const angle of [Math.PI / 2, (Math.PI * 3) / 2])
      trace([
        radial(0.16, -4.83, angle),
        radial(0.215, -4.72, angle),
        radial(0.215, -4.62, angle),
        radial(0.16, -4.42, angle),
      ]);
    for (const angle of [0, Math.PI])
      trace(
        [
          radial(0.07, -5, angle),
          radial(0.1, -4.94, angle),
          radial(0.16, -4.83, angle),
        ],
        'detail'
      );
  }
  function neck() {
    part = 'neck';
    sleeve(
      [
        [0.115, 0.15],
        [0.18, 0.26],
        [0.18, 0.36],
        [0.32, 0.5],
      ],
      'outline'
    );
  }

  function head() {
    part = 'head';
    for (const layer of ['outer', 'middle', 'inner'] as const) {
      const mounted = petals.filter((p) => p.layer === layer);
      trace(
        mounted.map((p) => p.mount),
        'component',
        true
      );
      for (const { mount, azimuth } of mounted) {
        // Use the configured angle without a round trip through atan2. Resolve
        // exact half-sector ties consistently across Node and browser engines.
        const angle =
          (Math.round(azimuth / (Math.PI / 4) + 1e-10) * Math.PI) / 4;
        line(radial(0.235, mount[1], angle), mount);
      }
    }
    for (const petal of petals) {
      const { left, right, backLeft, backRight, mount } = petal;
      const kind = petal.profile.role === 'primary' ? 'outline' : 'component';
      trace(left, kind);
      trace(right, kind);
      // The lower back carries the hinge and ribs. Avoid duplicating both front
      // contours all the way to the tip at sub-pixel separation.
      trace(backLeft.filter((_, i) => petal.parameters[i] <= 0.5));
      trace(backRight.filter((_, i) => petal.parameters[i] <= 0.5));
      trace([left[0], right[0], backRight[0], backLeft[0]], kind, true);
      // A hinge and fork carry each cupped shell into its own staggered collar.
      line(mount, left[0], kind);
      line(mount, right[0], kind);
      const fork = petal.anchors[0];
      line(mount, fork.backLeft);
      line(mount, fork.backRight);
      for (const anchor of petal.anchors.filter((a) => a.t <= 0.5)) {
        line(anchor.left, anchor.backLeft);
        line(anchor.right, anchor.backRight);
      }
    }
  }

  function petalDetails() {
    part = 'head';
    for (const petal of petals) {
      if (petal.layer !== 'inner') {
        trace(petal.spine, 'detail');
        petal.ribs.forEach((rib) =>
          trace(
            rib.filter(
              (_, i) => petal.parameters[i] >= 0.2 && petal.parameters[i] <= 0.5
            ),
            'detail'
          )
        );
        const fork = petal.anchors[0];
        trace([fork.backLeft, ...fork.ribs, fork.backRight], 'detail');
      }
      for (const rib of petal.crossRibs) {
        trace(rib.points, 'detail');
        const i = petal.parameters.indexOf(rib.t);
        line(petal.left[i], rib.points[0], 'detail');
        line(petal.right[i], rib.points[rib.points.length - 1], 'detail');
      }
    }
  }

  function petalSupports() {
    part = 'head';
    const outer = petals
      .filter((p) => p.layer === 'outer')
      .sort((a, b) => a.azimuth - b.azimuth);
    for (const i of [0, 2, 4]) {
      const a = outer[i].anchors[0].backRight;
      const b = outer[i + 1].anchors[0].backLeft;
      // A stepped, open channel joins each pair of forks. Its two rails and
      // straight returns read as a restraint rather than another floral arc.
      const path: Point3[] = [
        a,
        [a[0] * 1.12, a[1] - 0.13, a[2] * 1.12],
        [b[0] * 1.12, b[1] - 0.13, b[2] * 1.12],
        b,
      ];
      const lower = path.map(([x, y, z]): Point3 => [x, y - 0.07, z]);
      trace(path);
      trace(lower);
      path.forEach((point, j) => line(point, lower[j]));
      line(outer[i].mount, path[1]);
      line(outer[i + 1].mount, path[2]);
    }
    for (const p of outer.filter((p) => p.profile.role === 'primary')) {
      // A small socket closes onto the root, with a bracket behind each edge.
      plate([p.mount, p.left[0], p.right[0]], [0, -0.08, 0]);
      for (const side of ['backLeft', 'backRight'] as const) {
        const lower = p.anchors[0][side],
          upper = p.anchors[1][side];
        const outboard = ([x, y, z]: Point3): Point3 => {
          const factor = 1 + 0.14 / Math.hypot(x, z);
          return [x * factor, y, z * factor];
        };
        const foot = outboard(lower),
          shoulder = outboard(upper);
        const knee: Point3 = [
          (foot[0] + shoulder[0]) / 2,
          (foot[1] + shoulder[1]) / 2 - 0.12,
          (foot[2] + shoulder[2]) / 2,
        ];
        line(lower, upper);
        trace([lower, foot, knee, shoulder, upper]);
        // Two straight links connect the socket to the restrained belly.
        trace([p.mount, knee, upper], 'outline');
      }
    }
  }

  function sepals() {
    part = 'neck';
    // Short recurved calyx supports wrap the lower collar, not a second crown.
    for (let i = 0; i < 6; i++) {
      const angle = ((i * 60 + 30) * Math.PI) / 180;
      const at = (r: number, y: number, t = 0) => radial(r, y, angle, t);
      const root = radial(
        0.115,
        0.15,
        (Math.round(angle / (Math.PI / 4)) * Math.PI) / 4
      );
      const left: Point3[] = [],
        right: Point3[] = [];
      for (let j = 0; j <= 12; j++) {
        const t = j / 12;
        const radius = 0.19 + 0.58 * Math.sin((t * Math.PI) / 2);
        const y = 0.28 + (1.05 + (i % 3) * 0.07) * t - 0.15 * t * t;
        const width = 0.035 * (1 - t) + 0.1 * Math.sin(Math.PI * t);
        left.push(at(radius, y, -width));
        right.push(at(radius, y, width));
      }
      trace([root, ...left, ...right.slice().reverse(), root]);
      const collar = radial(
        0.32,
        0.5,
        (Math.round(angle / (Math.PI / 4)) * Math.PI) / 4
      );
      line(collar, left[5]);
      line(collar, right[5]);
      line(left[5], right[5], 'detail');
    }
  }

  function mechanism() {
    part = 'head';
    sleeve([
      [0.235, 0.5],
      [0.235, 3.62],
      [0.12, 3.93],
    ]);
    ring(0.235, 0.5).forEach((p, i) => line(p, ring(0.32, 0.5)[i]));
    // Two staggered pin groups form a mechanical pistil around an open centre.
    const cap = ring(0.12, 3.93);
    const heights = [4.23, 4.18, 4.31, 4.22, 4.28, 4.16, 4.25, 4.19, 4.27];
    for (let i = 0; i < heights.length; i++) {
      const angle = ((i * 40 + 10) * Math.PI) / 180;
      const radius = i % 2 ? 0.3 : 0.21;
      const seat = radial(radius, 3.96, angle);
      const left = radial(radius, 3.96, angle, -0.022);
      const right = radial(radius, 3.96, angle, 0.022);
      line(cap[Math.round((i * 40 + 10) / 45) % 8], seat);
      trace(
        [
          seat,
          left,
          [left[0], heights[i] - 0.06, left[2]],
          radial(radius, heights[i], angle),
          [right[0], heights[i] - 0.06, right[2]],
          right,
          seat,
        ],
        'detail'
      );
    }
    const pistilCollar = ring(0.3, 3.96, 12);
    for (const i of [0, 4, 8]) {
      trace(pistilCollar.slice(i, i + 3));
      line(cap[Math.round((i * 2) / 3)], pistilCollar[i]);
    }
    // Three separated columns rise through the shorter inner petals. The open
    // centre and unequal caps keep this a frame, below the two main petal tips.
    for (const [degrees, top] of [
      [22.5, 4.35],
      [112.5, 4.22],
      [247.5, 4.12],
    ]) {
      const angle = (degrees * Math.PI) / 180;
      const corner = (Math.round(degrees / 45 + 1e-10) * Math.PI) / 4;
      const root = radial(0.235, 1.74, corner);
      trace([
        root,
        radial(0.35, 1.86, angle, -0.035),
        radial(0.35, top - 0.06, angle, -0.035),
        radial(0.35, top, angle),
        radial(0.35, top - 0.06, angle, 0.035),
        radial(0.35, 1.86, angle, 0.035),
        root,
      ]);
      const seat = radial(0.235, 3.18, corner);
      trace([
        radial(0.35, 3.18, angle, -0.035),
        seat,
        radial(0.35, 3.18, angle, 0.035),
      ]);
    }
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

  function shaftHarness() {
    // The upper cable is a narrow outlined conduit, anchored at a head socket
    // and a shaft clamp. Its bow contrasts with the straight lower auxiliary bar.
    const angle = Math.PI / 4;
    const route = Array.from({ length: 17 }, (_, i): Point3 => {
      const t = i / 16;
      return radial(
        0.17 + 0.15 * t + 0.23 * Math.sin(Math.PI * t),
        -0.88 + 1.38 * t,
        angle
      );
    });
    const side = (p: Point3, offset: number): Point3 => [
      p[0] - offset * Math.sin(angle),
      p[1],
      p[2] + offset * Math.cos(angle),
    ];
    const left = route.map((p) => side(p, -0.025));
    const right = route.map((p) => side(p, 0.025));
    part = 'wiring';
    trace(left);
    trace(right);
    for (const index of [0, 16]) {
      part = index === 0 ? 'shaft' : 'neck';
      const seat = route[index];
      trace([
        seat,
        left[index],
        side([seat[0], seat[1] + 0.07, seat[2]], -0.04),
        side([seat[0], seat[1] + 0.07, seat[2]], 0.04),
        right[index],
        seat,
      ]);
    }
    // The lower fitting is on the existing sleeve side; the upper on a neck corner.
    part = 'shaft';
    line(radial(0.17, -0.845, angle), route[0]);
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
          0.5 + (destination - 0.5) * t,
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
        line(at(name === 'neck' ? 0.32 : 0.235, y), mouth[4]);
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
  sepals();
  petalSupports();
  shaftHarness();
  petalDetails();
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
