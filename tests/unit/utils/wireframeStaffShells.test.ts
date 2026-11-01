import { describe, expect, it } from 'vitest';
import { createStaffShells } from '../../../src/utils/wireframeStaffShells';
import { projectDevicePoint } from '../../../src/utils/wireframeDevice';

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(...a.map((n, i) => n - b[i]));
const contours = ['left', 'right', 'backLeft', 'backRight', 'spine'] as const;

describe('mechanical lotus petals', () => {
  it('builds nineteen distinct mounted petals in three staggered lotus layers', () => {
    const petals = createStaffShells();
    expect(petals).toEqual(createStaffShells());
    expect(petals).toHaveLength(19);
    expect(new Set(petals.map((p) => p.id)).size).toBe(19);
    const layers = ['outer', 'middle', 'inner'].map((layer) =>
      petals.filter((p) => p.layer === layer)
    );
    expect(layers.map((layer) => layer.length)).toEqual([6, 8, 5]);
    expect(new Set(layers.map((layer) => layer[0].azimuth)).size).toBe(3);
    const tipHeights = layers.map(
      (layer) =>
        layer.reduce((sum, p) => sum + p.left.at(-1)![1], 0) / layer.length
    );
    expect(tipHeights[0]).toBeLessThan(tipHeights[1]);
    expect(tipHeights[1]).toBeLessThan(tipHeights[2]);
    const openings = layers.map((layer) =>
      Math.max(
        ...layer.flatMap((p) => p.left.map(([x, , z]) => Math.hypot(x, z)))
      )
    );
    expect(openings[0]).toBeGreaterThan(openings[1]);
    expect(openings[1]).toBeGreaterThan(openings[2]);
    for (const layer of layers) {
      expect(new Set(layer.map((p) => p.left.at(-1)![1])).size).toBeGreaterThan(
        2
      );
      expect(new Set(layer.map((p) => p.width)).size).toBeGreaterThan(2);
      expect(new Set(layer.map((p) => p.mount[1])).size).toBeGreaterThan(2);
    }
  });

  it('opens broad lower petals around a cupped middle and a shorter half-open inner crown', () => {
    const petals = createStaffShells(128);
    const ratios = { outer: [2, 2.8], middle: [2.5, 3.5], inner: [2.5, 4] };
    for (const petal of petals) {
      const length = petal.spine
        .slice(1)
        .reduce((sum, p, i) => sum + distance(p, petal.spine[i]), 0);
      const widths = petal.left.map((p, i) => distance(p, petal.right[i]));
      const maximum = Math.max(...widths);
      expect(length / maximum).toBeGreaterThanOrEqual(ratios[petal.layer][0]);
      expect(length / maximum).toBeLessThanOrEqual(ratios[petal.layer][1]);
      // A broad shoulder stays open before the short, sharp terminal taper.
      for (let i = 0; i < widths.length; i++)
        if (petal.parameters[i] >= 0.4 && petal.parameters[i] <= 0.75)
          expect(widths[i]).toBeGreaterThan(maximum * 0.9);
    }
    const outer = petals.filter((p) => p.layer === 'outer');
    expect(Math.max(...outer.map((p) => p.left.at(-1)![1]))).toBeLessThan(3.7);
    expect(
      outer.filter(
        (p) => Math.hypot(p.left.at(-1)![0], p.left.at(-1)![2]) > 1.6
      ).length
    ).toBeGreaterThanOrEqual(3);
    const inner = petals.filter((p) => p.layer === 'inner');
    expect(Math.max(...inner.map((p) => p.left.at(-1)![1]))).toBeLessThan(4.7);
    expect(
      inner.every((p) => Math.hypot(p.left.at(-1)![0], p.left.at(-1)![2]) > 0.4)
    ).toBe(true);
  });

  it('uses a few curved transverse ribs to expose the spoon-shaped section', () => {
    for (const p of createStaffShells()) {
      expect(p.crossRibs).toHaveLength(
        p.layer === 'outer' ? 2 : p.layer === 'middle' ? 1 : 0
      );
      for (const rib of p.crossRibs) {
        const i = p.parameters.indexOf(rib.t);
        expect(rib.points[0]).toEqual(p.backLeft[i]);
        expect(rib.points.at(-1)).toEqual(p.backRight[i]);
        const middle = rib.points[Math.floor(rib.points.length / 2)];
        const chord = rib.points[0].map(
          (n, k) => (n + rib.points.at(-1)![k]) / 2
        );
        expect(distance(middle, chord)).toBeGreaterThan(0.1);
      }
    }
  });

  it('forms broad cupped petals with thin backs, smooth contours and a shared sharp tip', () => {
    for (const petal of createStaffShells()) {
      const { left, right, backLeft, backRight, spine, parameters } = petal;
      expect([
        right.length,
        backLeft.length,
        backRight.length,
        spine.length,
      ]).toEqual(Array(4).fill(left.length));
      expect([
        right.at(-1),
        backLeft.at(-1),
        backRight.at(-1),
        spine.at(-1),
      ]).toEqual(Array(4).fill(left.at(-1)));
      const middle = parameters.indexOf(0.5);
      const width = distance(left[middle], right[middle]);
      expect(width).toBeGreaterThan(0.3);
      expect(width).toBeGreaterThan(distance(left[0], right[0]) * 2);
      expect(distance(left.at(-2)!, right.at(-2)!)).toBeLessThan(width / 2);
      const chord = left[middle].map((n, i) => (n + right[middle][i]) / 2);
      expect(distance(chord, spine[middle])).toBeGreaterThan(0.025);
      for (const key of contours) {
        const path = petal[key];
        expect(path.flat().every(Number.isFinite)).toBe(true);
        // Adjacent sampled tangents must not acquire a corner at the cubic join.
        const before = path[middle].map((n, i) => n - path[middle - 1][i]);
        const after = path[middle + 1].map((n, i) => n - path[middle][i]);
        expect(
          before.reduce((sum, n, i) => sum + n * after[i], 0) /
            Math.hypot(...before) /
            Math.hypot(...after)
        ).toBeGreaterThan(0.97);
      }
      for (let i = 0; i < left.length - 1; i++) {
        expect(distance(left[i], backLeft[i])).toBeGreaterThan(0);
        expect(distance(right[i], backRight[i])).toBeGreaterThan(0);
        expect(distance(left[i], right[i])).toBeGreaterThan(0);
      }
      expect(petal.ribs).toHaveLength(2);
      expect(petal.anchors.map((a) => a.t)).toEqual([0.2, 0.5, 0.8]);
      for (const a of petal.anchors) {
        const i = parameters.indexOf(a.t);
        expect(i).toBeGreaterThanOrEqual(0);
        expect(a.left).toEqual(left[i]);
        expect(a.ribs).toEqual(petal.ribs.map((rib) => rib[i]));
      }
    }
  });

  it('keeps each petal boundary simple without forbidding overlaps between different petals', () => {
    const cross = (a: number[], b: number[], c: number[]) =>
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (const p of createStaffShells()) {
      const points = [...p.left, ...p.right.slice(0, -1).reverse()].map(
        ([x, y, z]) => [-x * Math.sin(p.azimuth) + z * Math.cos(p.azimuth), y]
      );
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        for (let j = i + 2; j < points.length; j++) {
          if (i === 0 && j === points.length - 1) continue;
          const c = points[j],
            d = points[(j + 1) % points.length];
          expect(
            cross(a, b, c) * cross(a, b, d) < -1e-12 &&
              cross(c, d, a) * cross(c, d, b) < -1e-12
          ).toBe(false);
        }
      }
    }
  });

  it('approximates all petal curves within a quarter CSS pixel at actual stage sizes', () => {
    const coarse = createStaffShells(),
      reference = createStaffShells(16 * 8);
    let largestError = 0;
    for (const [width, height] of [
      [267, 258],
      [223, 258],
      [348, 238],
      [278, 238],
    ])
      for (let degrees = 0; degrees < 360; degrees += 15)
        coarse.forEach((petal, index) => {
          const paths = [
            ...[...contours.map((key) => petal[key]), ...petal.ribs].map(
              (points) => ({ points, parameters: petal.parameters })
            ),
            ...petal.crossRibs,
          ];
          const fine = reference[index];
          const referencePaths = [
            ...[...contours.map((key) => fine[key]), ...fine.ribs].map(
              (points) => ({ points, parameters: fine.parameters })
            ),
            ...fine.crossRibs,
          ];
          paths.forEach((path, pathIndex) => {
            const points = path.points.map((p) =>
              projectDevicePoint(p, (degrees * Math.PI) / 180, width, height)
            );
            let interval = 0;
            referencePaths[pathIndex].points.forEach((p, sample) => {
              while (
                interval < points.length - 2 &&
                path.parameters[interval + 1] <
                  referencePaths[pathIndex].parameters[sample]
              )
                interval++;
              const a = points[interval],
                b = points[interval + 1];
              const q = projectDevicePoint(
                p,
                (degrees * Math.PI) / 180,
                width,
                height
              );
              const dx = b.x - a.x,
                dy = b.y - a.y;
              const denominator = dx * dx + dy * dy;
              const t =
                denominator === 0
                  ? 0
                  : Math.max(
                      0,
                      Math.min(
                        1,
                        ((q.x - a.x) * dx + (q.y - a.y) * dy) / denominator
                      )
                    );
              largestError = Math.max(
                largestError,
                Math.hypot(q.x - a.x - t * dx, q.y - a.y - t * dy)
              );
            });
          });
        });
    expect(largestError).toBeLessThan(0.25);
  });
});
