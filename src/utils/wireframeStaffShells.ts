import type { Point3 } from './wireframeGeometry';

type ProfilePoint = readonly [radius: number, height: number];
type Cubic = readonly [ProfilePoint, ProfilePoint, ProfilePoint, ProfilePoint];

function cubicPoint([a, b, c, d]: Cubic, t: number): ProfilePoint {
  const u = 1 - t;
  return [0, 1].map(
    (axis) =>
      u ** 3 * a[axis] +
      3 * u ** 2 * t * b[axis] +
      3 * u * t ** 2 * c[axis] +
      t ** 3 * d[axis]
  ) as unknown as ProfilePoint;
}

// Two joined cubics describe each whole boundary, rather than rounding a polygon.
// At the join, matching control vectors keep the tangent and its speed continuous.
const profiles: readonly {
  degrees: number;
  thickness: number;
  outer: readonly [Cubic, Cubic];
  inner: readonly [Cubic, Cubic];
}[] = [
  {
    degrees: 200,
    thickness: 0.12,
    outer: [
      [
        [0.3, 1.25],
        [1.25, 1.9],
        [1.15, 2.45],
        [0.8, 3],
      ],
      [
        [0.8, 3],
        [0.45, 3.55],
        [0.38, 4.5],
        [0.84, 5],
      ],
    ],
    inner: [
      [
        [0.18, 1.25],
        [0.86, 1.9],
        [0.9, 2.45],
        [0.6, 3],
      ],
      [
        [0.6, 3],
        [0.3, 3.55],
        [0.29, 4.5],
        [0.84, 5],
      ],
    ],
  },
  {
    degrees: 75,
    thickness: 0.1,
    outer: [
      [
        [0.3, 1.25],
        [0.85, 1.55],
        [1.12, 2.15],
        [1.05, 2.7],
      ],
      [
        [1.05, 2.7],
        [0.98, 3.25],
        [0.68, 3.8],
        [0.26, 4.1],
      ],
    ],
    inner: [
      [
        [0.18, 1.25],
        [0.58, 1.55],
        [0.82, 2.15],
        [0.77, 2.7],
      ],
      [
        [0.77, 2.7],
        [0.72, 3.25],
        [0.5, 3.8],
        [0.26, 4.1],
      ],
    ],
  },
];

export function createStaffShells(steps = 24) {
  return profiles.map(({ degrees, thickness, outer, inner }) => {
    const angle = (degrees * Math.PI) / 180;
    function boundary(curves: readonly Cubic[], side: number): Point3[] {
      return Array.from({ length: 2 * steps + 1 }, (_, i) => {
        const span = Math.min(Math.floor(i / steps), 1);
        const t = (i - span * steps) / steps;
        const [r, y] = cubicPoint(curves[span], t);
        const tangent = ((side * thickness) / 2) * (1 - (i / (2 * steps)) ** 4);
        return [
          r * Math.cos(angle) - tangent * Math.sin(angle),
          y,
          r * Math.sin(angle) + tangent * Math.cos(angle),
        ];
      });
    }
    return {
      outer: boundary(outer, -1),
      inner: boundary(inner, -1),
      backOuter: boundary(outer, 1),
      backInner: boundary(inner, 1),
    };
  });
}
