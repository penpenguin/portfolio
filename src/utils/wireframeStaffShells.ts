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
  taperStart: number;
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
    'role' | 'belly' | 'flare' | 'twist' | 'thickness' | 'taperStart'
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
  crossRibs: readonly Readonly<{
    t: number;
    parameters: readonly number[];
    points: readonly Point3[];
  }>[];
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
    cup: 0.22,
    defaults: {
      taperStart: 0.76,
      role: 'open',
      belly: 0.5,
      flare: -0.18,
      twist: 5,
      thickness: 0.075,
    },
    petals: [
      {
        flare: -0.4,
        azimuth: 20,
        root: 0.52,
        tip: 2.85,
        opening: 1.5,
        tipRadius: 1.83,
        width: 1.37,
        belly: 0.48,
      },
      {
        belly: 0.55,
        azimuth: 75,
        root: 0.68,
        tip: 3.25,
        opening: 1.32,
        tipRadius: 1.32,
        width: 1.23,
        role: 'closed',
        flare: 0.08,
        twist: -7,
        thickness: 0.065,
      },
      {
        azimuth: 130,
        root: 0.57,
        tip: 3.45,
        opening: 1.52,
        tipRadius: 1.68,
        width: 1.47,
        role: 'primary',
        belly: 0.52,
        flare: -0.32,
        twist: 7,
        thickness: 0.085,
      },
      {
        azimuth: 195,
        root: 0.62,
        tip: 3.6,
        opening: 1.54,
        tipRadius: 1.75,
        width: 1.42,
        role: 'primary',
        belly: 0.53,
        flare: -0.35,
        twist: -5,
        thickness: 0.08,
      },
      {
        flare: -0.4,
        azimuth: 265,
        root: 0.56,
        tip: 2.65,
        opening: 1.55,
        tipRadius: 1.86,
        width: 1.34,
        belly: 0.5,
        twist: -8,
      },
      {
        azimuth: 320,
        root: 0.74,
        tip: 3.2,
        opening: 1.36,
        tipRadius: 1.35,
        width: 1.25,
        role: 'closed',
        belly: 0.56,
        flare: 0.06,
        thickness: 0.06,
      },
    ],
  },
  {
    name: 'middle',
    phase: 22.5,
    offset: [-0.04, 0, 0.06],
    seat: 0.28,
    cup: 0.18,
    defaults: {
      taperStart: 0.8,
      role: 'wrapped',
      belly: 0.53,
      flare: 0.18,
      twist: 5,
      thickness: 0.06,
    },
    petals: [
      {
        flare: 0.12,
        belly: 0.52,
        azimuth: 0,
        root: 1.1,
        tip: 3.86,
        opening: 1.18,
        tipRadius: 0.94,
        width: 1.08,
      },
      {
        flare: -0.08,
        azimuth: 50,
        root: 0.92,
        tip: 3.66,
        opening: 1.34,
        tipRadius: 1.15,
        width: 1.1,
        belly: 0.5,
        twist: -6,
      },
      {
        flare: 0.16,
        azimuth: 84,
        root: 1.18,
        tip: 4.14,
        opening: 1.14,
        tipRadius: 0.77,
        width: 1.03,
        belly: 0.55,
      },
      {
        belly: 0.53,
        azimuth: 140,
        root: 1.04,
        tip: 3.9,
        opening: 1.3,
        tipRadius: 1.1,
        width: 1.13,
        flare: -0.08,
        twist: -8,
      },
      {
        flare: 0.12,
        azimuth: 177,
        root: 0.96,
        tip: 4.28,
        opening: 1.2,
        tipRadius: 0.85,
        width: 1.1,
        belly: 0.57,
      },
      {
        flare: 0.06,
        belly: 0.5,
        azimuth: 234,
        root: 1.22,
        tip: 3.76,
        opening: 1.32,
        tipRadius: 1.11,
        width: 1.04,
        twist: -4,
      },
      {
        flare: 0.12,
        azimuth: 266,
        root: 1.12,
        tip: 4.06,
        opening: 1.16,
        tipRadius: 0.82,
        width: 1.09,
        belly: 0.56,
      },
      {
        flare: 0.08,
        azimuth: 318,
        root: 1.0,
        tip: 3.91,
        opening: 1.28,
        tipRadius: 1.03,
        width: 1.06,
        belly: 0.52,
        twist: -7,
      },
    ],
  },
  {
    name: 'inner',
    phase: 9,
    offset: [0.035, 0, -0.035],
    seat: 0.25,
    cup: 0.13,
    defaults: {
      taperStart: 0.78,
      role: 'inner',
      belly: 0.55,
      flare: 0.12,
      twist: 6,
      thickness: 0.045,
    },
    petals: [
      {
        flare: 0.08,
        belly: 0.55,
        azimuth: 0,
        root: 1.38,
        tip: 4.62,
        opening: 0.75,
        tipRadius: 0.48,
        width: 0.95,
      },
      {
        flare: 0.08,
        azimuth: 79,
        root: 1.52,
        tip: 4.32,
        opening: 0.82,
        tipRadius: 0.57,
        width: 0.88,
        belly: 0.5,
        twist: -7,
      },
      {
        flare: 0.1,
        azimuth: 137,
        root: 1.44,
        tip: 4.5,
        opening: 0.76,
        tipRadius: 0.45,
        width: 0.93,
        belly: 0.57,
      },
      {
        flare: 0.06,
        belly: 0.52,
        azimuth: 224,
        root: 1.6,
        tip: 4.16,
        opening: 0.84,
        tipRadius: 0.59,
        width: 0.86,
        twist: -5,
      },
      {
        flare: 0.08,
        azimuth: 286,
        root: 1.48,
        tip: 4.4,
        opening: 0.8,
        tipRadius: 0.5,
        width: 0.9,
        belly: 0.55,
      },
    ],
  },
];

// Sample only contours and reinforcing ribs of a cupped surface, never its mesh.
// All attachment parameters join the same sample set, independently of resolution.
export function createStaffShells(steps = 16): readonly StaffPetal[] {
  const baseParameters = [
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
      const parameters = [
        ...new Set([...baseParameters, 0.42, 0.75, profile.taperStart]),
      ].sort((a, b) => a - b);
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
        // Hold a broad shoulder, then converge quickly to a sharp shared tip.
        // Smooth joins keep the shoulder rounded without a long blade-like taper.
        const smooth = (u: number) => u * u * (3 - 2 * u);
        let breadth: number;
        if (t <= 0.42) breadth = 0.11 + (width - 0.11) * smooth(t / 0.42);
        else if (t <= profile.taperStart)
          breadth =
            width *
            (1 - 0.04 * smooth((t - 0.42) / (profile.taperStart - 0.42)));
        else {
          const u = (t - profile.taperStart) / (1 - profile.taperStart);
          breadth = width * 0.96 * (1 - u * u);
        }
        const halfWidth = breadth / 2;
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
        crossRibs: (layer.name === 'outer'
          ? [0.5, 0.75]
          : layer.name === 'middle'
            ? [0.5]
            : []
        ).map((t) => {
          const divisions = Math.max(4, Math.ceil(steps / 2));
          const parameters = [
            ...new Set([
              ...Array.from(
                { length: divisions + 1 },
                (_, i) => -1 + (2 * i) / divisions
              ),
              -0.45,
              0.45,
            ]),
          ].sort((a, b) => a - b);
          return {
            t,
            parameters,
            points: parameters.map((across) => point(t, across, -1)),
          };
        }),
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
