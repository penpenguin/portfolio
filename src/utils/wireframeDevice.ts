import { createDeviceGeometry, type Point3 } from './wireframeGeometry';
export type { Point3 } from './wireframeGeometry';

const styles = {
  outline: { width: 1.1, back: 0.58, front: 0.88 },
  component: { width: 0.8, back: 0.3, front: 0.56 },
  detail: { width: 0.5, back: 0.14, front: 0.28 },
};
const maxStroke = Math.max(...Object.values(styles).map(({ width }) => width));
export const initialModelYaw = Math.PI / 6;
export const initialSpinPhase = 0;
export const deviceDescription = '多層の機械蓮と細長い軸を持つSF制御杖の線画';
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

// Screen tilt describes the initial pose only; time rotates the whole inclined
// staff around the world Y axis through the fixed model origin.
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
  const cosYaw = Math.cos(initialModelYaw),
    sinYaw = Math.sin(initialModelYaw);
  function initialPose([x, y, z]: Point3): Point3 {
    const yawX = x * cosYaw + z * sinYaw;
    return [
      yawX * cosTilt - y * sinTilt,
      yawX * sinTilt + y * cosTilt,
      -x * sinYaw + z * cosYaw,
    ];
  }
  // Bake the fixed pose once, not for every frame or elapsed-time increment.
  const posedVertices = vertices.map(initialPose);
  const bounds = {
    left: Infinity,
    right: -Infinity,
    bottom: Infinity,
    top: -Infinity,
    far: Infinity,
    near: -Infinity,
  };
  for (const [x, y, z] of posedVertices) {
    const radius = Math.hypot(x, z);
    const centerY = y * cosElevation;
    const rangeY = radius * Math.abs(sinElevation);
    const centerDepth = y * sinElevation;
    const rangeDepth = radius * Math.abs(cosElevation);
    bounds.left = Math.min(bounds.left, -radius);
    bounds.right = Math.max(bounds.right, radius);
    bounds.bottom = Math.min(bounds.bottom, centerY - rangeY);
    bounds.top = Math.max(bounds.top, centerY + rangeY);
    bounds.far = Math.min(bounds.far, centerDepth - rangeDepth);
    bounds.near = Math.max(bounds.near, centerDepth + rangeDepth);
  }

  function getFit(width: number, height: number) {
    const scale = Math.max(
      0,
      0.84 *
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

  function createWorldRotation(spinPhase: number) {
    const cosine = Math.cos(spinPhase),
      sine = Math.sin(spinPhase);
    return ([x, y, z]: Point3): Point3 => [
      x * cosine + z * sine,
      y,
      -x * sine + z * cosine,
    ];
  }

  function transformDevicePoint(point: Point3, spinPhase: number) {
    return createWorldRotation(spinPhase)(initialPose(point));
  }

  function createProjection(spinPhase: number, width: number, height: number) {
    const { scale, centerX, centerY } = getFit(width, height);
    const rotate = createWorldRotation(spinPhase);
    return (point: Point3) => {
      const [x, y, z] = rotate(point);
      return {
        x: centerX + x * scale,
        y: centerY - (y * cosElevation - z * sinElevation) * scale,
        depth: y * sinElevation + z * cosElevation,
      };
    };
  }

  function projectWorldPoint(
    point: Point3,
    spinPhase: number,
    width: number,
    height: number
  ) {
    return createProjection(spinPhase, width, height)(point);
  }

  function projectDevicePoint(
    point: Point3,
    spinPhase: number,
    width: number,
    height: number
  ) {
    return projectWorldPoint(initialPose(point), spinPhase, width, height);
  }

  function projectDevice(spinPhase: number, width: number, height: number) {
    const project = createProjection(spinPhase, width, height);
    const points = posedVertices.map(project);
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
  return {
    projectDevice,
    projectDevicePoint,
    projectWorldPoint,
    transformDevicePoint,
    getFit,
    bounds: Object.freeze(bounds),
  };
}

export const { projectDevice, projectDevicePoint } = createDeviceProjector(35);
