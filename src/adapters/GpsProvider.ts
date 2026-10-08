/**
 * GpsProvider Adapter
 *
 * PRODUCTION REPLACEMENT:
 * In a production municipal deployment, this adapter would interface with:
 * 1. 108 Emergency Service Vehicle Telematics (OBD-II / CAN bus + high-precision GNSS/RTK)
 * 2. MQTT / WebSocket broker streaming vehicle coordinates at 10Hz with dead reckoning
 *
 * CURRENT IMPLEMENTATION:
 * Feeds simulated interpolated vehicle coordinates along the active route.
 */

import { LatLng } from '../engine/types';

export interface GpsTelemetryMessage {
  vehicleId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  accuracyMeters: number;
  sirenActive: boolean;
}

export class GpsProvider {
  /**
   * Mock format for telemetry packet
   */
  public formatTelemetryPacket(
    pos: LatLng,
    speedKmh: number,
    heading: number,
    sirenActive: boolean
  ): GpsTelemetryMessage {
    return {
      vehicleId: 'AMB-001',
      timestamp: Date.now(),
      latitude: pos.lat,
      longitude: pos.lng,
      speedKmh,
      heading,
      accuracyMeters: 1.2,
      sirenActive,
    };
  }
}

export const gpsProvider = new GpsProvider();
