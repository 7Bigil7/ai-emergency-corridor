/**
 * Unified Source of Truth for AI Emergency Corridor Road Geometry.
 * All coordinates are defined in normalized 0-1000 x 0-562.5 space (16:9 aspect ratio),
 * mapped 1:1 to the smart city 3D digital twin imagery.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface SignalWaypoint {
  id: string;
  name: string;
  distanceRatio: number; // 0.0 to 1.0 along the route
  sideOffset: Point2D; // perpendicular curb offset
}

// Exact Road Centerline Waypoints along the continuous illuminated diagonal boulevard
export const CORRIDOR_WAYPOINTS: Point2D[] = [
  { x: 235, y: 555 }, // 0: Start - Indiranagar Origin (on the asphalt lane)
  { x: 320, y: 480 }, // 1: S01 - 100ft Road Approach Lane
  { x: 395, y: 410 }, // 2: S02 - Mid-Boulevard Lane
  { x: 470, y: 345 }, // 3: S03 - Approaching Grand Cross Zebra
  { x: 545, y: 275 }, // 4: S04 - Central Grand Cross Intersection
  { x: 620, y: 220 }, // 5: S05 - Brigade Expressway Lane
  { x: 690, y: 175 }, // 6: S06 - Richmond Link Road
  { x: 760, y: 142 }, // 7: S07 - Victoria Hospital Access Gate
  { x: 825, y: 118 }, // 8: Destination - Victoria Hospital Emergency Portico
];

// Generate smooth SVG Catmull-Rom or cubic path string from waypoints
export function generateSvgPath(points: Point2D[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0]!.x} ${points[0]!.y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;

    // Catmull-Rom to Cubic Bézier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }

  return d;
}

export const CORRIDOR_SVG_PATH_D = generateSvgPath(CORRIDOR_WAYPOINTS);

// Signals S01-S07 defined strictly by distance ratio along this route
export const SIGNAL_DEFINITIONS: SignalWaypoint[] = [
  { id: 'S01', name: '100ft Road', distanceRatio: 0.14, sideOffset: { x: -14, y: -20 } },
  { id: 'S02', name: 'CMH Junction', distanceRatio: 0.28, sideOffset: { x: -14, y: -20 } },
  { id: 'S03', name: 'Trinity Avenue', distanceRatio: 0.41, sideOffset: { x: -14, y: -20 } },
  { id: 'S04', name: 'Central Grand Cross', distanceRatio: 0.53, sideOffset: { x: -14, y: -20 } },
  { id: 'S05', name: 'Brigade Expressway', distanceRatio: 0.66, sideOffset: { x: -14, y: -20 } },
  { id: 'S06', name: 'Richmond Boulevard', distanceRatio: 0.78, sideOffset: { x: -14, y: -20 } },
  { id: 'S07', name: 'Victoria Gate', distanceRatio: 0.89, sideOffset: { x: -14, y: -20 } },
];

// Analytical point interpolation along polyline / spline
export function getPointOnCorridor(progressRatio: number, points: Point2D[] = CORRIDOR_WAYPOINTS): {
  position: Point2D;
  headingDeg: number;
} {
  const tClamped = Math.max(0, Math.min(1, progressRatio));
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
  };
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
    speed: 0.07,
  },
  {
    id: 'amb_lane_2',
    type: 'parallel',
    waypoints: [
      { x: 100, y: 380 },
      { x: 260, y: 555 },
      { x: 440, y: 560 },
    ],
    speed: 0.08,
  },
  {
    id: 'amb_lane_3',
    type: 'cross',
    waypoints: [
      { x: 620, y: 120 },
      { x: 690, y: 175 },
      { x: 880, y: 330 },
    ],
    speed: 0.06,
  },
];
