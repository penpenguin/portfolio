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
  function board(x: number, y: number, z: number, w: number, d: number) {
    extrude(
      [
        [x, y, z],
        [x + w - 0.06, y, z],
        [x + w, y, z + 0.06],
        [x + w, y, z + d - 0.04],
        [x + w - 0.04, y, z + d],
        [x, y, z + d],
      ],
      [0, 0.035, 0]
    );
    for (const [dx, dz] of [
      [0.05, 0.05],
      [w - 0.07, d - 0.06],
    ])
      trace(circle([x + dx, y + 0.035, z + dz], 0.023, 'y', 8), 'detail', true);
  }

  function electronics() {
    part = 'boards';
    board(-0.49, -0.48, -0.27, 0.76, 0.65);
    board(-0.49, -0.81, -0.27, 0.9, 0.55);
    board(-0.44, 0.61, -0.23, 0.32, 0.44);
    extrude(
      [
        [-0.46, -0.67, -0.3],
        [-0.18, -0.67, -0.3],
        [-0.18, 0.48, -0.3],
        [-0.29, 0.59, -0.3],
        [-0.46, 0.59, -0.3],
      ],
      [0, 0, 0.025]
    );
    extrude(
      [
        [-0.52, -0.39, -0.18],
        [-0.52, 0.31, -0.18],
        [-0.52, 0.36, -0.13],
        [-0.52, 0.36, 0.15],
        [-0.52, -0.39, 0.15],
      ],
      [0.025, 0, 0]
    );
    // Unequal compute packages, memory banks and bent pin rows.
    box([-0.32, -0.445, 0.02], [0.28, 0.085, 0.23]);
    box([-0.27, -0.36, 0.065], [0.18, 0.018, 0.14], 'detail');
    for (let i = 0; i < 7; i++) {
      const x = -0.3 + i * 0.04;
      for (const z of [-0.02, 0.29])
        trace(
          [
            [x, -0.445, z],
            [x, -0.4, z],
            [x, -0.4, z < 0 ? 0.02 : 0.25],
          ],
          'detail'
        );
    }
    for (let i = 0; i < 3; i++) {
      box([0.04, -0.445, -0.2 + i * 0.17], [0.14, 0.055, 0.095]);
      box([-0.43, -0.445, -0.2 + i * 0.15], [0.07, 0.04, 0.09], 'detail');
    }
    for (const y of [-0.56, -0.2, 0.35]) {
      box([-0.42, y, -0.275], [0.18, 0.115, 0.045]);
      for (let i = 0; i < 5; i++)
        line(
          [-0.4 + i * 0.033, y, -0.23],
          [-0.4 + i * 0.033, y - 0.045, -0.23],
          'detail'
        );
    }
    for (const y of [-0.28, -0.06, 0.16])
      box([-0.495, y, -0.12], [0.05, 0.13, 0.19]);
    box([-0.39, 0.645, -0.15], [0.17, 0.065, 0.19]);
    for (let i = 0; i < 5; i++) {
      const x = -0.37 + i * 0.04;
      trace(
        [
          [x, -0.445, -0.2],
          [x, -0.445, -0.12],
          [x + 0.035, -0.445, -0.085],
          [x + 0.035, -0.445, -0.02],
        ],
        'detail'
      );
    }
    for (let i = 0; i < 4; i++) {
      const x = -0.43 + i * 0.055;
      trace(
        [
          [x, -0.4, -0.272],
          [x, -0.29, -0.272],
          [x + 0.035, -0.255, -0.272],
          [x + 0.035, 0.25, -0.272],
        ],
        'detail'
      );
    }
  }

  function cooling() {
    part = 'cooling';
    box([0.38, 0.46, -0.28], [0.28, 0.06, 0.47]);
    // Slotted, clipped fins distinguish the cooler from a stack of boards.
    for (let i = 0; i < 10; i++) {
      const z = -0.25 + i * 0.046;
      extrude(
        [
          [0.4, 0.52, z],
          [0.69, 0.52, z],
          [0.69, 0.72, z],
          [0.63, 0.78, z],
          [0.4, 0.78, z],
        ],
        [0, 0, 0.012],
        'detail'
      );
      line([0.46, 0.57, z], [0.46, 0.7, z], 'detail');
      line([0.58, 0.57, z], [0.58, 0.7, z], 'detail');
    }
    for (const z of [-0.28, 0.19]) {
      strut([0.38, 0.46, z], z < 0 ? [0.24, 0.82, -0.37] : [0.2, 0.74, 0.34]);
      extrude(circle([0.51, 0.48, z], 0.06, 'z', 12), [0, 0, 0.045]);
    }
  }

  const routes: readonly (readonly [Point3, Point3, Point3, number])[] = [
    [[0.27, -0.7, 0.18], [0.56, -0.5, 0.5], [0.21, -0.43, 0.26], 3],
    [[-0.38, 0.48, -0.275], [-0.66, 0.72, 0.23], [-0.28, 0.645, 0.12], 2],
    [[0.51, 0.48, 0.19], [0.69, 0.28, 0.32], [0.42, 0.18, 0.07], 2],
  ];

  function connections() {
    part = 'connectors';
    box([-0.4, -0.775, -0.16], [0.3, 0.15, 0.24]);
    for (const [x, z, radius, h] of [
      [0.02, -0.15, 0.058, 0.22],
      [0.19, -0.12, 0.044, 0.16],
      [0.31, -0.07, 0.034, 0.12],
    ]) {
      extrude(circle([x, -0.775, z], radius, 'y'), [0, h, 0]);
      trace(circle([x, -0.775 + h, z], radius * 0.6, 'y', 8), 'detail', true);
    }
    for (const [x, w, h] of [
      [-0.4, 0.17, 0.09],
      [-0.16, 0.12, 0.12],
      [0.04, 0.13, 0.075],
    ]) {
      box([x, -0.775, 0.15], [w, h, 0.12]);
      for (let i = 0; i < 3; i++)
        extrude(
          circle([x + 0.03 + i * 0.04, -0.73, 0.27], 0.014, 'z', 8),
          [0, 0, 0.035],
          'detail'
        );
    }
    for (const [a, , b, count] of routes) {
      for (const anchor of [a, b]) {
        box(add(anchor, [-0.025, -0.025, -0.015]), [
          0.07,
          0.05,
          count * 0.026 + 0.02,
        ]);
        for (let i = 0; i < count; i++) {
          const pin = add(anchor, [0, 0, i * 0.026]);
          line(pin, add(pin, [0.035, 0, 0]), 'detail');
        }
      }
    }
    for (const [x, y, z] of [
      [-0.56, -0.75, 0.34],
      [-0.56, 0.45, 0.34],
      [-0.34, 0.72, 0.34],
      [0.18, 0.72, 0.34],
      [0.45, -0.72, -0.32],
    ])
      trace(circle([x, y, z], 0.025, 'z', 8), 'detail', true);
  }

  function harnesses() {
    part = 'wiring';
    for (const [a, control, b, count] of routes) {
      for (let wire = 0; wire < count; wire++) {
        const offset: Point3 = [0, 0, wire * 0.026];
        const points: Point3[] = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12,
            u = 1 - t;
          points.push(
            add(
              [
                u * u * a[0] + 2 * u * t * control[0] + t * t * b[0],
                u * u * a[1] + 2 * u * t * control[1] + t * t * b[1],
                u * u * a[2] + 2 * u * t * control[2] + t * t * b[2],
              ],
              offset
            )
          );
        }
        trace(points);
        if (wire === 0) {
          const mid = points[6];
          extrude(
            [
              add(mid, [-0.016, -0.016, -0.012]),
              add(mid, [0.016, -0.016, -0.012]),
              add(mid, [0.016, 0.016, -0.012]),
              add(mid, [-0.016, 0.016, -0.012]),
            ],
            [0, 0, count * 0.026 + 0.004],
            'detail'
          );
        }
      }
    }
  }

  function skeleton() {
    // The rear yoke and the shorter front rail leave the lower-right bay open.
    extrude(
      [
        [-0.6, -0.82, -0.37],
        [0.32, -0.82, -0.37],
        [0.52, -0.62, -0.37],
        [0.52, 0.5, -0.37],
        [0.24, 0.82, -0.37],
        [-0.4, 0.82, -0.37],
        [-0.6, 0.6, -0.37],
      ],
      [0, 0, 0.045],
      'outline'
    );
    trace(
      [
        [-0.58, -0.82, 0.34],
        [-0.58, 0.5, 0.34],
        [-0.36, 0.74, 0.34],
        [0.2, 0.74, 0.34],
      ],
      'outline'
    );
    trace(
      [
        [-0.54, -0.82, 0.34],
        [-0.54, 0.48, 0.34],
        [-0.34, 0.7, 0.34],
        [0.2, 0.7, 0.34],
      ],
      'component'
    );
    extrude(
      [
        [-0.58, -0.86, -0.35],
        [0.28, -0.86, -0.35],
        [0.49, -0.86, -0.14],
        [0.49, -0.86, 0.24],
        [0.34, -0.86, 0.39],
        [-0.58, -0.86, 0.39],
      ],
      [0, 0.045, 0],
      'outline'
    );
    strut([-0.58, -0.82, 0.34], [-0.6, 0.05, -0.37]);
    strut([-0.58, 0.5, 0.34], [-0.4, 0.82, -0.37]);
    strut([0.2, 0.74, 0.34], [0.24, 0.82, -0.37]);
    strut([0.49, -0.815, 0.24], [0.52, -0.45, -0.37]);
  }
  function centralCore() {
    // Load-bearing arms meet actual collar vertices, not a floating ring's centre.
    for (const z of [-0.14, 0.28]) {
      strut([-0.38, 0.18, z], [-0.58, 0.18, z]);
      strut([0.02, 0.58, z], [0.02, 0.72, z]);
      strut([0.02, -0.22, z], [0.02, -0.445, z]);
    }
    part = 'core';
    for (const z of [-0.14, 0.07, 0.28]) {
      const rim = circle([0.02, 0.18, z], 0.4, 'z', 28);
      const inner = circle([0.02, 0.18, z], 0.345, 'z', 28);
      trace(rim, 'component', true);
      trace(inner, 'component', true);
      for (let i = 0; i < 28; i += 4) line(rim[i], inner[i], 'detail');
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        trace(
          circle(
            [0.02 + Math.cos(angle) * 0.373, 0.18 + Math.sin(angle) * 0.373, z],
            0.017,
            'z',
            8
          ),
          'detail',
          true
        );
      }
      if (z !== 0.07) {
        const hub = circle([0.02, 0.18, z], 0.11, 'z', 28);
        for (let i = 0; i < 28; i += 4) line(hub[i], inner[i]);
      }
    }
    const front = circle([0.02, 0.18, 0.28], 0.4, 'z', 28);
    const rear = circle([0.02, 0.18, -0.14], 0.4, 'z', 28);
    for (let i = 0; i < 28; i += 4) line(front[i], rear[i], 'detail');
    extrude(circle([0.02, 0.18, -0.19], 0.11), [0, 0, 0.52]);
    for (const z of [-0.19, 0.33])
      trace(circle([0.02, 0.18, z], 0.065), 'detail', true);
  }
  skeleton();
  centralCore();
  electronics();
  cooling();
  connections();
  harnesses();
  return Object.freeze([...edges.values()]);
}
