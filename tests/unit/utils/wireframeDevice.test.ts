import { describe, expect, it } from 'vitest';

import {
  initialAngle,
  advanceAngle,
  projectDevice,
} from '../../../src/utils/wireframeDevice';

describe('wireframe device projection', () => {
  it('shares three line weights and keeps depth-dependent shading within each hierarchy', () => {
    const lines = projectDevice(initialAngle, 240, 192);
    expect(new Set(lines.map((line) => line.width))).toEqual(
      new Set([0.95, 0.8, 0.6])
    );
    for (const width of [0.95, 0.8, 0.6]) {
      const opacities = lines
        .filter((line) => line.width === width)
        .map((line) => line.opacity);
      expect(Math.max(...opacities)).toBeGreaterThan(Math.min(...opacities));
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

  it.each([
    [224, 240],
    [278, 240],
    [348, 240],
    [938, 240],
  ])(
    'keeps all edges inside the %i × %i stage throughout a full rotation',
    (width, height) => {
      for (let degree = 0; degree < 360; degree++) {
        const lines = projectDevice((degree * Math.PI) / 180, width, height);
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
          lines.every((line) => line.opacity > 0 && line.opacity <= 1)
        ).toBe(true);
      }
    }
  );

  it('changes perspective through actual 3D rotation and preserves a stable scale', () => {
    const front = projectDevice(0, 240, 200);
    const side = projectDevice(Math.PI / 2, 240, 200);
    expect(front).not.toEqual(side);
    expect(projectDevice(Math.PI * 2, 240, 200)[0].from.x).toBeCloseTo(
      front[0].from.x
    );
    const frontVertical = Math.abs(front[8].to.y - front[8].from.y);
    const sideVertical = Math.abs(side[8].to.y - side[8].from.y);
    expect(frontVertical).toBeCloseTo(sideVertical);
  });
});

it('rotates about one fixed tilted axis without wobble or refitting', () => {
  const vectors = [0, 90, 180, 270].map((degree) => {
    const edge = projectDevice((degree * Math.PI) / 180, 278, 260)[8];
    return { x: edge.to.x - edge.from.x, y: edge.to.y - edge.from.y };
  });
  const angle =
    (Math.atan2(Math.abs(vectors[0].x), Math.abs(vectors[0].y)) * 180) /
    Math.PI;
  expect(angle).toBeGreaterThan(12);
  expect(angle).toBeLessThan(14);
  for (const vector of vectors) {
    expect(vector.x).toBeCloseTo(vectors[0].x);
    expect(vector.y).toBeCloseTo(vectors[0].y);
  }
});
