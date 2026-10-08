import { describe, it, expect } from 'vitest';
import {
  CORRIDOR_SVG_PATH_D,
  SIGNAL_DEFINITIONS,
  getPointOnCorridor,
} from '../../utils/corridorPath';

describe('Unified Corridor Path & Geometry', () => {
  it('has a valid smooth SVG path string starting at Indiranagar and ending at Victoria Hospital', () => {
    expect(CORRIDOR_SVG_PATH_D).toContain('M 60 510');
    expect(CORRIDOR_SVG_PATH_D).toContain('940 50');
  });

  it('interpolates start point at progress 0.0 equal to Indiranagar origin', () => {
    const { position } = getPointOnCorridor(0.0);
    expect(position.x).toBeCloseTo(60, 1);
    expect(position.y).toBeCloseTo(510, 1);
  });

  it('interpolates end point at progress 1.0 equal to Victoria Hospital center', () => {
    const { position } = getPointOnCorridor(1.0);
    expect(position.x).toBeCloseTo(940, 1);
    expect(position.y).toBeCloseTo(50, 1);
  });

  it('places all 7 signals sequentially along the route with valid road positions', () => {
    let lastX = 0;
    let lastY = 1000;

    SIGNAL_DEFINITIONS.forEach((sig) => {
      const { position } = getPointOnCorridor(sig.distanceRatio);

      expect(position.x).toBeGreaterThan(lastX);
      expect(position.y).toBeLessThan(lastY);

      lastX = position.x;
      lastY = position.y;
    });
  });

  it('calculates continuous and smooth heading angle tangents for vehicle navigation', () => {
    const p0 = getPointOnCorridor(0.0);
    const p50 = getPointOnCorridor(0.5);
    const p100 = getPointOnCorridor(1.0);

    expect(p0.headingDeg).toBeLessThan(0);
    expect(p50.headingDeg).toBeLessThan(0);
    expect(p100.headingDeg).toBeLessThan(0);
  });
});
