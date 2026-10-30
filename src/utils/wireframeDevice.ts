import { createDeviceGeometry, type Point3 } from './wireframeGeometry';
export type { Point3 } from './wireframeGeometry';

const styles = {
  outline: { width: 1.1, back: 0.58, front: 0.88 },
  component: { width: 0.8, back: 0.3, front: 0.56 },
  detail: { width: 0.5, back: 0.14, front: 0.28 },
};
const maxStroke = Math.max(...Object.values(styles).map(({ width }) => width));
export const initialAngle = Math.PI / 6;
export const deviceDescription =
  '環状コア、基板、冷却部、配線を持つ演算装置の線画';
const turn = Math.PI * 2;
const elevation = Math.PI / 9;

// Canonical vertices are shared by adjacent parts and projected once per frame.
const edges = createDeviceGeometry();
const vertices = [...new Set(edges.flatMap(({ a, b }) => [a, b]))];
const indices = new Map(vertices.map((point, index) => [point, index]));
const indexedEdges = edges.map(({ a, b, kind }) => ({
  a: indices.get(a)!,
  b: indices.get(b)!,
  ...styles[kind],
}));

export function advanceAngle(angle: number, elapsedMs: number): number {
  return (angle + (elapsedMs / 16000) * turn) % turn;
}

// Screen tilt is measured from vertical, after the elevated camera transform.
export function createDeviceProjector(screenTiltDegrees: number) {
  const tilt = Math.atan(
    Math.tan((screenTiltDegrees * Math.PI) / 180) * Math.cos(elevation)
  );
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
    far: Infinity,
    near: -Infinity,
  };
  for (const [x, y, z] of vertices) {
    const radius = Math.hypot(x, z);
    const centerX = -y * sinTilt;
    const rangeX = radius * cosTilt;
    const centerY = y * cosTilt * cosElevation;
    const rangeY = radius * Math.hypot(sinTilt * cosElevation, sinElevation);
    const centerDepth = y * cosTilt * sinElevation;
    const rangeDepth =
      radius * Math.hypot(sinTilt * sinElevation, cosElevation);
    bounds.left = Math.min(bounds.left, centerX - rangeX);
    bounds.right = Math.max(bounds.right, centerX + rangeX);
    bounds.bottom = Math.min(bounds.bottom, centerY - rangeY);
    bounds.top = Math.max(bounds.top, centerY + rangeY);
    bounds.far = Math.min(bounds.far, centerDepth - rangeDepth);
    bounds.near = Math.max(bounds.near, centerDepth + rangeDepth);
  }

  function getFit(width: number, height: number) {
    const scale = Math.max(
      0,
      0.78 *
        Math.min(
          (width - maxStroke) / (bounds.right - bounds.left),
          (height - maxStroke) / (bounds.top - bounds.bottom)
        )
    );
    return {
      scale,
      centerX: width / 2 - ((bounds.left + bounds.right) / 2) * scale,
      centerY: height / 2 + ((bounds.bottom + bounds.top) / 2) * scale,
    };
  }

  function createProjection(angle: number, width: number, height: number) {
    const { scale, centerX, centerY } = getFit(width, height);
    const cosAngle = Math.cos(angle),
      sinAngle = Math.sin(angle);
    return ([x, y, z]: Point3) => {
      const rotatedX = x * cosAngle + z * sinAngle;
      const rotatedZ = -x * sinAngle + z * cosAngle;
      // Rz(tilt) * Ry(angle): the axis is tilted once and never precesses.
      const tiltedX = rotatedX * cosTilt - y * sinTilt;
      const tiltedY = rotatedX * sinTilt + y * cosTilt;
      return {
        x: centerX + tiltedX * scale,
        y: centerY - (tiltedY * cosElevation - rotatedZ * sinElevation) * scale,
        depth: tiltedY * sinElevation + rotatedZ * cosElevation,
      };
    };
  }

  function projectDevicePoint(
    point: Point3,
    angle: number,
    width: number,
    height: number
  ) {
    return createProjection(angle, width, height)(point);
  }

  function projectDevice(angle: number, width: number, height: number) {
    const project = createProjection(angle, width, height);
    const points = vertices.map(project);
    return indexedEdges.map(({ a, b, width, back, front }) => {
      const from = points[a],
        to = points[b];
      const depth = Math.max(
        0,
        Math.min(
          1,
          ((from.depth + to.depth) / 2 - bounds.far) /
            (bounds.near - bounds.far)
        )
      );
      return {
        from,
        to,
        width,
        opacity: back + (front - back) * depth,
      };
    });
  }
  return { projectDevice, projectDevicePoint, getFit };
}

export const { projectDevice, projectDevicePoint } = createDeviceProjector(35);
