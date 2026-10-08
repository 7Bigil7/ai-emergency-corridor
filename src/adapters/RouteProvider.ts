/**
 * RouteProvider Adapter
 *
 * PRODUCTION REPLACEMENT:
 * In a production municipal deployment, this adapter would interface with:
 * 1. Self-hosted OSRM (Open Source Routing Machine) or Valhalla routing engine
 * 2. Real-time dynamic graph-weighting based on live road closures, construction, and VMS sign status
 *
 * CURRENT IMPLEMENTATION:
 * Evaluates candidate corridors with geometric distance and the weighted cost function:
 * Cost = travelTime * (1 + 0.8 * congestion) + 15s * signalCount
 */

import { LatLng, RouteOption } from '../engine/types';
import { CANDIDATE_ROUTES } from '../data/routes';
import { calculateRouteCost } from '../engine/routeOptimizer';

export class RouteProvider {
  /**
   * Evaluates candidate routes from origin to target hospital
   */
  public async getCandidateRoutes(
    _origin: LatLng,
    _destination: LatLng
  ): Promise<RouteOption[]> {
    return CANDIDATE_ROUTES.map((route) => ({
      ...route,
      cost: Math.round(
        calculateRouteCost(
          route.normalTravelTimeSec,
          route.congestion,
          route.signalCount
        )
      ),
    }));
  }
}

export const routeProvider = new RouteProvider();
