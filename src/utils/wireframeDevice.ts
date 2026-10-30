import { createDeviceGeometry, type Point3 } from './wireframeGeometry';
export type { Point3 } from './wireframeGeometry';

const styles = {
  outline: { width: 0.95, strength: 1 },
  component: { width: 0.8, strength: 0.85 },
  detail: { width: 0.6, strength: 0.65 },
};
export const initialAngle = Math.PI / 6;
export const deviceDescription =
  '環状コア、基板、冷却部、配線を持つ演算装置の線画';
const turn = Math.PI * 2;
const elevation = Math.PI / 9;
const tilt = Math.PI / 15;

// Canonical vertices are shared by adjacent parts and projected once per frame.
const edges = createDeviceGeometry();
const vertices = [...new Set(edges.flatMap(({ a, b }) => [a, b]))];
const indices = new Map(vertices.map((point, index) => [point, index]));
const indexedEdges = edges.map(({ a, b, kind }) => ({
  a: indices.get(a)!,
  b: indices.get(b)!,
  ...styles[kind],
}));

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
for (const [x, y, z] of vertices) {
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

export function advanceAngle(angle: number, elapsedMs: number): number {
  return (angle + (elapsedMs / 16000) * turn) % turn;
}

function createProjection(angle: number, width: number, height: number) {
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
  return ([x, y, z]: Point3) => {
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
}

export function projectDevicePoint(
  point: Point3,
  angle: number,
  width: number,
  height: number
) {
  return createProjection(angle, width, height)(point);
}

export function projectDevice(angle: number, width: number, height: number) {
  const project = createProjection(angle, width, height);
  const points = vertices.map(project);
  return indexedEdges.map(({ a, b, width, strength }) => {
    const from = points[a],
      to = points[b];
    return {
      from,
      to,
      width,
      opacity: Math.max(
        0,
        Math.min(1, (0.52 + ((from.depth + to.depth) / 2) * 0.22) * strength)
      ),
    };
  });
}
