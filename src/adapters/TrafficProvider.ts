/**
 * TrafficProvider Adapter
 *
 * PRODUCTION REPLACEMENT:
 * In a production municipal deployment, this adapter would interface with:
 * 1. TomTom Real-Time Traffic API / Google Roads API / HERE Traffic Vector Flow
 * 2. Bengaluru Traffic Police (BTP) live roadside sensor loops & CCTV video analytics
 *
 * CURRENT IMPLEMENTATION:
 * Simulated deterministic telemetry provider feeding congestion coefficients (0.0 - 1.0)
 * to the corridor optimization engine.
 */

export interface TrafficSegmentTelemetry {
  segmentId: string;
  roadName: string;
  congestionIndex: number; // 0.0 (free flow) to 1.0 (gridlock)
  averageSpeedKmh: number;
  incidentFlag: boolean;
}

export class TrafficProvider {
  /**
   * Fetches real-time congestion for candidate routes
   */
  public async getRouteCongestion(routeId: string): Promise<number> {
    // Simulated realistic values matching the Bengaluru scenario
    switch (routeId) {
      case 'route_a':
        return 0.78; // MG Road severe peak bottleneck
      case 'route_b':
        return 0.41; // Cubbon Road wide arterial corridor
      case 'route_c':
        return 0.55; // Ulsoor / Old Madras bypass
      default:
        return 0.5;
    }
  }

  /**
   * Fetches live telemetry for arterial segments
   */
  public getArterialSegments(): TrafficSegmentTelemetry[] {
    return [
      {
        segmentId: 'seg_mg_rd',
        roadName: 'MG Road (Trinity - Brigade)',
        congestionIndex: 0.78,
        averageSpeedKmh: 14,
        incidentFlag: true,
      },
      {
        segmentId: 'seg_cubbon_rd',
        roadName: 'Cubbon Road (Dickenson - Minsk)',
        congestionIndex: 0.41,
        averageSpeedKmh: 38,
        incidentFlag: false,
      },
      {
        segmentId: 'seg_kasturba_rd',
        roadName: 'Kasturba Road (Museum - Hudson)',
        congestionIndex: 0.38,
        averageSpeedKmh: 42,
        incidentFlag: false,
      },
    ];
  }
}

export const trafficProvider = new TrafficProvider();
