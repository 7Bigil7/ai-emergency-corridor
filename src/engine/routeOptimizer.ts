import { LatLng, RouteOption } from './types';

// Haversine distance in kilometers
export function calculateDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing/heading in degrees from p1 to p2
export function calculateBearingDegrees(p1: LatLng, p2: LatLng): number {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Total route path length in kilometers
export function calculateRouteLengthKm(waypoints: LatLng[]): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    if (p1 && p2) {
      total += calculateDistanceKm(p1, p2);
    }
  }
  return total;
}

/**
 * Route cost evaluation formula required by specification:
 * Cost = travelTime * (1 + 0.8 * congestion) + 15s * signalCount
 */
export function calculateRouteCost(
  travelTimeSec: number,
  congestion: number,
  signalCount: number
): number {
  return travelTimeSec * (1 + 0.8 * congestion) + 15 * signalCount;
}

/**
 * Select the route with lowest cost among candidate routes
 */
export function evaluateCandidateRoutes(routes: RouteOption[]): {
  evaluatedRoutes: RouteOption[];
  recommendedRoute: RouteOption;
} {
  const evaluatedRoutes = routes.map((r) => {
    const cost = Math.round(
      calculateRouteCost(r.normalTravelTimeSec, r.congestion, r.signalCount)
    );
    return { ...r, cost };
  });

  let bestRoute = evaluatedRoutes[0]!;
  for (const r of evaluatedRoutes) {
    if (r.cost < bestRoute.cost) {
      bestRoute = r;
    }
  }

  const finalizedRoutes = evaluatedRoutes.map((r) => ({
    ...r,
    isRecommended: r.id === bestRoute.id,
  }));

  return {
    evaluatedRoutes: finalizedRoutes,
    recommendedRoute: bestRoute,
  };
}

export interface InterpolatedPoint {
  position: LatLng;
  heading: number;
  segmentIndex: number;
  segmentProgress: number; // 0..1
  totalProgressPercent: number; // 0..100
  distanceCoveredKm: number;
  distanceRemainingKm: number;
}

/**
 * Interpolates a position along the waypoints given a progress value 0..1
 */
export function interpolateRouteProgress(
  waypoints: LatLng[],
  progress: number
): InterpolatedPoint {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  if (waypoints.length === 0) {
    return {
      position: { lat: 12.9815, lng: 77.6185 },
      heading: 0,
      segmentIndex: 0,
      segmentProgress: 0,
      totalProgressPercent: 0,
      distanceCoveredKm: 0,
      distanceRemainingKm: 0,
    };
  }

  if (waypoints.length === 1 || clampedProgress <= 0) {
    const p0 = waypoints[0]!;
    const p1 = waypoints[1] ?? p0;
    const totalDist = calculateRouteLengthKm(waypoints);
    return {
      position: p0,
      heading: calculateBearingDegrees(p0, p1),
      segmentIndex: 0,
      segmentProgress: 0,
      totalProgressPercent: 0,
      distanceCoveredKm: 0,
      distanceRemainingKm: totalDist,
    };
  }

  if (clampedProgress >= 1) {
    const pLast = waypoints[waypoints.length - 1]!;
    const pPrev = waypoints[waypoints.length - 2] ?? pLast;
    const totalDist = calculateRouteLengthKm(waypoints);
    return {
      position: pLast,
      heading: calculateBearingDegrees(pPrev, pLast),
      segmentIndex: waypoints.length - 2,
      segmentProgress: 1,
      totalProgressPercent: 100,
      distanceCoveredKm: totalDist,
      distanceRemainingKm: 0,
    };
  }

  // Calculate segment lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const pA = waypoints[i]!;
    const pB = waypoints[i + 1]!;
    const len = calculateDistanceKm(pA, pB);
    segmentLengths.push(len);
    totalLength += len;
  }

  const targetDist = clampedProgress * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i]!;
    if (accumulated + segLen >= targetDist || i === segmentLengths.length - 1) {
      const segRatio = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      const clampedSegRatio = Math.max(0, Math.min(1, segRatio));

      const pA = waypoints[i]!;
      const pB = waypoints[i + 1]!;

      const lat = pA.lat + (pB.lat - pA.lat) * clampedSegRatio;
      const lng = pA.lng + (pB.lng - pA.lng) * clampedSegRatio;
      const heading = calculateBearingDegrees(pA, pB);

      return {
        position: { lat, lng },
        heading,
        segmentIndex: i,
        segmentProgress: clampedSegRatio,
        totalProgressPercent: Math.round(clampedProgress * 1000) / 10,
        distanceCoveredKm: Math.round(targetDist * 100) / 100,
        distanceRemainingKm: Math.round((totalLength - targetDist) * 100) / 100,
      };
    }
    accumulated += segLen;
  }

  const pLast = waypoints[waypoints.length - 1]!;
  return {
    position: pLast,
    heading: 0,
    segmentIndex: waypoints.length - 2,
    segmentProgress: 1,
    totalProgressPercent: 100,
    distanceCoveredKm: totalLength,
    distanceRemainingKm: 0,
  };
}
