export type Point3 = readonly [number, number, number];
export type LineKind = 'outline' | 'component' | 'detail';
export type DevicePart =
  'frame' | 'core' | 'boards' | 'cooling' | 'connectors' | 'wiring';
export type DeviceEdge = Readonly<{
  a: Point3;
  b: Point3;
  kind: LineKind;
  part: DevicePart;
}>;

const add = (a: Point3, b: Point3): Point3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

export function createDeviceGeometry(): readonly DeviceEdge[] {
  const edges = new Map<string, DeviceEdge>();
  const vertices = new Map<string, Point3>();
  let part: DevicePart = 'frame';
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
  function extrude(
    points: readonly Point3[],
    offset: Point3,
    kind: LineKind = 'component'
  ) {
    const back = points.map((point) => add(point, offset));
    trace(points, kind, true);
    trace(back, kind, true);
    points.forEach((point, i) => line(point, back[i], kind));
  }
  function strut(a: Point3, b: Point3, offset: Point3 = [0, 0, 0.045]) {
    trace([a, b, add(b, offset), add(a, offset)], 'outline', true);
  }
  function circle(
    center: Point3,
    radius: number,
    axis: 'y' | 'z' = 'z',
    count = 12
  ): Point3[] {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i * Math.PI * 2) / count;
      const a = Math.cos(angle) * radius,
        b = Math.sin(angle) * radius;
      return add(center, axis === 'z' ? [a, b, 0] : [a, 0, b]);
    });
  }
  function box(origin: Point3, size: Point3, kind: LineKind = 'component') {
    const [w, h, d] = size;
    extrude(
      [
        origin,
        add(origin, [w, 0, 0]),
        add(origin, [w, 0, d]),
        add(origin, [0, 0, d]),
      ],
      [0, h, 0],
      kind
    );
  }
  function card(
    origin: Point3,
    u: Point3,
    v: Point3,
    normal: Point3,
    w: number,
    h: number
  ) {
    const at = (x: number, y: number, z = 0): Point3 =>
      origin.map(
        (n, i) => n + u[i] * x + v[i] * y + normal[i] * z
      ) as unknown as Point3;
    extrude(
      [at(0, 0), at(w, 0), at(w, h - 0.05), at(w - 0.05, h), at(0, h)],
      normal.map((n) => n * 0.025) as unknown as Point3
    );
    const packageAt = (
      x: number,
      y: number,
      width: number,
      height: number,
      rise: number
    ) => {
      extrude(
        [
          at(x, y, 0.025),
          at(x + width, y, 0.025),
          at(x + width, y + height, 0.025),
          at(x, y + height, 0.025),
        ],
        normal.map((n) => n * rise) as unknown as Point3
      );
    };
    const chipWidth = w * 0.48,
      chipHeight = h * 0.3;
    packageAt(0.06, 0.14, chipWidth, chipHeight, 0.06);
    trace(
      [
        at(0.09, 0.17, 0.085),
        at(0.03 + chipWidth, 0.17, 0.085),
        at(0.03 + chipWidth, 0.11 + chipHeight, 0.085),
        at(0.09, 0.11 + chipHeight, 0.085),
      ],
      'detail',
      true
    );
    for (let i = 0; i < (h > 0.6 ? 3 : 2); i++)
      packageAt(w - 0.1, 0.09 + i * 0.15, 0.065, 0.085, 0.045);
    for (let i = 1; i <= 4; i++) {
      const x = 0.06 + (i * chipWidth) / 5;
      for (const [y, direction] of [
        [0.14, -1],
        [0.14 + chipHeight, 1],
      ])
        trace(
          [
            at(x, y, 0.06),
            at(x, y + direction * 0.03, 0.06),
            at(x, y + direction * 0.06, 0.025),
          ],
          'detail'
        );
      trace(
        [
          at(x, 0.08, 0.025),
          at(x, 0.055, 0.025),
          at(x + 0.018, 0.037, 0.025),
          at(x + 0.018, 0.02, 0.025),
        ],
        'detail'
      );
    }
    packageAt(0.055, 0.005, chipWidth + 0.035, 0.03, 0.04);
    for (const [x, y] of [
      [0.035, 0.055],
      [w - 0.04, h - 0.07],
    ])
      trace(
        Array.from({ length: 8 }, (_, i) =>
          at(
            x + Math.cos((i * Math.PI) / 4) * 0.016,
            y + Math.sin((i * Math.PI) / 4) * 0.016,
            0.025
          )
        ),
        'detail',
        true
      );
  }

  function electronics() {
    part = 'frame';
    strut([-0.58, -0.43, -0.29], [-0.26, -0.64, -0.32]);
    strut([-0.58, 0.39, -0.29], corePoint(12, 0.5, -0.32));
    strut([-0.4, -0.38, -0.56], [-0.22, -0.64, -0.46]);
    strut([-0.4, 0.12, -0.56], [-0.22, 0.08, -0.46]);
    strut([-0.63, -0.51, -0.26], [-0.58, -0.43, -0.29]);
    strut([-0.27, -0.51, -0.26], [-0.26, -0.64, -0.32]);
    part = 'boards';
    card([-0.58, -0.43, -0.29], [0, 0, 1], [0, 1, 0], [-1, 0, 0], 0.48, 0.82);
    card(
      [-0.4, -0.38, -0.56],
      [0.94, 0, -0.342],
      [0, 1, 0],
      [-0.342, 0, -0.94],
      0.45,
      0.5
    );
    card([-0.63, -0.51, -0.26], [1, 0, 0], [0, 0, 1], [0, 1, 0], 0.36, 0.46);
  }

  function cooling() {
    part = 'cooling';
    box([0.54, 0.31, -0.25], [0.24, 0.055, 0.5]);
    for (let i = 0; i < 9; i++) {
      const z = -0.24 + i * 0.058;
      extrude(
        [
          [0.56, 0.365, z],
          [0.78, 0.365, z],
          [0.78, 0.56, z],
          [0.71, 0.64, z],
          [0.56, 0.64, z],
        ],
        [0, 0, 0.012],
        i === 0 || i === 8 ? 'component' : 'detail'
      );
      line([0.61, 0.41, z], [0.61, 0.57, z], 'detail');
      line([0.69, 0.41, z], [0.69, 0.55, z], 'detail');
    }
    for (const z of [-0.25, 0.25]) {
      trace(
        [[0.54, 0.31, z], corePoint(4, 0.5, z < 0 ? -0.32 : 0.32)],
        'component'
      );
      extrude(circle([0.6, 0.31, z * 0.88], 0.047, 'y', 12), [0, -0.04, 0]);
      line([0.6, 0.27, z * 0.88], [0.647, 0.27, z * 0.88]);
    }
  }

  const routes: readonly (readonly [
    Point3,
    Point3,
    Point3,
    number,
    LineKind,
  ])[] = [
    [
      [-0.26, -0.64, 0.32],
      [-0.69, -0.78, 0.54],
      [-0.63, -0.51, 0.2],
      3,
      'component',
    ],
    [
      [-0.58, 0.34, 0.19],
      [-0.72, 0.48, 0.42],
      corePoint(15, 0.5, 0.32),
      2,
      'detail',
    ],
    [
      [-0.4, -0.38, -0.56],
      [-0.78, -0.2, -0.53],
      [-0.58, -0.43, -0.29],
      2,
      'detail',
    ],
  ];

  function connections() {
    part = 'connectors';
    box([-0.26, -0.82, -0.32], [0.52, 0.18, 0.64]);
    for (const [x, z, radius, h] of [
      [-0.16, -0.17, 0.065, 0.19],
      [0.03, -0.14, 0.05, 0.145],
      [0.18, -0.1, 0.035, 0.11],
    ]) {
      extrude(circle([x, -0.64, z], radius, 'y'), [0, h, 0]);
      trace(circle([x, -0.64 + h, z], radius * 0.65, 'y', 8), 'detail', true);
    }
    for (const [x, w, h] of [
      [-0.22, 0.15, 0.075],
      [-0.02, 0.1, 0.1],
      [0.12, 0.11, 0.055],
    ]) {
      box([x, -0.64, 0.13], [w, h, 0.15]);
      for (let i = 0; i < 3; i++)
        extrude(
          circle([x + 0.025 + i * 0.03, -0.605, 0.28], 0.013, 'z', 8),
          [0, 0, 0.025],
          'detail'
        );
    }
    for (let i = 0; i < 5; i++)
      line(
        [-0.18 + i * 0.06, -0.78, 0.32],
        [-0.18 + i * 0.06, -0.71, 0.32],
        'detail'
      );
    for (const [a, , b, count] of routes) {
      for (const anchor of [a, b]) {
        box(anchor, [0.04, 0.035, count * 0.026]);
        for (let i = 0; i < count; i++) {
          const pin = add(anchor, [0, 0, i * 0.026]);
          line(pin, add(pin, [0.04, 0, 0]), 'detail');
          if (i > 0) line(add(anchor, [0, 0, (i - 1) * 0.026]), pin, 'detail');
        }
      }
    }
    for (const center of [
      [-0.16, -0.55, -0.46],
      [-0.1, 0.29, -0.46],
    ] as const)
      trace(circle(center, 0.018, 'z', 8), 'detail', true);
  }

  function curve(a: Point3, control: Point3, b: Point3): Point3[] {
    return Array.from({ length: 13 }, (_, i) => {
      const t = i / 12,
        u = 1 - t;
      return a.map(
        (n, axis) => u * u * n + 2 * u * t * control[axis] + t * t * b[axis]
      ) as unknown as Point3;
    });
  }

  function pipe(a: Point3, control: Point3, b: Point3) {
    const points = curve(a, control, b);
    const normalize = (p: Point3) =>
      p.map((n) => n / Math.hypot(...p)) as unknown as Point3;
    const rings = points.map((center, i) => {
      const previous = points[Math.max(0, i - 1)],
        next = points[Math.min(12, i + 1)];
      const tangent = normalize(
        next.map((n, axis) => n - previous[axis]) as unknown as Point3
      );
      const side = normalize(
        Math.hypot(tangent[0], tangent[2]) > 1e-8
          ? [-tangent[2], 0, tangent[0]]
          : [1, 0, 0]
      );
      const up = [
        tangent[1] * side[2],
        tangent[2] * side[0] - tangent[0] * side[2],
        -tangent[1] * side[0],
      ];
      return Array.from(
        { length: 8 },
        (_, j) =>
          center.map(
            (n, axis) =>
              n +
              0.027 *
                (side[axis] * Math.cos((j * Math.PI) / 4) +
                  up[axis] * Math.sin((j * Math.PI) / 4))
          ) as unknown as Point3
      );
    });
    for (const ray of [0, 2, 4, 6]) trace(rings.map((ring) => ring[ray]));
    for (const i of [0, 12]) trace(rings[i], 'component', true);
    trace(rings[6], 'detail', true);
    // Fitting centres meet the host's mounting vertices; the pipe has no drawn centreline.
    line(a, rings[0][0]);
    line(b, rings[12][0]);
  }

  function harnesses() {
    part = 'wiring';
    for (const z of [-0.32, 0.32])
      pipe(
        corePoint(1, 0.5, z),
        [0.84, 0.02, z * 1.15],
        [0.6, 0.27, z > 0 ? 0.22 : -0.22]
      );
    for (const [a, control, b, count, kind] of routes) {
      const points = curve(a, control, b);
      for (let wire = 0; wire < count; wire++)
        trace(
          points.map((p) => add(p, [0, 0, wire * 0.026])),
          kind
        );
      const mid = points[6];
      extrude(
        [
          add(mid, [-0.014, -0.014, -0.01]),
          add(mid, [0.014, -0.014, -0.01]),
          add(mid, [0.014, 0.014, -0.01]),
          add(mid, [-0.014, 0.014, -0.01]),
        ],
        [0, 0, count * 0.026],
        'detail'
      );
    }
  }

  function skeleton() {
    // A short rear spine and a fork cradle carry the core without a perimeter cage.
    extrude(
      [
        [-0.22, -0.64, -0.46],
        [-0.22, 0.08, -0.46],
        [-0.1, 0.38, -0.46],
        [0, 0.38, -0.46],
        [-0.08, 0.06, -0.46],
        [-0.08, -0.64, -0.46],
      ],
      [0, 0, 0.055],
      'outline'
    );
    strut([-0.22, -0.64, -0.46], [-0.26, -0.64, -0.32]);
    strut([-0.1, 0.38, -0.46], corePoint(12, 0.5, -0.32));
    strut([-0.22, 0.08, -0.46], corePoint(4, 0.5, -0.32));
    for (const z of [-0.32, 0.32])
      strut([-0.26, -0.64, z], [0.26, -0.64, z], [0, -0.055, 0]);
    for (const x of [-0.26, 0.26])
      strut([x, -0.64, -0.32], [x, -0.64, 0.32], [0, -0.055, 0]);
  }
  function corePoint(index: number, radius: number, z: number): Point3 {
    const angle = (index * Math.PI * 2) / 32;
    return [Math.cos(angle) * radius, 0.12 + Math.sin(angle) * radius, z];
  }

  function centralCore() {
    const interpolate = (from: Point3, to: Point3, t: number): Point3 => {
      const a = vertex(from),
        b = vertex(to);
      return a.map((n, i) => n + (b[i] - n) * t) as unknown as Point3;
    };
    part = 'frame';
    for (const z of [-0.32, 0.32]) {
      strut(corePoint(20, 0.5, z), [-0.26, -0.64, z]);
      strut(corePoint(28, 0.5, z), [0.26, -0.64, z]);
    }
    part = 'core';
    // Four open sectors have real front/rear walls; no middle decorative ring.
    for (let sector = 0; sector < 4; sector++) {
      const first = sector * 8 + 1,
        last = first + 6;
      for (const z of [-0.32, 0.32]) {
        const outer = Array.from({ length: 7 }, (_, i) =>
          corePoint(first + i, 0.5, z)
        );
        const inner = Array.from({ length: 7 }, (_, i) =>
          corePoint(first + i, 0.37, z)
        );
        trace(outer, 'outline');
        trace(inner);
        for (const index of [first, last])
          line(corePoint(index, 0.5, z), corePoint(index, 0.37, z), 'outline');
        // Paired edges describe a short spoke, leaving most of the bore open.
        const bearing = circle([0, 0.12, z], 0.125, 'z', 12);
        for (const side of [-0.35, 0.35]) {
          const innerIndex = 3 + side;
          const hubIndex = ((first + innerIndex) * 12) / 32;
          line(
            interpolate(
              bearing[Math.floor(hubIndex)],
              bearing[Math.ceil(hubIndex)],
              hubIndex % 1
            ),
            interpolate(
              inner[Math.floor(innerIndex)],
              inner[Math.ceil(innerIndex)],
              innerIndex % 1
            )
          );
        }
        for (const index of [first + 1, last - 1])
          trace(
            circle(corePoint(index, 0.435, z), 0.018, 'z', 8),
            'detail',
            true
          );
      }
      for (const index of [first, last]) {
        line(
          corePoint(index, 0.5, -0.32),
          corePoint(index, 0.5, 0.32),
          'outline'
        );
        line(corePoint(index, 0.37, -0.32), corePoint(index, 0.37, 0.32));
      }
      // Raised longitudinal ribs make the casing read as a barrel from the side.
      for (const index of [first + 2, first + 4])
        trace([
          corePoint(index, 0.5, -0.32),
          corePoint(index, 0.52, -0.24),
          corePoint(index, 0.52, 0.24),
          corePoint(index, 0.5, 0.32),
        ]);
    }
    extrude(circle([0, 0.12, -0.32], 0.125, 'z', 12), [0, 0, 0.64]);
    for (const z of [-0.32, 0.32])
      extrude(
        circle([0, 0.12, z], 0.075, 'z', 12),
        [0, 0, z > 0 ? 0.03 : -0.03],
        'detail'
      );
  }
  skeleton();
  centralCore();
  electronics();
  cooling();
  connections();
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
