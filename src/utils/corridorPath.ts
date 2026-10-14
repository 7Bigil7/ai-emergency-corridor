/**
 * Unified Source of Truth for AI Emergency Corridor Road Geometry.
 * Coordinates mapped to the 3D digital twin imagery in normalized 1000 x 562.5 space (16:9 aspect).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface SignalWaypoint {
  id: string;
  name: string;
  distanceRatio: number; // 0.0 to 1.0 along the route
  distanceAlongRouteMeters: number;
  sideOffset: Point2D; // Perpendicular curb offset
}

// Exact road centerline waypoints from Indiranagar to Victoria Hospital
export const CORRIDOR_WAYPOINTS: Point2D[] = [
  { x: 235, y: 555 }, // 0: Start - Indiranagar Origin (on the asphalt lane)
  { x: 320, y: 480 }, // 1: S01 - 100ft Road Approach Lane
  { x: 395, y: 410 }, // 2: S02 - CMH Road Mid-Boulevard
  { x: 470, y: 345 }, // 3: S03 - Trinity Avenue Zebra
  { x: 545, y: 275 }, // 4: S04 - Central Grand Cross Intersection
  { x: 620, y: 220 }, // 5: S05 - Brigade Expressway Lane
  { x: 690, y: 175 }, // 6: S06 - Richmond Boulevard Link
  { x: 760, y: 142 }, // 7: S07 - Victoria Hospital Access Gate
  { x: 825, y: 118 }, // 8: Destination - Victoria Hospital Emergency Portico
];

// Precompute cumulative lengths along waypoints
const segmentLengths: number[] = [];
let totalPolylineLength = 0;

for (let i = 0; i < CORRIDOR_WAYPOINTS.length - 1; i++) {
  const p1 = CORRIDOR_WAYPOINTS[i]!;
  const p2 = CORRIDOR_WAYPOINTS[i + 1]!;
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  segmentLengths.push(len);
  totalPolylineLength += len;
}

export const CORRIDOR_TOTAL_LENGTH_PX = totalPolylineLength;
export const TOTAL_ROUTE_DISTANCE_KM = 4.8; // 4.8 km real-world equivalent

// Generate smooth SVG Catmull-Rom or cubic spline path
export function generateSvgPath(points: Point2D[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    // Catmull-Rom to Cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export const CORRIDOR_SVG_PATH_D = generateSvgPath(CORRIDOR_WAYPOINTS);

// Pre-sampled dense spline lookup table for uniform arc-length parameterization
const SAMPLE_COUNT = 300;
interface SplineSample {
  t: number;
  point: Point2D;
  distance: number;
  tangent: Point2D;
  headingDeg: number;
}

const SPLINE_SAMPLES: SplineSample[] = [];

// Evaluate cubic segment at sub-parameter u in [0, 1]
function evaluateCatmullRom(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  u: number
): { point: Point2D; tangent: Point2D } {
  const u2 = u * u;
  const u3 = u2 * u;

  // Catmull-Rom basis functions
  const f1 = -0.5 * u3 + u2 - 0.5 * u;
  const f2 = 1.5 * u3 - 2.5 * u2 + 1.0;
  const f3 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
  const f4 = 0.5 * u3 - 0.5 * u2;

  const x = p0.x * f1 + p1.x * f2 + p2.x * f3 + p3.x * f4;
  const y = p0.y * f1 + p1.y * f2 + p2.y * f3 + p3.y * f4;

  // Tangents (derivatives)
  const df1 = -1.5 * u2 + 2.0 * u - 0.5;
  const df2 = 4.5 * u2 - 5.0 * u;
  const df3 = -4.5 * u2 + 4.0 * u + 0.5;
  const df4 = 1.5 * u2 - 1.0 * u;

  const tx = p0.x * df1 + p1.x * df2 + p2.x * df3 + p3.x * df4;
  const ty = p0.y * df1 + p1.y * df2 + p2.y * df3 + p3.y * df4;

  return { point: { x, y }, tangent: { x: tx, y: ty } };
}

// Build precomputed samples
(() => {
  const numSegs = CORRIDOR_WAYPOINTS.length - 1;
  let cumDist = 0;
  let prevPt = CORRIDOR_WAYPOINTS[0]!;

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const globalRatio = i / SAMPLE_COUNT;
    const segFloat = globalRatio * numSegs;
    const segIdx = Math.min(Math.floor(segFloat), numSegs - 1);
    const u = segFloat - segIdx;

    const p0 = CORRIDOR_WAYPOINTS[Math.max(0, segIdx - 1)]!;
    const p1 = CORRIDOR_WAYPOINTS[segIdx]!;
    const p2 = CORRIDOR_WAYPOINTS[segIdx + 1]!;
    const p3 = CORRIDOR_WAYPOINTS[Math.min(CORRIDOR_WAYPOINTS.length - 1, segIdx + 2)]!;

    const { point, tangent } = evaluateCatmullRom(p0, p1, p2, p3, u);

    if (i > 0) {
      cumDist += Math.hypot(point.x - prevPt.x, point.y - prevPt.y);
    }
    prevPt = point;

    const headingDeg = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;

    SPLINE_SAMPLES.push({
      t: globalRatio,
      point,
      distance: cumDist,
      tangent,
      headingDeg,
    });
  }
})();

export const SPLINE_TOTAL_LENGTH_PX = SPLINE_SAMPLES[SPLINE_SAMPLES.length - 1]?.distance || totalPolylineLength;

// Signals S01-S07 defined strictly along this single source of truth route
export const SIGNAL_DEFINITIONS: SignalWaypoint[] = [
  { id: 'S01', name: '100ft Road', distanceRatio: 0.14, distanceAlongRouteMeters: 670, sideOffset: { x: -14, y: -20 } },
  { id: 'S02', name: 'CMH Junction', distanceRatio: 0.28, distanceAlongRouteMeters: 1340, sideOffset: { x: -14, y: -20 } },
  { id: 'S03', name: 'Trinity Avenue', distanceRatio: 0.41, distanceAlongRouteMeters: 1970, sideOffset: { x: -14, y: -20 } },
  { id: 'S04', name: 'Central Grand Cross', distanceRatio: 0.53, distanceAlongRouteMeters: 2540, sideOffset: { x: -14, y: -20 } },
  { id: 'S05', name: 'Brigade Expressway', distanceRatio: 0.66, distanceAlongRouteMeters: 3170, sideOffset: { x: -14, y: -20 } },
  { id: 'S06', name: 'Richmond Boulevard', distanceRatio: 0.78, distanceAlongRouteMeters: 3740, sideOffset: { x: -14, y: -20 } },
  { id: 'S07', name: 'Victoria Gate', distanceRatio: 0.89, distanceAlongRouteMeters: 4270, sideOffset: { x: -14, y: -20 } },
];

/**
 * Analytical point and heading interpolation along corridor spline.
 * Returns exact point and continuous smoothed heading tangent.
 */
export function getPointOnCorridor(progressRatio: number, points: Point2D[] = CORRIDOR_WAYPOINTS): {
  position: Point2D;
  headingDeg: number;
  tangent: Point2D;
} {
  const tClamped = Math.max(0, Math.min(1, progressRatio));

  // If using default corridor waypoints, interpolate using the dense smooth spline
  if (points === CORRIDOR_WAYPOINTS && SPLINE_SAMPLES.length > 0) {
    if (tClamped <= 0) {
      const first = SPLINE_SAMPLES[0]!;
      return {
        position: { x: CORRIDOR_WAYPOINTS[0]!.x, y: CORRIDOR_WAYPOINTS[0]!.y },
        headingDeg: first.headingDeg,
        tangent: first.tangent,
      };
    }
    if (tClamped >= 1) {
      const last = SPLINE_SAMPLES[SPLINE_SAMPLES.length - 1]!;
      const endPt = CORRIDOR_WAYPOINTS[CORRIDOR_WAYPOINTS.length - 1]!;
      return {
        position: { x: endPt.x, y: endPt.y },
        headingDeg: last.headingDeg,
        tangent: last.tangent,
      };
    }

    const targetDist = tClamped * SPLINE_TOTAL_LENGTH_PX;
    let low = 0;
    let high = SPLINE_SAMPLES.length - 1;

    while (low < high - 1) {
      const mid = Math.floor((low + high) / 2);
      if (SPLINE_SAMPLES[mid]!.distance <= targetDist) {
        low = mid;
      } else {
        high = mid;
      }
    }

    const s1 = SPLINE_SAMPLES[low]!;
    const s2 = SPLINE_SAMPLES[high]!;
    const span = s2.distance - s1.distance;
    const factor = span > 0.001 ? (targetDist - s1.distance) / span : 0;

    const x = s1.point.x + (s2.point.x - s1.point.x) * factor;
    const y = s1.point.y + (s2.point.y - s1.point.y) * factor;
    const tx = s1.tangent.x + (s2.tangent.x - s1.tangent.x) * factor;
    const ty = s1.tangent.y + (s2.tangent.y - s1.tangent.y) * factor;

    const headingDeg = (Math.atan2(ty, tx) * 180) / Math.PI;

    return {
      position: { x, y },
      headingDeg,
      tangent: { x: tx, y: ty },
    };
  }

  // Fallback for custom points (e.g. ambient vehicle lanes)
  const totalSegments = points.length - 1;
  const segProgress = tClamped * totalSegments;
  const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
  const subT = segProgress - segIndex;

  const p1 = points[segIndex]!;
  const p2 = points[segIndex + 1]!;

  const x = p1.x + (p2.x - p1.x) * subT;
  const y = p1.y + (p2.y - p1.y) * subT;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const headingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    position: { x, y },
    headingDeg,
    tangent: { x: dx, y: dy },
  };
}

/**
 * Returns point on path given distance along the path in meters
 */
export function getPointAtDistance(distanceMeters: number): {
  position: Point2D;
  headingDeg: number;
} {
  const ratio = Math.max(0, Math.min(1, distanceMeters / (TOTAL_ROUTE_DISTANCE_KM * 1000)));
  return getPointOnCorridor(ratio);
}

// Ambient vehicle lane paths along parallel and cross avenues
export interface AmbientPath {
  id: string;
  type: 'parallel' | 'cross' | 'ahead';
  waypoints: Point2D[];
  speed: number;
}

export const AMBIENT_LANES: AmbientPath[] = [
  {
    id: 'amb_lane_1',
    type: 'cross',
    waypoints: [
      { x: 380, y: 70 },
      { x: 545, y: 275 },
      { x: 740, y: 490 },
      { x: 810, y: 560 },
    ],
    speed: 0.05,
  },
  {
    id: 'amb_lane_2',
    type: 'parallel',
    waypoints: [
      { x: 100, y: 380 },
      { x: 260, y: 555 },
      { x: 440, y: 560 },
    ],
    speed: 0.06,
  },
  {
    id: 'amb_lane_3',
    type: 'cross',
    waypoints: [
      { x: 620, y: 120 },
      { x: 690, y: 175 },
      { x: 880, y: 330 },
    ],
    speed: 0.04,
  },
  {
    id: 'amb_lane_4',
    type: 'ahead',
    waypoints: [
      { x: 470, y: 345 },
      { x: 545, y: 275 },
      { x: 620, y: 220 },
      { x: 760, y: 142 },
    ],
    speed: 0.03,
  },
];
