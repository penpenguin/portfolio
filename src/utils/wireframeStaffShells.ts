import type { Point3 } from './wireframeGeometry';

type ProfilePoint = readonly [radius: number, height: number];
type Cubic = readonly [ProfilePoint, ProfilePoint, ProfilePoint, ProfilePoint];
export type PetalLayer = 'outer' | 'middle' | 'inner';
type PetalRole = 'primary' | 'open' | 'closed' | 'wrapped' | 'inner';
export type PetalProfile = Readonly<{
  role: PetalRole;
  azimuth: number;
  root: number;
  tip: number;
  opening: number;
  tipRadius: number;
  width: number;
  belly: number;
  flare: number;
  twist: number;
  thickness: number;
}>;
type PetalSetting = Pick<
  PetalProfile,
  'azimuth' | 'root' | 'tip' | 'opening' | 'tipRadius' | 'width'
> &
  Partial<PetalProfile>;
type PetalLayerSetting = Readonly<{
  name: PetalLayer;
  phase: number;
  offset: Point3;
  seat: number;
  cup: number;
  defaults: Pick<
    PetalProfile,
    'role' | 'belly' | 'flare' | 'twist' | 'thickness'
  >;
  petals: readonly PetalSetting[];
}>;
type PetalAnchor = Readonly<{
  t: number;
  left: Point3;
  right: Point3;
  backLeft: Point3;
  backRight: Point3;
  ribs: readonly Point3[];
}>;
export type StaffPetal = Readonly<{
  id: string;
  layer: PetalLayer;
  profile: PetalProfile;
  azimuth: number;
  width: number;
  opening: number;
  twist: number;
  mount: Point3;
  parameters: readonly number[];
  left: readonly Point3[];
  right: readonly Point3[];
  backLeft: readonly Point3[];
  backRight: readonly Point3[];
  spine: readonly Point3[];
  ribs: readonly (readonly Point3[])[];
  anchors: readonly PetalAnchor[];
}>;

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

// Per-petal proportions describe distinct parts, rather than a uniform radial copy.
// Angles in these authoring settings are degrees; assembled profiles use radians.
const layers: readonly PetalLayerSetting[] = [
  {
    name: 'outer',
    phase: 0,
    offset: [0, 0, 0],
    seat: 0.32,
    cup: 0.1,
    defaults: {
      role: 'open',
      belly: 0.5,
      flare: -0.18,
      twist: 5,
      thickness: 0.075,
    },
    petals: [
      {
        azimuth: 20,
        root: 0.52,
        tip: 3.18,
        opening: 1.18,
        tipRadius: 1.48,
        width: 0.91,
        belly: 0.43,
      },
      {
        azimuth: 75,
        root: 0.68,
        tip: 3.92,
        opening: 1.12,
        tipRadius: 0.82,
        width: 0.82,
        role: 'closed',
        flare: 0.27,
        twist: -7,
        thickness: 0.065,
      },
      {
        azimuth: 130,
        root: 0.57,
        tip: 4.38,
        opening: 1.43,
        tipRadius: 1.42,
        width: 1.05,
        role: 'primary',
        belly: 0.59,
        flare: -0.26,
        twist: 7,
        thickness: 0.085,
      },
      {
        azimuth: 195,
        root: 0.62,
        tip: 4.55,
        opening: 1.46,
        tipRadius: 1.51,
        width: 0.99,
        role: 'primary',
        belly: 0.56,
        flare: -0.22,
        twist: -5,
        thickness: 0.08,
      },
      {
        azimuth: 265,
        root: 0.56,
        tip: 3.48,
        opening: 1.23,
        tipRadius: 1.54,
        width: 0.96,
        belly: 0.46,
        twist: -8,
      },
      {
        azimuth: 320,
        root: 0.74,
        tip: 4.08,
        opening: 1.18,
        tipRadius: 0.92,
        width: 0.85,
        role: 'closed',
        belly: 0.6,
        flare: 0.24,
        thickness: 0.06,
      },
    ],
  },
  {
    name: 'middle',
    phase: 22.5,
    offset: [-0.04, 0, 0.06],
    seat: 0.28,
    cup: 0.08,
    defaults: {
      role: 'wrapped',
      belly: 0.53,
      flare: 0.18,
      twist: 5,
      thickness: 0.06,
    },
    petals: [
      {
        azimuth: 0,
        root: 1.1,
        tip: 4.42,
        opening: 1.03,
        tipRadius: 0.65,
        width: 0.8,
      },
      {
        azimuth: 50,
        root: 0.92,
        tip: 4.12,
        opening: 1.15,
        tipRadius: 0.88,
        width: 0.73,
        belly: 0.46,
        twist: -6,
      },
      {
        azimuth: 84,
        root: 1.18,
        tip: 4.64,
        opening: 0.95,
        tipRadius: 0.51,
        width: 0.68,
        belly: 0.61,
      },
      {
        azimuth: 140,
        root: 1.04,
        tip: 4.32,
        opening: 1.18,
        tipRadius: 0.94,
        width: 0.81,
        flare: -0.08,
        twist: -8,
      },
      {
        azimuth: 177,
        root: 0.96,
        tip: 4.72,
        opening: 1.08,
        tipRadius: 0.62,
        width: 0.7,
        belly: 0.58,
      },
      {
        azimuth: 234,
        root: 1.22,
        tip: 4.18,
        opening: 1.16,
        tipRadius: 0.89,
        width: 0.76,
        twist: -4,
      },
      {
        azimuth: 266,
        root: 1.12,
        tip: 4.56,
        opening: 1.0,
        tipRadius: 0.56,
        width: 0.79,
        belly: 0.6,
      },
      {
        azimuth: 318,
        root: 1.0,
        tip: 4.35,
        opening: 1.14,
        tipRadius: 0.78,
        width: 0.67,
        belly: 0.47,
        twist: -7,
      },
    ],
  },
  {
    name: 'inner',
    phase: 9,
    offset: [0.035, 0, -0.035],
    seat: 0.25,
    cup: 0.055,
    defaults: {
      role: 'inner',
      belly: 0.55,
      flare: 0.12,
      twist: 6,
      thickness: 0.045,
    },
    petals: [
      {
        azimuth: 0,
        root: 1.38,
        tip: 5,
        opening: 0.64,
        tipRadius: 0.31,
        width: 0.46,
      },
      {
        azimuth: 79,
        root: 1.52,
        tip: 4.68,
        opening: 0.74,
        tipRadius: 0.44,
        width: 0.43,
        belly: 0.46,
        twist: -7,
      },
      {
        azimuth: 137,
        root: 1.44,
        tip: 4.9,
        opening: 0.62,
        tipRadius: 0.28,
        width: 0.49,
        belly: 0.61,
      },
      {
        azimuth: 224,
        root: 1.6,
        tip: 4.56,
        opening: 0.72,
        tipRadius: 0.42,
        width: 0.42,
        twist: -5,
      },
      {
        azimuth: 286,
        root: 1.48,
        tip: 4.8,
        opening: 0.66,
        tipRadius: 0.32,
        width: 0.47,
        belly: 0.59,
      },
    ],
  },
];

// Sample only contours and reinforcing ribs of a cupped surface, never its mesh.
// All attachment parameters join the same sample set, independently of resolution.
export function createStaffShells(steps = 16): readonly StaffPetal[] {
  const parameters = [
    ...new Set([
      ...Array.from({ length: 2 * steps + 1 }, (_, i) => i / (2 * steps)),
      0.2,
      0.5,
      0.8,
    ]),
  ].sort((a, b) => a - b);
  return layers.flatMap((layer) =>
    layer.petals.map((setting, index) => {
      const profile: PetalProfile = {
        ...layer.defaults,
        ...setting,
        azimuth: ((layer.phase + setting.azimuth) * Math.PI) / 180,
        twist: ((setting.twist ?? layer.defaults.twist) * Math.PI) / 180,
      };
      const {
        azimuth,
        root,
        tip,
        opening,
        width,
        twist,
        tipRadius,
        thickness,
      } = profile;
      const length = tip - root;
      const rootRadius = layer.seat + 0.06;
      const middle: ProfilePoint = [opening, root + length * profile.belly];
      const tangent: ProfilePoint = [
        layer.name === 'outer' ? 0.12 : 0.025,
        length * 0.23,
      ];
      const placed = (point: Point3): Point3 =>
        point.map((n, axis) => n + layer.offset[axis]) as unknown as Point3;
      const curves: readonly Cubic[] = [
        [
          [rootRadius, root],
          [rootRadius + 0.22, root + length * 0.13],
          [middle[0] - tangent[0], middle[1] - tangent[1]],
          middle,
        ],
        [
          middle,
          [middle[0] + tangent[0], middle[1] + tangent[1]],
          [tipRadius + profile.flare, tip - length * 0.16],
          [tipRadius, tip],
        ],
      ];
      function point(t: number, across: number, side: number): Point3 {
        if (t === 1)
          return placed([
            tipRadius * Math.cos(azimuth + twist),
            tip,
            tipRadius * Math.sin(azimuth + twist),
          ]);
        const span = t < 0.5 ? 0 : 1;
        const local = t * 2 - span;
        const [r, y] = cubicPoint(curves[span], local);
        const [a, b, c, d] = curves[span];
        const derivative = [0, 1].map(
          (axis) =>
            3 * (1 - local) ** 2 * (b[axis] - a[axis]) +
            6 * (1 - local) * local * (c[axis] - b[axis]) +
            3 * local ** 2 * (d[axis] - c[axis])
        );
        const magnitude = Math.hypot(...derivative);
        const normalR = derivative[1] / magnitude,
          normalY = -derivative[0] / magnitude;
        const angle = azimuth + twist * t * t;
        const halfWidth = 0.055 * (1 - t) + (width / 2) * Math.sin(Math.PI * t);
        const cup = layer.cup * Math.sin(Math.PI * t) * across * across;
        const offset = cup + ((side * thickness) / 2) * (1 - t * t);
        const radial = r + normalR * offset;
        const tangent = halfWidth * across;
        return placed([
          radial * Math.cos(angle) - tangent * Math.sin(angle),
          y + normalY * offset,
          radial * Math.sin(angle) + tangent * Math.cos(angle),
        ]);
      }
      const path = (across: number, side: number) =>
        parameters.map((t) => point(t, across, side));
      const left = path(-1, 1),
        right = path(1, 1),
        backLeft = path(-1, -1),
        backRight = path(1, -1);
      const ribs = [path(-0.45, -1), path(0.45, -1)];
      return {
        id: `${layer.name}-${index + 1}`,
        layer: layer.name,
        profile,
        azimuth,
        width,
        opening,
        twist,
        mount: placed([
          layer.seat * Math.cos(azimuth),
          root,
          layer.seat * Math.sin(azimuth),
        ]),
        parameters,
        left,
        right,
        backLeft,
        backRight,
        spine: path(0, 1),
        ribs,
        anchors: [0.2, 0.5, 0.8].map((t) => {
          const i = parameters.indexOf(t);
          return {
            t,
            left: left[i],
            right: right[i],
            backLeft: backLeft[i],
            backRight: backRight[i],
            ribs: ribs.map((rib) => rib[i]),
          };
        }),
      };
    })
  );
}
