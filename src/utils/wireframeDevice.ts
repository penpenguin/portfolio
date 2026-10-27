type Point3 = readonly [number, number, number];
type Edge = readonly [Point3, Point3];

export const initialAngle = Math.PI / 6;
const turn = Math.PI * 2;
const elevation = Math.PI / 9;
const radius = Math.hypot(0.5, 0.4);

const edges: Edge[] = [];

function box(x: number, y: number, z: number, w: number, h: number, d: number) {
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
    edges.push([points[a], points[b]]);
}

// Open chassis, support columns, three circuit layers, heat sink and terminals.
box(-0.5, -1.2, -0.4, 1, 2.4, 0.8);
for (const x of [-0.47, 0.44]) {
  for (const z of [-0.37, 0.34]) box(x, -1.17, z, 0.03, 2.34, 0.03);
}
for (const y of [-0.85, -0.1, 0.65]) box(-0.41, y, -0.32, 0.82, 0.04, 0.64);
box(-0.22, -0.06, -0.18, 0.44, 0.18, 0.36);
box(-0.28, 0.69, -0.23, 0.56, 0.05, 0.46);
for (let i = 0; i < 6; i++) box(-0.26 + i * 0.1, 0.74, -0.21, 0.02, 0.22, 0.42);
for (let i = 0; i < 4; i++) box(-0.32 + i * 0.18, -0.81, 0.22, 0.1, 0.12, 0.14);

export function advanceAngle(angle: number, elapsedMs: number): number {
  return (angle + (elapsedMs / 16000) * turn) % turn;
}

export function projectDevice(angle: number, width: number, height: number) {
  // A rotation-invariant cylinder bounds every vertex; the camera never zooms.
  const scale = Math.max(
    0,
    Math.min(
      (width - 32) / (radius * 2),
      (height - 32) /
        (2.4 * Math.cos(elevation) + radius * 2 * Math.sin(elevation))
    )
  );
  const project = ([x, y, z]: Point3) => {
    const rotatedX = x * Math.cos(angle) + z * Math.sin(angle);
    const rotatedZ = -x * Math.sin(angle) + z * Math.cos(angle);
    return {
      x: width / 2 + rotatedX * scale,
      y:
        height / 2 -
        (y * Math.cos(elevation) - rotatedZ * Math.sin(elevation)) * scale,
      depth: y * Math.sin(elevation) + rotatedZ * Math.cos(elevation),
    };
  };
  return edges.map(([a, b]) => {
    const from = project(a);
    const to = project(b);
    return { from, to, opacity: 0.52 + ((from.depth + to.depth) / 2) * 0.22 };
  });
}
