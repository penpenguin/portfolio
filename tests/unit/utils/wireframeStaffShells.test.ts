import { describe, expect, it } from 'vitest';
import { createStaffShells } from '../../../src/utils/wireframeStaffShells';
import { projectDevicePoint } from '../../../src/utils/wireframeDevice';

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(...a.map((n, i) => n - b[i]));

describe('curved staff shells', () => {
  it('makes one long S band and a shorter open C arm in different radial planes', () => {
    const [main, arm] = createStaffShells();
    expect(main.outer.at(-1)![1]).toBe(5);
    expect(main.outer[0][1]).toBeLessThanOrEqual(1.5);
    expect(arm.outer.at(-1)![1]).toBeLessThan(4.5);
    expect(arm.outer.at(-1)![1]).toBeGreaterThan(3.5);
    const radii = main.outer.map((p) => Math.hypot(p[0], p[2]));
    const changes = radii.slice(1).map((r, i) => r - radii[i]);
    // Swell outward, tuck inward, then sweep outward into the sharp tip.
    const signs = changes.filter((d) => Math.abs(d) > 1e-5).map(Math.sign);
    expect(signs[0]).toBe(1);
    expect(signs).toContain(-1);
    expect(signs.at(-1)).toBe(1);
    expect(Math.max(...radii)).toBeLessThan(1.1);
    const normal = (shell: typeof main) => {
      const p = shell.outer[Math.floor(shell.outer.length / 2)];
      return [p[0], p[2]];
    };
    const a = normal(main),
      b = normal(arm);
    expect(
      Math.abs(a[0] * b[1] - a[1] * b[0]) /
        distance(a, [0, 0]) /
        distance(b, [0, 0])
    ).toBeGreaterThan(0.65);
  });

  it('keeps smooth, noncrossing boundaries with tapered width, real thickness and one shared sharp tip', () => {
    for (const shell of createStaffShells()) {
      const { outer, inner, backOuter, backInner } = shell;
      expect(outer.length).toBeGreaterThan(40);
      expect([inner.length, backOuter.length, backInner.length]).toEqual([
        outer.length,
        outer.length,
        outer.length,
      ]);
      expect([inner.at(-1), backOuter.at(-1), backInner.at(-1)]).toEqual([
        outer.at(-1),
        outer.at(-1),
        outer.at(-1),
      ]);
      for (let i = 0; i < outer.length - 1; i++) {
        expect(
          [...outer[i], ...inner[i], ...backOuter[i], ...backInner[i]].every(
            Number.isFinite
          )
        ).toBe(true);
        expect(outer[i + 1][1]).toBeGreaterThan(outer[i][1]);
        expect(inner[i][1]).toBeCloseTo(outer[i][1], 8);
        expect(Math.hypot(outer[i][0], outer[i][2])).toBeGreaterThan(
          Math.hypot(inner[i][0], inner[i][2])
        );
        expect(distance(outer[i], backOuter[i])).toBeGreaterThan(0);
      }
      expect(distance(outer[10], inner[10])).toBeGreaterThan(0.1);
      expect(distance(outer.at(-2)!, inner.at(-2)!)).toBeLessThan(0.04);
      expect(distance(outer[0], backOuter[0])).toBeGreaterThanOrEqual(0.08);
      // The two cubic spans must meet with matching tangents, not a rounded polygon corner.
      for (const path of [outer, inner, backOuter, backInner]) {
        const joint = (path.length - 1) / 2;
        const before = path[joint].map((n, k) => n - path[joint - 1][k]);
        const after = path[joint + 1].map((n, k) => n - path[joint][k]);
        const cosine =
          before.reduce((s, n, k) => s + n * after[k], 0) /
          Math.hypot(...before) /
          Math.hypot(...after);
        expect(cosine).toBeGreaterThan(0.997);
      }
    }
  });

  it('approximates curved contours within a quarter CSS pixel at the actual stage sizes', () => {
    const coarse = createStaffShells();
    const reference = createStaffShells(24 * 8);
    for (const [width, height] of [
      [267, 258],
      [223, 258],
      [348, 238],
    ])
      for (let degrees = 0; degrees < 360; degrees += 15)
        coarse.forEach((shell, index) => {
          for (const key of [
            'outer',
            'inner',
            'backOuter',
            'backInner',
          ] as const) {
            const points = shell[key].map((p) =>
              projectDevicePoint(p, (degrees * Math.PI) / 180, width, height)
            );
            reference[index][key].forEach((p, sample) => {
              const interval = Math.min(
                Math.floor(sample / 8),
                points.length - 2
              );
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
              const t = Math.max(
                0,
                Math.min(
                  1,
                  ((q.x - a.x) * dx + (q.y - a.y) * dy) / (dx * dx + dy * dy)
                )
              );
              expect(
                Math.hypot(q.x - a.x - t * dx, q.y - a.y - t * dy)
              ).toBeLessThan(0.25);
            });
          }
        });
  });
});
