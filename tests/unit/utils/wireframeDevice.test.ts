import { describe, expect, it } from 'vitest';
import { createDeviceGeometry } from '../../../src/utils/wireframeGeometry';

import {
  initialAngle,
  advanceAngle,
  projectDevice,
  projectDevicePoint,
  createDeviceProjector,
} from '../../../src/utils/wireframeDevice';

describe('wireframe device projection', () => {
  it('shares three line weights and keeps depth-dependent shading within each hierarchy', () => {
    const lines = projectDevice(initialAngle, 240, 192);
    expect(new Set(lines.map((line) => line.width))).toEqual(
      new Set([1.1, 0.8, 0.5])
    );
    for (const [width, back, front] of [
      [1.1, 0.58, 0.88],
      [0.8, 0.3, 0.56],
      [0.5, 0.14, 0.28],
    ]) {
      const opacities = lines
        .filter((line) => line.width === width)
        .map((line) => line.opacity);
      expect(Math.max(...opacities)).toBeGreaterThan(Math.min(...opacities));
      expect(Math.min(...opacities)).toBeGreaterThanOrEqual(back);
      expect(Math.max(...opacities)).toBeLessThanOrEqual(front);
    }
  });
  it('rotates a full turn in 16 seconds regardless of frame intervals', () => {
    expect(advanceAngle(initialAngle, 16000)).toBeCloseTo(initialAngle);
    expect(advanceAngle(0, 4000)).toBeCloseTo(Math.PI / 2);
    const intervals = [16, 42, 100, 330, 17, 7495];
    const stepped = intervals.reduce(advanceAngle, initialAngle);
    expect(stepped).toBeCloseTo(advanceAngle(initialAngle, 8000));
    expect(advanceAngle(initialAngle, 0)).toBe(initialAngle);
  });

  it.each(
    [
      [224, 240],
      [278, 240],
      [348, 240],
      [938, 240],
      [267, 258],
      [223, 258],
      [348, 238],
      [278, 238],
      [914, 238],
      [726, 238],
    ].flatMap(([width, height]) =>
      [35, 60].map((tilt) => [width, height, tilt])
    )
  )(
    'keeps all edges inside the %i × %i stage at %i degrees throughout a full rotation',
    (width, height, tilt) => {
      const projector = createDeviceProjector(tilt);
      for (let degree = 0; degree < 360; degree++) {
        const lines = projector.projectDevice(
          (degree * Math.PI) / 180,
          width,
          height
        );
        expect(lines.length).toBeGreaterThan(100);
        const points = lines.flatMap((line) =>
          [line.from, line.to].flatMap((point) => [
            { x: point.x - line.width / 2, y: point.y - line.width / 2 },
            { x: point.x + line.width / 2, y: point.y + line.width / 2 },
          ])
        );
        expect(Math.min(...points.map((p) => p.x))).toBeGreaterThanOrEqual(15);
        expect(Math.max(...points.map((p) => p.x))).toBeLessThanOrEqual(
          width - 15
        );
        expect(Math.min(...points.map((p) => p.y))).toBeGreaterThanOrEqual(15);
        expect(Math.max(...points.map((p) => p.y))).toBeLessThanOrEqual(
          height - 15
        );
        expect(
          lines.every(
            (line) =>
              line.opacity >= 0 &&
              line.opacity <= 1 &&
              line.width > 0 &&
              [
                line.width,
                line.opacity,
                ...Object.values(line.from),
                ...Object.values(line.to),
              ].every(Number.isFinite)
          )
        ).toBe(true);
      }
    }
  );

  it('projects the complete assembled model with shared vertices and the same reference-point transform', () => {
    const edges = createDeviceGeometry();
    const lines = projectDevice(initialAngle, 267, 258);
    expect(lines).toHaveLength(edges.length);
    const projected = new Map<string, (typeof lines)[number]['from']>();
    edges.forEach((edge, index) => {
      for (const [point, result] of [
        [edge.a, lines[index].from],
        [edge.b, lines[index].to],
      ] as const) {
        expect(result).toEqual(
          projectDevicePoint(point, initialAngle, 267, 258)
        );
        const key = point.join(',');
        if (projected.has(key)) expect(result).toBe(projected.get(key));
        projected.set(key, result);
      }
    });
    expect(projectDevice(initialAngle, 267, 258)).toEqual(lines);
    const fullTurn = projectDevice(initialAngle + Math.PI * 2, 267, 258);
    lines.forEach((line, index) => {
      for (const end of ['from', 'to'] as const)
        for (const axis of ['x', 'y', 'depth'] as const)
          expect(fullTurn[index][end][axis]).toBeCloseTo(line[end][axis], 9);
    });
    const center = projectDevicePoint([0, 0, 0], 0, 267, 258);
    for (let degree = 0; degree < 360; degree++)
      expect(
        projectDevicePoint([0, 0, 0], (degree * Math.PI) / 180, 267, 258)
      ).toEqual(center);
  });

  it('changes perspective through actual 3D rotation and preserves a stable scale', () => {
    const front = projectDevice(0, 240, 200);
    const side = projectDevice(Math.PI / 2, 240, 200);
    expect(front).not.toEqual(side);
    expect(projectDevice(Math.PI * 2, 240, 200)[0].from.x).toBeCloseTo(
      front[0].from.x
    );
    const vertical = (angle: number) =>
      projectDevicePoint([0, 0.9, 0], angle, 240, 200).y -
      projectDevicePoint([0, -0.9, 0], angle, 240, 200).y;
    const frontVertical = vertical(0);
    const sideVertical = vertical(Math.PI / 2);
    expect(frontVertical).toBeCloseTo(sideVertical);
  });
});

it.each([35, 60])(
  'projects a fixed %i-degree screen tilt without wobble or refitting',
  (tilt) => {
    const projector = createDeviceProjector(tilt);
    const fit = projector.getFit(278, 260);
    const vectors = Array.from({ length: 360 }, (_, degree) => {
      const angle = (degree * Math.PI) / 180;
      const top = projector.projectDevicePoint([0, 0.5, 0], angle, 278, 260);
      const bottom = projector.projectDevicePoint(
        [0, -0.5, 0],
        angle,
        278,
        260
      );
      expect(top.x).toBeLessThan(bottom.x);
      expect(top.y).toBeLessThan(bottom.y);
      const origin = projector.projectDevicePoint([0, 0, 0], angle, 278, 260);
      expect(origin.x).toBeCloseTo(fit.centerX);
      expect(origin.y).toBeCloseTo(fit.centerY);
      // Orthographic projection's row norm measures scale independently of tilt.
      const basis = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ] as const;
      const dx = basis.map(
        (p) => projector.projectDevicePoint(p, angle, 278, 260).x - origin.x
      );
      expect(Math.hypot(...dx)).toBeCloseTo(fit.scale, 8);
      return { x: top.x - bottom.x, y: top.y - bottom.y };
    });
    const angle =
      (Math.atan2(Math.abs(vectors[0].x), Math.abs(vectors[0].y)) * 180) /
      Math.PI;
    expect(angle).toBeCloseTo(tilt, 8);
    for (const vector of vectors) {
      expect(vector.x).toBeCloseTo(vectors[0].x);
      expect(vector.y).toBeCloseTo(vectors[0].y);
    }
  }
);

it('uses the 35-degree projector for both public projection paths', () => {
  const projector = createDeviceProjector(35);
  expect(projectDevice(initialAngle, 267, 258)).toEqual(
    projector.projectDevice(initialAngle, 267, 258)
  );
  expect(projectDevicePoint([0, 0.5, 0], initialAngle, 267, 258)).toEqual(
    projector.projectDevicePoint([0, 0.5, 0], initialAngle, 267, 258)
  );
});
