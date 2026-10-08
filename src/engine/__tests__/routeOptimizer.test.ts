import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  calculateBearingDegrees,
  calculateRouteCost,
  evaluateCandidateRoutes,
  interpolateRouteProgress,
} from '../routeOptimizer';
import { CANDIDATE_ROUTES } from '../../data/routes';

describe('Route Optimizer', () => {
  it('correctly computes distance between two geographic coordinates', () => {
    const p1 = { lat: 12.9815, lng: 77.6185 };
    const p2 = { lat: 12.9612, lng: 77.5742 };
    const dist = calculateDistanceKm(p1, p2);
    expect(dist).toBeGreaterThan(4.5);
    expect(dist).toBeLessThan(6.5);
  });

  it('correctly calculates bearing in 0-360 degrees', () => {
    const p1 = { lat: 12.980, lng: 77.610 };
    const p2 = { lat: 12.970, lng: 77.600 };
    const bearing = calculateBearingDegrees(p1, p2);
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThanOrEqual(360);
  });

  it('accurately computes route cost based on specification formula: Cost = t * (1 + 0.8 * c) + 15 * signals', () => {
    // Test Route B: 720s, 0.41 congestion, 7 signals
    // Cost = 720 * (1 + 0.8 * 0.41) + 15 * 7 = 720 * 1.328 + 105 = 956.16 + 105 = 1061.16 => ~1061
    const costB = calculateRouteCost(720, 0.41, 7);
    expect(Math.round(costB)).toBe(1061);

    // Test Route A: 1050s, 0.78 congestion, 9 signals
    // Cost = 1050 * (1 + 0.8 * 0.78) + 15 * 9 = 1050 * 1.624 + 135 = 1705.2 + 135 = 1840.2 => ~1840
    const costA = calculateRouteCost(1050, 0.78, 9);
    expect(Math.round(costA)).toBe(1840);
  });

  it('identifies Route B as lowest cost among candidates', () => {
    const { evaluatedRoutes, recommendedRoute } = evaluateCandidateRoutes(CANDIDATE_ROUTES);
    expect(recommendedRoute.id).toBe('route_b');
    expect(recommendedRoute.isRecommended).toBe(true);

    const routeA = evaluatedRoutes.find((r) => r.id === 'route_a');
    const routeB = evaluatedRoutes.find((r) => r.id === 'route_b');
    expect(routeB!.cost).toBeLessThan(routeA!.cost);
  });

  it('interpolates route progress smoothly from 0% to 100%', () => {
    const routeB = CANDIDATE_ROUTES.find((r) => r.id === 'route_b')!;

    const start = interpolateRouteProgress(routeB.waypoints, 0);
    expect(start.totalProgressPercent).toBe(0);
    expect(start.position.lat).toBeCloseTo(routeB.waypoints[0]!.lat, 4);

    const mid = interpolateRouteProgress(routeB.waypoints, 0.5);
    expect(mid.totalProgressPercent).toBe(50);
    expect(mid.distanceCoveredKm).toBeGreaterThan(0);

    const end = interpolateRouteProgress(routeB.waypoints, 1.0);
    expect(end.totalProgressPercent).toBe(100);
    expect(end.distanceRemainingKm).toBe(0);
  });
});
