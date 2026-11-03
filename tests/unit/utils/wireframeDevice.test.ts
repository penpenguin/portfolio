import { describe, expect, it } from 'vitest';
import {
  createDeviceGeometry,
  createDeviceModel,
} from '../../../src/utils/wireframeGeometry';

import {
  initialSpinPhase,
  initialModelYaw,
  advanceAngle,
  projectDevice,
  projectDevicePoint,
  createDeviceProjector,
} from '../../../src/utils/wireframeDevice';

describe('wireframe device projection', () => {
  it('magnifies about the base-fit origin without scaling strokes or depth shading', () => {
    const base = createDeviceProjector(35, { magnification: 1 });
    const display = createDeviceProjector(35);
    const baseFit = base.getFit(267, 258);
    const displayFit = display.getFit(267, 258);
    expect(displayFit.scale / baseFit.scale).toBeCloseTo(1.3, 12);
    expect(displayFit.centerX).toBe(baseFit.centerX);
    expect(displayFit.centerY).toBe(baseFit.centerY);
    for (const phase of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const before = base.projectDevice(phase, 267, 258);
      const after = display.projectDevice(phase, 267, 258);
      after.forEach((line, i) => {
        expect(line.width).toBe(before[i].width);
        expect(line.opacity).toBe(before[i].opacity);
        for (const end of ['from', 'to'] as const) {
          expect(line[end].x).toBeCloseTo(
            baseFit.centerX + (before[i][end].x - baseFit.centerX) * 1.3,
            9
          );
          expect(line[end].y).toBeCloseTo(
            baseFit.centerY + (before[i][end].y - baseFit.centerY) * 1.3,
            9
          );
        }
      });
    }
  });

  it('separates the fixed model yaw from phase and matches the previous initial view', () => {
    expect(initialModelYaw).toBeCloseTo(Math.PI / 6);
    expect(initialSpinPhase).toBe(0);
    const projector = createDeviceProjector(35);
    const fit = projector.getFit(267, 258);
    // Normalized view coordinates captured from c25011d at its initial 30° yaw.
    // Fit and depth shading change with the new sweep; initial pose does not.
    for (const [point, expected] of [
      [
        [1, 0, 0],
        [0.7234641391638074, 0.6183270922847772, -0.3070362296059259],
      ],
      [
        [0, 1, 0],
        [-0.5496661281711168, 0.7850045853212367, 0.28571830281941357],
      ],
      [
        [0, 0, 1],
        [0.4176922154952657, -0.03793953045684389, 0.9077961253185493],
      ],
      [
        [-0.4, 2.8, 0.7],
        [-1.5360662636979654, 1.9241243306657614, 1.5582830274597128],
      ],
    ] as const) {
      const q = projector.projectDevicePoint(point, 0, 267, 258);
      const actual = [
        (q.x - fit.centerX) / fit.scale,
        (fit.centerY - q.y) / fit.scale,
        q.depth,
      ];
      actual.forEach((n, i) => expect(n).toBeCloseTo(expected[i], 10));
    }
  });

  it('preserves world height, orbit radius and pivot while the world axis stays vertical', () => {
    const projector = createDeviceProjector(35);
    const point = [0.4, 2.8, -0.7] as const;
    const posed = projector.transformDevicePoint(point, 0);
    const upper = projector.projectWorldPoint([0, 0.5, 0], 0, 267, 258);
    const lower = projector.projectWorldPoint([0, -0.5, 0], 0, 267, 258);
    expect(upper.x).toBe(lower.x);
    expect(upper.y).toBeLessThan(lower.y);
    for (let degree = 0; degree < 360; degree++) {
      const phase = (degree * Math.PI) / 180;
      const q = projector.transformDevicePoint(point, phase);
      expect(q[1]).toBe(posed[1]);
      expect(Math.hypot(q[0], q[2])).toBeCloseTo(
        Math.hypot(posed[0], posed[2]),
        10
      );
      expect(
        projector.transformDevicePoint([0, 0, 0], phase).every((n) => n === 0)
      ).toBe(true);
      expect(projector.projectWorldPoint([0, 0.5, 0], phase, 267, 258)).toEqual(
        upper
      );
      expect(
        projector.projectWorldPoint([0, -0.5, 0], phase, 267, 258)
      ).toEqual(lower);
      expect(projector.projectWorldPoint(posed, phase, 267, 258)).toEqual(
        projector.projectDevicePoint(point, phase, 267, 258)
      );
    }
  });
  it('turns the inclined staff about world Y instead of spinning around its shaft', () => {
    const vector = (phase: number) => {
      const top = projectDevicePoint([0, 0.5, 0], phase, 267, 258);
      const bottom = projectDevicePoint([0, -0.5, 0], phase, 267, 258);
      return { x: top.x - bottom.x, y: top.y - bottom.y };
    };
    expect(vector(0).x).toBeLessThan(0);
    expect(vector(Math.PI).x).toBeGreaterThan(0);
    expect(vector(Math.PI / 2).x).toBeCloseTo(0, 9);
    expect(vector((Math.PI * 3) / 2).x).toBeCloseTo(0, 9);
    expect(vector(Math.PI / 2).y).not.toBeCloseTo(vector(0).y);
    expect(vector(Math.PI / 2).y).not.toBeCloseTo(vector((Math.PI * 3) / 2).y);
  });
  it('shares three line weights and keeps depth-dependent shading within each hierarchy', () => {
    const lines = projectDevice(initialSpinPhase, 240, 192);
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
  it('uses a fixed exhibition scale extending past the stage without angle-dependent zoom', () => {
    const ys: number[] = [];
    for (let degree = 0; degree < 360; degree++)
      for (const line of projectDevice((degree * Math.PI) / 180, 267, 258))
        ys.push(line.from.y, line.to.y);
    // The 0.84 base fit is magnified 1.3 times; the window intentionally crops tips.
    let low = Infinity,
      high = -Infinity;
    for (const y of ys) {
      low = Math.min(low, y);
      high = Math.max(high, y);
    }
    expect((high - low) / 258).toBeGreaterThan(1.08);
    expect((high - low) / 258).toBeLessThan(1.1);
  });
  it('rotates a full turn in 16 seconds regardless of frame intervals', () => {
    expect(advanceAngle(initialSpinPhase, 16000)).toBeCloseTo(initialSpinPhase);
    expect(advanceAngle(0, 4000)).toBeCloseTo(Math.PI / 2);
    const intervals = [16, 42, 100, 330, 17, 7495];
    const stepped = intervals.reduce(advanceAngle, initialSpinPhase);
    expect(stepped).toBeCloseTo(advanceAngle(initialSpinPhase, 8000));
    expect(advanceAngle(initialSpinPhase, 0)).toBe(initialSpinPhase);
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
    'keeps finite projections and valid depth in the %i × %i stage at %i degrees',
    (width, height, tilt) => {
      const projector = createDeviceProjector(tilt);
      for (let degree = 0; degree < 360; degree++) {
        const lines = projector.projectDevice(
          (degree * Math.PI) / 180,
          width,
          height
        );
        expect(lines.length).toBeGreaterThan(100);
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
        expect(
          lines.every(({ from, to }) =>
            [from.depth, to.depth].every(
              (depth) =>
                depth >= projector.bounds.far - 1e-10 &&
                depth <= projector.bounds.near + 1e-10
            )
          )
        ).toBe(true);
      }
    }
  );

  it.each([
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
  ])(
    'protects the crown, supports and neck while tips may leave the %i × %i window',
    (width, height) => {
      const { edges, landmarks } = createDeviceModel();
      const protectedPoints = [...new Set(Object.values(landmarks).flat())];
      const pommel = [
        ...new Set(
          edges.filter((e) => e.part === 'pommel').flatMap((e) => [e.a, e.b])
        ),
      ];
      let croppedFrames = 0,
        completeFrames = 0,
        visiblePommelFrames = 0;
      const margin = (p: { x: number; y: number }) =>
        Math.min(p.x, p.y, width - p.x, height - p.y) - 0.55;
      const points = [...new Set(edges.flatMap((e) => [e.a, e.b]))];
      for (let degrees = 0; degrees < 360; degrees++) {
        const phase = (degrees * Math.PI) / 180;
        const project = (p: readonly [number, number, number]) =>
          projectDevicePoint(p, phase, width, height);
        expect(
          Math.min(...protectedPoints.map((p) => margin(project(p))))
        ).toBeGreaterThanOrEqual(0);
        if (points.some((p) => margin(project(p)) < 0)) croppedFrames++;
        else completeFrames++;
        if (pommel.every((p) => margin(project(p)) >= 0)) visiblePommelFrames++;
      }
      expect(croppedFrames).toBeGreaterThan(0);
      expect(completeFrames).toBeGreaterThan(0);
      expect(visiblePommelFrames).toBeGreaterThan(0);
      expect(visiblePommelFrames).toBeLessThan(360);
    }
  );

  it('projects the complete assembled model with shared vertices and the same reference-point transform', () => {
    const edges = createDeviceGeometry();
    const lines = projectDevice(initialSpinPhase, 267, 258);
    expect(lines).toHaveLength(edges.length);
    const projected = new Map<string, (typeof lines)[number]['from']>();
    edges.forEach((edge, index) => {
      for (const [point, result] of [
        [edge.a, lines[index].from],
        [edge.b, lines[index].to],
      ] as const) {
        expect(result).toEqual(
          projectDevicePoint(point, initialSpinPhase, 267, 258)
        );
        const key = point.join(',');
        if (projected.has(key)) expect(result).toBe(projected.get(key));
        projected.set(key, result);
      }
    });
    expect(projectDevice(initialSpinPhase, 267, 258)).toEqual(lines);
    const fullTurn = projectDevice(initialSpinPhase + Math.PI * 2, 267, 258);
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
    expect(frontVertical).not.toBeCloseTo(sideVertical);
  });
});

it.each([35, 60])(
  'starts at %i degrees then turns about a fixed vertical world axis without refitting',
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
      if (degree === 0) expect(top.x).toBeLessThan(bottom.x);
      if (degree === 180) expect(top.x).toBeGreaterThan(bottom.x);
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
    expect(vectors[180].x).toBeCloseTo(-vectors[0].x);
    expect(vectors[180].y).toBeCloseTo(vectors[0].y);
    expect(vectors[90].x).toBeCloseTo(0);
    expect(vectors[270].x).toBeCloseTo(0);
    expect(vectors[90].y).not.toBeCloseTo(vectors[270].y);
  }
);

it('uses the 35-degree projector for both public projection paths', () => {
  const projector = createDeviceProjector(35);
  expect(projectDevice(initialSpinPhase, 267, 258)).toEqual(
    projector.projectDevice(initialSpinPhase, 267, 258)
  );
  expect(projectDevicePoint([0, 0.5, 0], initialSpinPhase, 267, 258)).toEqual(
    projector.projectDevicePoint([0, 0.5, 0], initialSpinPhase, 267, 258)
  );
});
