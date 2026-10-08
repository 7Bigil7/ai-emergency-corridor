export interface TrafficIncident {
  id: string;
  code: string;
  title: string;
  locationName: string;
  coords: { x: number; y: number }; // In 1000x562.5 3D space
  latLng: { lat: number; lng: number };
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'CONGESTION' | 'BREAKDOWN' | 'CONSTRUCTION' | 'HAZARD';
  description: string;
  impactRadiusM: number;
  reportedTime: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'CLEARING' | 'RESOLVED';
  affectedLanes: string;
  clearanceEtaMin: number;
}

export const ACTIVE_INCIDENTS: TrafficIncident[] = [
  {
    id: 'inc_01',
    code: 'INC-402',
    title: 'Commercial Vehicle Breakdown',
    locationName: 'Richmond Boulevard / Link 6',
    coords: { x: 690, y: 175 },
    latLng: { lat: 12.9640, lng: 77.5970 },
    severity: 'MEDIUM',
    type: 'BREAKDOWN',
    description: 'Medium freight truck stalled on outer curb lane. Traffic diversion active.',
    impactRadiusM: 180,
    reportedTime: '19:34:10',
    status: 'CLEARING',
    affectedLanes: '1 of 3 lanes blocked',
    clearanceEtaMin: 8,
  },
  {
    id: 'inc_02',
    code: 'INC-409',
    title: 'Heavy Peak Congestion Buildup',
    locationName: 'MG Road / Mid Boulevard',
    coords: { x: 395, y: 410 },
    latLng: { lat: 12.9750, lng: 77.6080 },
    severity: 'HIGH',
    type: 'CONGESTION',
    description: 'Peak hour arterial bottle-neck. AI rerouted emergency corridor via Cubbon expressway.',
    impactRadiusM: 350,
    reportedTime: '19:28:45',
    status: 'ACTIVE',
    affectedLanes: 'All eastbound lanes slow (12 km/h avg)',
    clearanceEtaMin: 22,
  },
  {
    id: 'inc_03',
    code: 'INC-415',
    title: 'Metro Utility Maintenance Work',
    locationName: 'Central Grand Cross Intersection',
    coords: { x: 545, y: 275 },
    latLng: { lat: 12.9735, lng: 77.6030 },
    severity: 'LOW',
    type: 'CONSTRUCTION',
    description: 'Scheduled barricading on shoulder lane. Emergency passage clear.',
    impactRadiusM: 100,
    reportedTime: '18:15:00',
    status: 'ACTIVE',
    affectedLanes: 'Left shoulder closed',
    clearanceEtaMin: 90,
  },
];
