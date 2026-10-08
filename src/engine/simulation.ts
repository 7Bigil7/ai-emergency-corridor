import {
  SimulationState,
  SimAction,
  StateSubscriber,
  EventLogEntry,
} from './types';
import { CANDIDATE_ROUTES } from '../data/routes';
import { INITIAL_SIGNALS } from '../data/signals';
import { DEMO_HOSPITAL } from '../data/hospital';
import { DEMO_TIMELINE } from '../data/demoScript';
import {
  calculateRouteLengthKm,
  interpolateRouteProgress,
  evaluateCandidateRoutes,
} from './routeOptimizer';
import { updateSignals, restoreAllSignals } from './signalPlanner';
import {
  generateInitialAmbientVehicles,
  updateAmbientVehicles,
} from './trafficAnalyzer';
import {
  getInitialInsights,
  getInsightsForStateChange,
  createInsight,
} from './insightGenerator';

export class SimulationEngine {
  private state: SimulationState;
  private subscribers: Set<StateSubscriber> = new Set();

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): SimulationState {
    const { evaluatedRoutes } = evaluateCandidateRoutes(CANDIDATE_ROUTES);
    const selectedRoute = evaluatedRoutes.find((r) => r.id === 'route_b') || evaluatedRoutes[0]!;
    const totalKm = calculateRouteLengthKm(selectedRoute.waypoints);

    const startPos = selectedRoute.waypoints[0] || { lat: 12.9815, lng: 77.6185 };

    const initialEtaWithoutAiSec = 1080; // 18.0 min (normal speed 28 km/h + red signal waits)
    const initialEtaWithAiSec = 720; // 12.0 min (corridor speed 48 km/h with green wave)

    return {
      state: 'IDLE',
      simTimeSec: 0,
      speedMultiplier: 1.0,
      selectedRouteId: 'route_b',
      routes: evaluatedRoutes,
      signals: JSON.parse(JSON.stringify(INITIAL_SIGNALS)),
      ambulance: {
        id: 'AMB-001',
        callSign: 'KA-04-EM-9941',
        patientStatus: 'STANDBY',
        currentPos: startPos,
        heading: 250,
        speedKmh: 0,
        targetSpeedKmh: 28,
        progressPercent: 0,
        distanceCoveredKm: 0,
        totalDistanceKm: totalKm,
        currentWaypointIndex: 0,
        etaWithAiSec: initialEtaWithAiSec,
        etaWithoutAiSec: initialEtaWithoutAiSec,
      },
      hospital: DEMO_HOSPITAL,
      ambientVehicles: generateInitialAmbientVehicles(),
      events: [
        {
          id: 'evt_001',
          timestamp: new Date().toTimeString().split(' ')[0] || '12:00:00',
          simTimeSec: 0,
          type: 'INFO',
          source: 'OPERATOR',
          message: 'Bengaluru EOC Emergency Corridor Controller initialized. Standby.',
          ariaAnnouncement: 'Emergency corridor platform online.',
        },
      ],
      insights: getInitialInsights(),
      stats: {
        totalDistanceKm: totalKm,
        initialEtaWithoutAiSec,
        initialEtaWithAiSec,
        currentEtaWithoutAiSec: initialEtaWithoutAiSec,
        currentEtaWithAiSec: initialEtaWithAiSec,
        timeSavedSeconds: 360, // 6 min saved
        timeSavedPercent: 34,
        signalsTotal: 7,
        signalsCoordinatedCount: 0,
        missionDurationSec: 0,
        averageSpeedKmh: 28,
      },
      currentSignalApproachingId: 'S01',
      nextSignalApproachingId: 'S02',
      activeSignalsControlledCount: 0,
      trafficRedirectedPercent: 0,
      demoMode: {
        isRunning: false,
        isPaused: false,
        currentStepIndex: 0,
        stepTimeRemainingSec: 0,
      },
    };
  }

  public init(_seed?: number): SimulationState {
    this.state = this.createInitialState();
    this.notify();
    return this.getState();
  }

  public getState(): SimulationState {
    return this.state;
  }

  public subscribe(fn: StateSubscriber): () => void {
    this.subscribers.add(fn);
    fn(this.state);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  private notify(): void {
    for (const sub of this.subscribers) {
      sub(this.state);
    }
  }

  private logEvent(
    type: EventLogEntry['type'],
    source: EventLogEntry['source'],
    message: string,
    ariaAnnouncement?: string
  ): void {
    const d = new Date();
    const timestamp = d.toTimeString().split(' ')[0] || '12:00:00';
    const newEntry: EventLogEntry = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      simTimeSec: this.state.simTimeSec,
      type,
      source,
      message,
      ariaAnnouncement,
    };
    this.state.events = [newEntry, ...this.state.events.slice(0, 49)];
  }

  public dispatch(action: SimAction): SimulationState {
    const oldState = this.state.state;

    switch (action.type) {
      case 'START_ANALYSIS': {
        if (this.state.state === 'IDLE' || this.state.state === 'ABORTED') {
          this.state.state = 'ANALYZING';
          this.state.ambulance.patientStatus = 'CRITICAL';
          this.state.trafficRedirectedPercent = 15;
          this.logEvent(
            'ACTION',
            'OPERATOR',
            'Incident Code Red verified: AMB-001 en route. Starting AI corridor routing optimization.',
            'Ambulance dispatch verified. AI corridor analysis initiated.'
          );
          const newInsights = getInsightsForStateChange(oldState, 'ANALYZING', null);
          this.state.insights = [...newInsights, ...this.state.insights];
        }
        break;
      }

      case 'SELECT_ROUTE': {
        const targetRoute = this.state.routes.find((r) => r.id === action.routeId);
        if (targetRoute) {
          this.state.selectedRouteId = targetRoute.id;
          const totalKm = calculateRouteLengthKm(targetRoute.waypoints);
          this.state.ambulance.totalDistanceKm = totalKm;
          this.state.stats.totalDistanceKm = totalKm;
          this.state.state = 'PLANNED';
          this.logEvent(
            'AI_OPTIMIZATION',
            'AI_CORE',
            `Selected ${targetRoute.name}. Estimated travel time: ${Math.round(targetRoute.normalTravelTimeSec / 60)}m (Cost: ${targetRoute.cost}).`
          );
          const newInsights = getInsightsForStateChange(oldState, 'PLANNED', null);
          this.state.insights = [...newInsights, ...this.state.insights];
        }
        break;
      }

      case 'ACTIVATE_CORRIDOR': {
        if (this.state.state === 'PLANNED' || this.state.state === 'ANALYZING' || this.state.state === 'IDLE') {
          this.state.state = 'ACTIVE';
          this.state.ambulance.patientStatus = 'CRITICAL';
          this.state.ambulance.targetSpeedKmh = 48; // speed up inside corridor
          this.state.trafficRedirectedPercent = 42;
          this.logEvent(
            'ACTION',
            'OPERATOR',
            'GREEN-WAVE EMERGENCY CORRIDOR ACTIVATED. Signal preemption broadcast engaged.',
            'Emergency corridor activated. Priority green signals broadcasted.'
          );
          const newInsights = getInsightsForStateChange(oldState, 'ACTIVE', null);
          this.state.insights = [...newInsights, ...this.state.insights];
        }
        break;
      }

      case 'ABORT_CORRIDOR': {
        this.state.state = 'ABORTED';
        this.state.ambulance.targetSpeedKmh = 28;
        this.state.ambulance.patientStatus = 'STANDBY';
        this.state.trafficRedirectedPercent = 0;
        this.state.signals = restoreAllSignals(this.state.signals);
        this.state.demoMode.isRunning = false;
        this.logEvent(
          'OVERRIDE',
          'OPERATOR',
          `HUMAN OVERRIDE: Emergency corridor aborted by operator. ${action.reason || 'Safety clearance reset.'}`,
          'Emergency corridor aborted. Signals restored.'
        );
        const newInsights = getInsightsForStateChange(oldState, 'ABORTED', null);
        this.state.insights = [...newInsights, ...this.state.insights];
        break;
      }

      case 'RESET_SIMULATION': {
        const demoWasRunning = this.state.demoMode.isRunning;
        this.state = this.createInitialState();
        if (demoWasRunning) {
          this.state.demoMode.isRunning = false;
        }
        this.logEvent(
          'INFO',
          'OPERATOR',
          'Simulation reset to default city baseline operations.'
        );
        break;
      }

      case 'TOGGLE_SIGNAL_FAULT': {
        const sig = this.state.signals.find((s) => s.id === action.signalId);
        if (sig) {
          sig.isFaulty = !sig.isFaulty;
          if (sig.isFaulty) {
            sig.lamp = 'FAULT';
            sig.mode = 'FAULT';
            this.logEvent(
              'ALERT',
              'SIGNAL_CONTROLLER',
              `FAULT INJECTED at intersection ${sig.id} (${sig.name}). Signal excluded from green-wave.`,
              `Signal ${sig.id} is in FAULT state.`
            );
            this.state.insights.unshift(
              createInsight(
                `Signal ${sig.id} entered FAULT mode. Traffic controllers routing around manual priority.`,
                'SAFETY',
                'warning'
              )
            );
          } else {
            sig.lamp = 'RED';
            sig.mode = 'NORMAL';
            this.logEvent(
              'INFO',
              'SIGNAL_CONTROLLER',
              `Intersection ${sig.id} (${sig.name}) fault cleared. Restored to network.`
            );
          }
        }
        break;
      }

      case 'SET_SPEED_MULTIPLIER': {
        this.state.speedMultiplier = Math.max(0.5, Math.min(8.0, action.multiplier));
        break;
      }

      case 'START_DEMO': {
        this.state = this.createInitialState();
        this.state.demoMode = {
          isRunning: true,
          isPaused: false,
          currentStepIndex: 0,
          stepTimeRemainingSec: DEMO_TIMELINE[0]?.durationSec || 3,
        };
        this.logEvent(
          'ACTION',
          'AI_CORE',
          'Demo Mode initiated: Automating end-to-end green-wave corridor scenario.',
          'Demo mode started.'
        );
        break;
      }

      case 'PAUSE_DEMO': {
        if (this.state.demoMode.isRunning) {
          this.state.demoMode.isPaused = true;
          this.logEvent('INFO', 'OPERATOR', 'Demo Mode paused.');
        }
        break;
      }

      case 'RESUME_DEMO': {
        if (this.state.demoMode.isRunning) {
          this.state.demoMode.isPaused = false;
          this.logEvent('INFO', 'OPERATOR', 'Demo Mode resumed.');
        }
        break;
      }

      case 'SKIP_DEMO_STEP': {
        if (this.state.demoMode.isRunning) {
          this.advanceDemoStep();
        }
        break;
      }

      case 'RESET_DEMO': {
        this.state = this.createInitialState();
        break;
      }
    }

    this.notify();
    return this.getState();
  }

  private advanceDemoStep(): void {
    const nextIndex = this.state.demoMode.currentStepIndex + 1;
    if (nextIndex >= DEMO_TIMELINE.length) {
      this.state.demoMode.isRunning = false;
      this.logEvent('INFO', 'AI_CORE', 'Demo Mode scenario completed.');
      return;
    }

    const nextStep = DEMO_TIMELINE[nextIndex]!;
    this.state.demoMode.currentStepIndex = nextIndex;
    this.state.demoMode.stepTimeRemainingSec = nextStep.durationSec;

    if (nextStep.triggerAction) {
      if (nextStep.triggerAction.type === 'SELECT_ROUTE') {
        this.dispatch({
          type: 'SELECT_ROUTE',
          routeId: nextStep.triggerAction.routeId || 'route_b',
        });
      } else if (nextStep.triggerAction.type === 'START_ANALYSIS') {
        this.dispatch({ type: 'START_ANALYSIS' });
      } else if (nextStep.triggerAction.type === 'ACTIVATE_CORRIDOR') {
        this.dispatch({ type: 'ACTIVATE_CORRIDOR' });
      }
    }
  }

  public tick(dtRaw: number): SimulationState {
    const dt = dtRaw * this.state.speedMultiplier;
    this.state.simTimeSec += dt;

    // 1. Advance Demo Mode runner if active
    if (this.state.demoMode.isRunning && !this.state.demoMode.isPaused) {
      this.state.demoMode.stepTimeRemainingSec -= dt;
      if (this.state.demoMode.stepTimeRemainingSec <= 0) {
        this.advanceDemoStep();
      }
    }

    // 2. Determine current active route waypoints
    const selectedRoute =
      this.state.routes.find((r) => r.id === this.state.selectedRouteId) ||
      this.state.routes[0]!;
    const waypoints = selectedRoute.waypoints;

    // 3. Update Ambulance physics / progress
    const isCorridorActive = this.state.state === 'ACTIVE';

    if (isCorridorActive) {
      this.state.stats.missionDurationSec += dt;

      // Check for approaching signal faults that slow ambulance
      const approachingFault = this.state.signals.find(
        (s) => s.isFaulty && s.id === this.state.currentSignalApproachingId
      );

      const maxSpeed = approachingFault ? 20 : 48; // 48 km/h in corridor, 20 km/h if manual hazard/fault
      // Smoothly accelerate/decelerate speed
      this.state.ambulance.speedKmh +=
        (maxSpeed - this.state.ambulance.speedKmh) * Math.min(1, dt * 1.5);

      // Advance route progress
      const speedKmSec = this.state.ambulance.speedKmh / 3600;
      const progressDelta = (speedKmSec * dt) / Math.max(0.1, this.state.ambulance.totalDistanceKm);
      const currentProgRatio = this.state.ambulance.progressPercent / 100;
      const nextProgRatio = Math.min(1.0, currentProgRatio + progressDelta * 2.8);

      const interp = interpolateRouteProgress(waypoints, nextProgRatio);
      this.state.ambulance.currentPos = interp.position;
      this.state.ambulance.heading = interp.heading;
      this.state.ambulance.progressPercent = interp.totalProgressPercent;
      this.state.ambulance.distanceCoveredKm = interp.distanceCoveredKm;

      // Dynamic live ETAs
      const remainingRatio = 1 - nextProgRatio;
      this.state.ambulance.etaWithAiSec = Math.max(0, Math.round(720 * remainingRatio));
      this.state.ambulance.etaWithoutAiSec = Math.max(0, Math.round(1080 * remainingRatio));
      this.state.stats.currentEtaWithAiSec = this.state.ambulance.etaWithAiSec;
      this.state.stats.currentEtaWithoutAiSec = this.state.ambulance.etaWithoutAiSec;

      // Calculate time saved & percent
      const timeSavedSec = Math.max(0, this.state.ambulance.etaWithoutAiSec - this.state.ambulance.etaWithAiSec);
      this.state.stats.timeSavedSeconds = Math.round(timeSavedSec);
      this.state.stats.timeSavedPercent = Math.round((1 - 720 / 1080) * 100);

      // Check mission completion
      if (nextProgRatio >= 0.999) {
        this.state.state = 'COMPLETED';
        this.state.ambulance.progressPercent = 100;
        this.state.ambulance.speedKmh = 0;
        this.state.ambulance.targetSpeedKmh = 0;
        this.state.signals = restoreAllSignals(this.state.signals);
        this.state.trafficRedirectedPercent = 0;
        this.logEvent(
          'INFO',
          'HOSPITAL_ED',
          'Victoria Hospital Trauma ICU: AMB-001 arrived safely. Patient transfer in progress.',
          'Ambulance has arrived at hospital trauma center.'
        );
        const newInsights = getInsightsForStateChange('ACTIVE', 'COMPLETED', null);
        this.state.insights = [...newInsights, ...this.state.insights];
      }
    } else {
      // Idle or planning state: keep ambulance at start
      if (this.state.state === 'IDLE' || this.state.state === 'ANALYZING' || this.state.state === 'PLANNED') {
        const startPoint = waypoints[0] || { lat: 12.9815, lng: 77.6185 };
        this.state.ambulance.currentPos = startPoint;
        this.state.ambulance.progressPercent = 0;
        this.state.ambulance.speedKmh = 0;
      }
    }

    // 4. Update Signals
    const signalResult = updateSignals(
      this.state.signals,
      isCorridorActive,
      this.state.ambulance.currentPos,
      this.state.ambulance.speedKmh,
      dt
    );
    this.state.signals = signalResult.updatedSignals;
    this.state.activeSignalsControlledCount = signalResult.activeControlledCount;
    this.state.currentSignalApproachingId = signalResult.currentApproachingSignal?.id || null;
    this.state.nextSignalApproachingId = signalResult.nextApproachingSignal?.id || null;

    // Count coordinated signals
    const coordCount = this.state.signals.filter((s) => s.mode === 'CORRIDOR_GREEN' || s.mode === 'RESTORING').length;
    this.state.stats.signalsCoordinatedCount = Math.max(this.state.stats.signalsCoordinatedCount, coordCount);

    // Emit any signal events
    for (const evt of signalResult.eventsToEmit) {
      this.logEvent(evt.type, 'SIGNAL_CONTROLLER', evt.message);
    }

    // 5. Update Ambient Traffic
    this.state.ambientVehicles = updateAmbientVehicles(
      this.state.ambientVehicles,
      isCorridorActive,
      this.state.ambulance.currentPos,
      dt
    );

    this.notify();
    return this.getState();
  }
}

// Export singleton instance
export const simulationEngine = new SimulationEngine();
