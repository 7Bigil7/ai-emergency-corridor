export interface DemoScriptStep {
  id: string;
  durationSec: number;
  actionName: string;
  description: string;
  triggerAction?: {
    type: 'START_ANALYSIS' | 'SELECT_ROUTE' | 'ACTIVATE_CORRIDOR' | 'ABORT_CORRIDOR' | 'RESET_SIMULATION';
    routeId?: 'route_a' | 'route_b' | 'route_c';
  };
}

export const DEMO_TIMELINE: DemoScriptStep[] = [
  {
    id: 'step_idle_baseline',
    durationSec: 3.5,
    actionName: 'Baseline Monitoring',
    description: 'City traffic operations in normal state. Signals cycling automatically.',
  },
  {
    id: 'step_detect_emergency',
    durationSec: 3.0,
    actionName: '108 Dispatch Alert',
    description: 'Critical Cardiac Emergency detected at Ulsoor East. Ambulance AMB-001 active.',
    triggerAction: { type: 'START_ANALYSIS' },
  },
  {
    id: 'step_analyze_routes',
    durationSec: 4.0,
    actionName: 'AI Route Evaluation',
    description: 'Evaluating MG Road (Congestion 0.78), Cubbon/Kasturba (0.41), and Ulsoor Bypass (0.55).',
  },
  {
    id: 'step_select_route_b',
    durationSec: 3.0,
    actionName: 'Route B Selected',
    description: 'Optimal route selected via Cubbon Road & Kasturba Rd (Cost: 1061 vs 1840 on MG Rd).',
    triggerAction: { type: 'SELECT_ROUTE', routeId: 'route_b' },
  },
  {
    id: 'step_activate_green_wave',
    durationSec: 3.5,
    actionName: 'Corridor Synchronization',
    description: 'Green-wave corridor engaged. SCATS signal controllers locking approaching intersections.',
    triggerAction: { type: 'ACTIVATE_CORRIDOR' },
  },
  {
    id: 'step_corridor_progression',
    durationSec: 45.0, // Active ambulance transit along the 7 signals
    actionName: 'Live Green Wave Transit',
    description: 'Dynamic green wave clearing signals S01 through S07 ahead of ambulance AMB-001.',
  },
  {
    id: 'step_hospital_arrival',
    durationSec: 10.0,
    actionName: 'Hospital Arrival & Handoff',
    description: 'Ambulance reached Victoria Hospital Trauma Center. 6.0 minutes saved.',
  },
];
