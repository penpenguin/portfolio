type Point3 = readonly [number, number, number];
type LineKind = 'outline' | 'component' | 'detail';
type Edge = { a: Point3; b: Point3; kind: LineKind };
const styles = {
  outline: { width: 0.95, strength: 1 },
  component: { width: 0.8, strength: 0.85 },
  detail: { width: 0.6, strength: 0.65 },
};

export const initialAngle = Math.PI / 6;
const turn = Math.PI * 2;
const elevation = Math.PI / 9;
const tilt = -Math.PI / 15;

const edges: Edge[] = [];

function box(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  kind: LineKind = 'component'
) {
  const points: Point3[] = [
    [x, y, z],
    [x + w, y, z],
    [x + w, y, z + d],
    [x, y, z + d],
    [x, y + h, z],
    [x + w, y + h, z],
    [x + w, y + h, z + d],
    [x, y + h, z + d],
  ];
  for (const [a, b] of [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ])
    edges.push({ a: points[a], b: points[b], kind });
}

// Closed rings on horizontal boards or the vertical backplane.
function ring(x: number, y: number, z: number, r: number, vertical = false) {
  const point = (step: number): Point3 => {
    const a = Math.cos((step * turn) / 12) * r;
    const b = Math.sin((step * turn) / 12) * r;
    return vertical ? [x + a, y + b, z] : [x + a, y, z + b];
  };
  for (let i = 0; i < 12; i++)
    edges.push({ a: point(i), b: point(i + 1), kind: 'detail' });
}
function trace(points: Point3[], kind: LineKind = 'detail') {
  for (let i = 1; i < points.length; i++)
    edges.push({ a: points[i - 1], b: points[i], kind });
}
function capacitor(x: number, y: number, z: number, r: number, h: number) {
  ring(x, y, z, r);
  ring(x, y + h, z, r);
  for (const offset of [-r, r])
    trace(
      [
        [x + offset, y, z],
        [x + offset, y + h, z],
      ],
      'component'
    );
}
function cable(a: Point3, b: Point3, c: Point3) {
  const points: Point3[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10,
      u = 1 - t;
    points.push([
      u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
      u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
      u * u * a[2] + 2 * u * t * b[2] + t * t * c[2],
    ]);
  }
  trace(points, 'component');
}

// Compact open chassis. The backplane links unequal compute and cooling boards.
box(-0.575, -0.9, -0.4, 1.15, 1.8, 0.8, 'outline');
for (const x of [-0.55, 0.52])
  for (const z of [-0.375, 0.345]) box(x, -0.86, z, 0.03, 1.72, 0.03);
box(-0.47, -0.74, -0.33, 0.94, 1.44, 0.035);
box(-0.48, -0.73, -0.29, 0.96, 0.035, 0.61);
box(-0.46, -0.15, -0.29, 0.68, 0.035, 0.6);
box(-0.12, 0.43, -0.28, 0.58, 0.035, 0.49);

// Backplane slots, mounting screws and a small cluster of controllers.
for (const x of [-0.41, 0.41])
  for (const y of [-0.66, 0.62]) ring(x, y, -0.29, 0.026, true);
for (const [x, y, w] of [
  [-0.37, -0.57, 0.25],
  [-0.07, 0.17, 0.36],
  [-0.39, 0.45, 0.16],
]) {
  box(x, y, -0.29, w, 0.09, 0.065);
  for (let i = 0; i < 5; i++)
    trace([
      [x + 0.025 + (i * w) / 6, y, -0.225],
      [x + 0.025 + (i * w) / 6, y - 0.04, -0.225],
    ]);
}
for (const [x, y, z] of [
  [-0.4, -0.69, 0.25],
  [0.4, -0.69, 0.25],
  [-0.4, -0.11, 0.25],
  [0.16, -0.11, 0.25],
  [-0.06, 0.47, 0.15],
  [0.4, 0.47, 0.15],
])
  ring(x, y, z, 0.025);

// Dense compute area with pins and varied memory packages, leaving a clear right bay.
box(-0.29, -0.115, -0.1, 0.3, 0.11, 0.25);
for (let i = 0; i < 8; i++) {
  const x = -0.27 + i * 0.037;
  for (const z of [-0.15, 0.2])
    trace([
      [x, -0.11, z],
      [x, -0.065, z],
      [x, -0.065, z < 0 ? -0.1 : 0.15],
    ]);
}
for (const z of [-0.19, 0, 0.15]) box(-0.43, -0.11, z, 0.07, 0.055, 0.12);
for (const [x, z, r, h] of [
  [0.12, -0.19, 0.033, 0.16],
  [0.12, -0.04, 0.035, 0.12],
  [0.12, 0.11, 0.028, 0.1],
])
  capacitor(x, -0.11, z, r, h);

// Offset finned cooler, with circular collars and a connected power section below.
box(-0.055, 0.47, -0.22, 0.42, 0.05, 0.33);
for (let i = 0; i < 7; i++)
  box(-0.045 + i * 0.064, 0.52, -0.2, 0.012, 0.22, 0.29, 'detail');
ring(0.15, 0.77, -0.06, 0.1);
ring(0.15, 0.77, -0.06, 0.072);
box(-0.32, -0.69, -0.13, 0.28, 0.14, 0.22);
for (const x of [0.08, 0.23, 0.37]) capacitor(x, -0.69, -0.11, 0.044, 0.2);
for (let i = 0; i < 5; i++) box(-0.36 + i * 0.16, -0.69, 0.21, 0.09, 0.1, 0.1);

// Board-to-board connections: routed traces and a pair of curved harnesses.
for (let i = 0; i < 3; i++) {
  const x = -0.28 + i * 0.08;
  trace([
    [x, -0.69, 0.21],
    [x, -0.69, 0.08],
    [-0.18, -0.69, 0.08],
    [-0.18, -0.55, 0.08],
  ]);
}
for (const offset of [0, 0.045]) {
  cable(
    [0.36, -0.49, -0.1 + offset],
    [0.56, 0.08, 0.24 + offset],
    [0.32, 0.47, 0.1 + offset]
  );
  trace([
    [-0.41 + offset, -0.11, -0.18],
    [-0.41 + offset, 0.22, -0.18],
    [-0.18 + offset, 0.22, -0.26],
  ]);
}

// Analytic bounds of every vertex over a whole turn, after the fixed tilt and
// camera transform. Compute once; frame-to-frame fitting would make it breathe.
const cosTilt = Math.cos(tilt),
  sinTilt = Math.sin(tilt);
const cosElevation = Math.cos(elevation),
  sinElevation = Math.sin(elevation);
const bounds = {
  left: Infinity,
  right: -Infinity,
  bottom: Infinity,
  top: -Infinity,
};
for (const { a, b } of edges) {
  for (const [x, y, z] of [a, b]) {
    const radius = Math.hypot(x, z);
    const centerX = -y * sinTilt;
    const rangeX = radius * cosTilt;
    const centerY = y * cosTilt * cosElevation;
    const rangeY = radius * Math.hypot(sinTilt * cosElevation, sinElevation);
    bounds.left = Math.min(bounds.left, centerX - rangeX);
    bounds.right = Math.max(bounds.right, centerX + rangeX);
    bounds.bottom = Math.min(bounds.bottom, centerY - rangeY);
    bounds.top = Math.max(bounds.top, centerY + rangeY);
  }
}

export function advanceAngle(angle: number, elapsedMs: number): number {
  return (angle + (elapsedMs / 16000) * turn) % turn;
}

export function projectDevice(angle: number, width: number, height: number) {
  const scale = Math.max(
    0,
    0.78 *
      Math.min(
        (width - 1) / (bounds.right - bounds.left),
        (height - 1) / (bounds.top - bounds.bottom)
      )
  );
  const cosAngle = Math.cos(angle),
    sinAngle = Math.sin(angle);
  const project = ([x, y, z]: Point3) => {
    const rotatedX = x * cosAngle + z * sinAngle;
    const rotatedZ = -x * sinAngle + z * cosAngle;
    // Rz(tilt) * Ry(angle): the axis is tilted once and never precesses.
    const tiltedX = rotatedX * cosTilt - y * sinTilt;
    const tiltedY = rotatedX * sinTilt + y * cosTilt;
    return {
      x: width / 2 + (tiltedX - (bounds.left + bounds.right) / 2) * scale,
      y:
        height / 2 -
        (tiltedY * cosElevation -
          rotatedZ * sinElevation -
          (bounds.bottom + bounds.top) / 2) *
          scale,
      depth: tiltedY * sinElevation + rotatedZ * cosElevation,
    };
  };
  return edges.map(({ a, b, kind }) => {
    const from = project(a),
      to = project(b);
    return {
      from,
      to,
      width: styles[kind].width,
      opacity:
        (0.52 + ((from.depth + to.depth) / 2) * 0.22) * styles[kind].strength,
    };
  });
}
