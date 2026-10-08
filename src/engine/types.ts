export type CorridorState =
  | 'IDLE'
  | 'ANALYZING'
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'RESETTING'
  | 'ABORTED';

export type SignalLamp = 'RED' | 'YELLOW' | 'GREEN' | 'FAULT';

export type SignalMode = 'NORMAL' | 'PREPARING_GREEN' | 'CORRIDOR_GREEN' | 'RESTORING' | 'FAULT';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TrafficSignal {
  id: string;
  name: string;
  location: LatLng;
  lamp: SignalLamp;
  mode: SignalMode;
  normalCycleSeconds: {
    green: number;
    yellow: number;
    red: number;
  };
  offsetSeconds: number;
  cycleTimer: number;
  corridorHoldRemaining: number;
  yellowCountdownRemaining: number;
  isFaulty: boolean;
  routeIndex: number; // Order index along Route B
  isCleared?: boolean; // True once ambulance has passed through this junction
  clearanceTimeSec?: number;
}

export interface RouteOption {
  id: 'route_a' | 'route_b' | 'route_c';
  name: string;
  via: string;
  distanceKm: number;
  normalTravelTimeSec: number;
  congestion: number; // 0.0 - 1.0 (e.g. 0.78, 0.41, 0.55)
  signalCount: number;
  waypoints: LatLng[];
  cost: number;
  isRecommended: boolean;
}

export interface AmbulanceTelemetry {
  id: string;
  callSign: string;
  patientStatus: 'CRITICAL' | 'STABLE' | 'STANDBY';
  currentPos: LatLng;
  heading: number; // degrees
  speedKmh: number;
  targetSpeedKmh: number;
  progressPercent: number; // 0 - 100
  distanceCoveredKm: number;
  totalDistanceKm: number;
  currentWaypointIndex: number;
  etaWithAiSec: number;
  etaWithoutAiSec: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: LatLng;
  emergencyDepartment: string;
  availableTraumaBeds: number;
  contactFreq: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  simTimeSec: number;
  type: 'INFO' | 'ACTION' | 'AI_OPTIMIZATION' | 'SIGNAL' | 'ALERT' | 'OVERRIDE';
  source: 'OPERATOR' | 'AI_CORE' | 'GPS_TELEMETRY' | 'SIGNAL_CONTROLLER' | 'HOSPITAL_ED';
  message: string;
  ariaAnnouncement?: string;
}

export interface AIInsight {
  id: string;
  timestamp: string;
  message: string;
  category: 'ROUTING' | 'SIGNALS' | 'TELEMETRY' | 'SAFETY' | 'IMPACT';
  level: 'info' | 'success' | 'warning';
}

export interface AmbientVehicle {
  id: string;
  pos: LatLng;
  heading: number;
  speed: number;
  routeType: 'cross' | 'ahead' | 'parallel';
  isYielding: boolean;
}

export interface SimulationConfig {
  tickRateHz: number;
  normalAmbulanceSpeedKmh: number;
  corridorAmbulanceSpeedKmh: number;
  signalLookaheadTimeSec: number; // 25s
  maxConcurrentCorridorSignals: number; // 3
}

export interface SimulationStats {
  totalDistanceKm: number;
  initialEtaWithoutAiSec: number;
  initialEtaWithAiSec: number;
  currentEtaWithoutAiSec: number;
  currentEtaWithAiSec: number;
  timeSavedSeconds: number;
  timeSavedPercent: number;
  signalsTotal: number;
  signalsCoordinatedCount: number;
  missionDurationSec: number;
  averageSpeedKmh: number;
}

export interface SimulationState {
  state: CorridorState;
  simTimeSec: number;
  speedMultiplier: number;
  selectedRouteId: 'route_a' | 'route_b' | 'route_c';
  routes: RouteOption[];
  signals: TrafficSignal[];
  ambulance: AmbulanceTelemetry;
  hospital: Hospital;
  ambientVehicles: AmbientVehicle[];
  events: EventLogEntry[];
  insights: AIInsight[];
  stats: SimulationStats;
  currentSignalApproachingId: string | null;
  nextSignalApproachingId: string | null;
  activeSignalsControlledCount: number;
  trafficRedirectedPercent: number;
  demoMode: {
    isRunning: boolean;
    isPaused: boolean;
    currentStepIndex: number;
    stepTimeRemainingSec: number;
  };
}

export type SimAction =
  | { type: 'START_ANALYSIS' }
  | { type: 'SELECT_ROUTE'; routeId: 'route_a' | 'route_b' | 'route_c' }
  | { type: 'ACTIVATE_CORRIDOR' }
  | { type: 'ABORT_CORRIDOR'; reason?: string }
  | { type: 'RESET_SIMULATION' }
  | { type: 'TOGGLE_SIGNAL_FAULT'; signalId: string }
  | { type: 'SET_SPEED_MULTIPLIER'; multiplier: number }
  | { type: 'START_DEMO' }
  | { type: 'PAUSE_DEMO' }
  | { type: 'RESUME_DEMO' }
  | { type: 'SKIP_DEMO_STEP' }
  | { type: 'RESET_DEMO' };

export type StateSubscriber = (state: SimulationState) => void;
