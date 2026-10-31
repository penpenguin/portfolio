import type { Point3 } from './wireframeGeometry';

type ProfilePoint = readonly [radius: number, height: number];
type Cubic = readonly [ProfilePoint, ProfilePoint, ProfilePoint, ProfilePoint];
export type PetalLayer = 'outer' | 'middle' | 'inner';
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

const layers = [
  {
    name: 'outer',
    count: 6,
    phase: 0,
    root: 0.8,
    tip: 3.8,
    radius: 1.22,
    tipRadius: 1.24,
    width: 0.9,
    cup: 0.1,
    thickness: 0.075,
    seat: 0.32,
  },
  {
    name: 'middle',
    count: 8,
    phase: 22.5,
    root: 1.1,
    tip: 4.4,
    radius: 0.98,
    tipRadius: 0.62,
    width: 0.72,
    cup: 0.08,
    thickness: 0.06,
    seat: 0.28,
  },
  {
    name: 'inner',
    count: 5,
    phase: 9,
    root: 1.45,
    tip: 4.85,
    radius: 0.59,
    tipRadius: 0.16,
    width: 0.46,
    cup: 0.055,
    thickness: 0.045,
    seat: 0.25,
  },
] as const;
const variation = [0, 0.08, -0.06, 0.1, -0.08, 0.05, -0.1, 0.06];

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
  return layers.flatMap((layer, layerIndex) =>
    Array.from({ length: layer.count }, (_, index) => {
      const change = variation[index];
      const azimuth =
        ((layer.phase + (index * 360) / layer.count) * Math.PI) / 180;
      const root = layer.root + (index % 3) * 0.035;
      const tip =
        layer.name === 'inner'
          ? [5, 4.78, 4.92, 4.65, 4.85][index]
          : layer.tip + change * (layer.tip - root);
      const length = tip - root;
      const opening =
        layer.radius * (1 + variation[(index + 2) % variation.length] * 0.65);
      const width =
        layer.width * (1 + variation[(index + 3) % variation.length]);
      const twist = ((index % 2 ? -1 : 1) * (4 + layerIndex) * Math.PI) / 180;
      const rootRadius = layer.seat + 0.06;
      const middle: ProfilePoint = [opening, root + length * 0.53];
      const tangent: ProfilePoint = [
        layer.name === 'outer' ? 0.12 : 0.025,
        length * 0.23,
      ];
      const tipRadius = layer.tipRadius * (1 + change);
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
          [
            tipRadius +
              (layer.name === 'outer' && index % 3 === 0 ? -0.18 : 0.2),
            tip - length * 0.16,
          ],
          [tipRadius, tip],
        ],
      ];
      function point(t: number, across: number, side: number): Point3 {
        if (t === 1)
          return [
            tipRadius * Math.cos(azimuth + twist),
            tip,
            tipRadius * Math.sin(azimuth + twist),
          ];
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
        const offset = cup + ((side * layer.thickness) / 2) * (1 - t * t);
        const radial = r + normalR * offset;
        const tangent = halfWidth * across;
        return [
          radial * Math.cos(angle) - tangent * Math.sin(angle),
          y + normalY * offset,
          radial * Math.sin(angle) + tangent * Math.cos(angle),
        ];
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
        azimuth,
        width,
        opening,
        twist,
        mount: [
          layer.seat * Math.cos(azimuth),
          layer.root,
          layer.seat * Math.sin(azimuth),
        ] as Point3,
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
