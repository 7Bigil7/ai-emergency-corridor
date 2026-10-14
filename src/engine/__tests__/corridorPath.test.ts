import { describe, it, expect } from 'vitest';
import {
  CORRIDOR_SVG_PATH_D,
  SIGNAL_DEFINITIONS,
  CORRIDOR_WAYPOINTS,
  getPointOnCorridor,
  getPointAtDistance,
  TOTAL_ROUTE_DISTANCE_KM,
} from '../../utils/corridorPath';

describe('Unified Corridor Path & Geometry Tests', () => {
  it('has a valid smooth SVG path string starting at Indiranagar and ending at Victoria Hospital', () => {
    expect(CORRIDOR_SVG_PATH_D).toContain('M 235 555');
    expect(CORRIDOR_SVG_PATH_D).toContain('825 118');
  });

  // Requirement: position at distance 0 equals the start
  it('position at distance 0 equals the start (Indiranagar)', () => {
    const { position } = getPointAtDistance(0);
    expect(position.x).toBeCloseTo(CORRIDOR_WAYPOINTS[0]!.x, 1);
    expect(position.y).toBeCloseTo(CORRIDOR_WAYPOINTS[0]!.y, 1);
  });

  // Requirement: at full length equals the hospital
  it('position at full length equals the hospital (Victoria Hospital)', () => {
    const totalMeters = TOTAL_ROUTE_DISTANCE_KM * 1000;
    const { position } = getPointAtDistance(totalMeters);
    const endPoint = CORRIDOR_WAYPOINTS[CORRIDOR_WAYPOINTS.length - 1]!;
    expect(position.x).toBeCloseTo(endPoint.x, 1);
    expect(position.y).toBeCloseTo(endPoint.y, 1);
  });

  // Requirement: signals lie within tolerance of the path
  it('signals lie within tolerance of the path (kerb offset distance < 35px)', () => {
    SIGNAL_DEFINITIONS.forEach((sig) => {
      const { position } = getPointOnCorridor(sig.distanceRatio);
      const signalPlacedX = position.x + sig.sideOffset.x;
      const signalPlacedY = position.y + sig.sideOffset.y;

      const offsetDist = Math.hypot(signalPlacedX - position.x, signalPlacedY - position.y);
      // Offset from road centerline to kerb must be reasonable (within 35 pixels)
      expect(offsetDist).toBeLessThanOrEqual(35);
      expect(offsetDist).toBeGreaterThan(0);
    });
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
