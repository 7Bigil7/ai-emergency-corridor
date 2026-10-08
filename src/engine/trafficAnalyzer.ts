import { AmbientVehicle, LatLng } from './types';

/**
 * Generates ambient city vehicles along corridors and side streets
 */
export function generateInitialAmbientVehicles(): AmbientVehicle[] {
  return [
    {
      id: 'veh_01',
      pos: { lat: 12.9800, lng: 77.6120 },
      heading: 250,
      speed: 30,
      routeType: 'ahead',
      isYielding: false,
    },
    {
      id: 'veh_02',
      pos: { lat: 12.9770, lng: 77.6010 },
      heading: 260,
      speed: 25,
      routeType: 'ahead',
      isYielding: false,
    },
    {
      id: 'veh_03',
      pos: { lat: 12.9745, lng: 77.5930 },
      heading: 180,
      speed: 28,
      routeType: 'cross',
      isYielding: false,
    },
    {
      id: 'veh_04',
      pos: { lat: 12.9695, lng: 77.5932 },
      heading: 190,
      speed: 32,
      routeType: 'ahead',
      isYielding: false,
    },
    {
      id: 'veh_05',
      pos: { lat: 12.9660, lng: 77.5890 },
      heading: 230,
      speed: 24,
      routeType: 'parallel',
      isYielding: false,
    },
    {
      id: 'veh_06',
      pos: { lat: 12.9630, lng: 77.5820 },
      heading: 240,
      speed: 35,
      routeType: 'ahead',
      isYielding: false,
    },
  ];
}

/**
 * Updates ambient vehicle positions and yielding behavior
 */
export function updateAmbientVehicles(
  vehicles: AmbientVehicle[],
  corridorActive: boolean,
  ambulancePos: LatLng,
  dt: number
): AmbientVehicle[] {
  return vehicles.map((veh) => {
    // Check distance to ambulance
    const dLat = (ambulancePos.lat - veh.pos.lat) * 111.32;
    const dLng = (ambulancePos.lng - veh.pos.lng) * 111.32 * Math.cos((veh.pos.lat * Math.PI) / 180);
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

    // Yield if ambulance is within 350m and corridor is active
    const isYielding = corridorActive && distKm < 0.35;
    const effectiveSpeed = isYielding ? 5 : veh.speed;

    const speedKmSec = effectiveSpeed / 3600;
    const distanceStep = speedKmSec * dt;

    const rad = (veh.heading * Math.PI) / 180;
    const deltaLat = (distanceStep * Math.cos(rad)) / 111.32;
    const deltaLng = (distanceStep * Math.sin(rad)) / (111.32 * Math.cos((veh.pos.lat * Math.PI) / 180));

    let newLat = veh.pos.lat + deltaLat;
    let newLng = veh.pos.lng + deltaLng;

    // Wrap around boundaries for perpetual background movement
    if (newLat < 12.9550) newLat = 12.9840;
    if (newLat > 12.9860) newLat = 12.9560;
    if (newLng < 77.5680) newLng = 77.6250;
    if (newLng > 77.6280) newLng = 77.5700;

    return {
      ...veh,
      pos: { lat: newLat, lng: newLng },
      isYielding,
    };
  });
}
