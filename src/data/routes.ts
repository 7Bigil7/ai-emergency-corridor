import { RouteOption } from '../engine/types';

export const CANDIDATE_ROUTES: RouteOption[] = [
  {
    id: 'route_a',
    name: 'Route A: Commercial & MG Road Arterial',
    via: 'via MG Road & Richmond Circle',
    distanceKm: 6.2,
    normalTravelTimeSec: 1050, // ~17.5 min
    congestion: 0.78, // High congestion
    signalCount: 9,
    cost: 1840,
    isRecommended: false,
    waypoints: [
      { lat: 12.9815, lng: 77.6185 }, // Origin Ulsoor East
      { lat: 12.9782, lng: 77.6150 },
      { lat: 12.9750, lng: 77.6080 }, // MG Road Metro
      { lat: 12.9735, lng: 77.6030 }, // Brigade Rd Jn
      { lat: 12.9690, lng: 77.6010 }, // Residency Rd
      { lat: 12.9640, lng: 77.5970 }, // Richmond Circle
      { lat: 12.9620, lng: 77.5890 }, // Mission Rd
      { lat: 12.9612, lng: 77.5742 }, // Victoria Hospital
    ],
  },
  {
    id: 'route_b',
    name: 'Route B: Cubbon Park / Kasturba Corridor',
    via: 'via Cubbon Rd, Raj Bhavan & Kasturba Rd',
    distanceKm: 5.8,
    normalTravelTimeSec: 720, // 12 min
    congestion: 0.41, // Moderate-low congestion, wide 4-lane arterial
    signalCount: 7,
    cost: 1061,
    isRecommended: true,
    waypoints: [
      { lat: 12.9815, lng: 77.6185 }, // 0: Origin: Ulsoor Lake East
      { lat: 12.9805, lng: 77.6145 }, // 1: Manipal Centre
      { lat: 12.9795, lng: 77.6105 }, // 2: S01 Cubbon Rd / Dickenson Rd
      { lat: 12.9785, lng: 77.6050 }, // 3: Minsk Square approach
      { lat: 12.9776, lng: 77.5998 }, // 4: S02 GPO / Raj Bhavan
      { lat: 12.9760, lng: 77.5925 }, // 5: S03 High Court / Vidhana Soudha
      { lat: 12.9740, lng: 77.5932 }, // 6: Museum Road entry
      { lat: 12.9722, lng: 77.5940 }, // 7: S04 Kasturba Rd / Museum
      { lat: 12.9700, lng: 77.5935 }, // 8: Cubbon Park Gate
      { lat: 12.9682, lng: 77.5930 }, // 9: S05 Kanteerava / Mallya Jn
      { lat: 12.9665, lng: 77.5900 }, // 10: Nrupathunga Rd
      { lat: 12.9648, lng: 77.5872 }, // 11: S06 Hudson Circle
      { lat: 12.9635, lng: 77.5835 }, // 12: Corporation Building
      { lat: 12.9625, lng: 77.5802 }, // 13: S07 Town Hall / Kalasipalya Gate
      { lat: 12.9615, lng: 77.5770 }, // 14: K.R. Market Flyover approach
      { lat: 12.9612, lng: 77.5742 }, // 15: Destination: Victoria Hospital Trauma ICU
    ],
  },
  {
    id: 'route_c',
    name: 'Route C: Halasuru & Lalbagh Bypass',
    via: 'via Old Madras Rd & Double Road',
    distanceKm: 6.9,
    normalTravelTimeSec: 900, // 15 min
    congestion: 0.55,
    signalCount: 8,
    cost: 1416,
    isRecommended: false,
    waypoints: [
      { lat: 12.9815, lng: 77.6185 }, // Origin
      { lat: 12.9840, lng: 77.6250 }, // Old Madras Rd
      { lat: 12.9750, lng: 77.6200 }, // Austin Town
      { lat: 12.9680, lng: 77.6100 }, // Neelasandra
      { lat: 12.9620, lng: 77.6000 }, // Double Road / Shanti Nagar
      { lat: 12.9580, lng: 77.5880 }, // Lalbagh North Gate
      { lat: 12.9612, lng: 77.5742 }, // Victoria Hospital
    ],
  },
];
