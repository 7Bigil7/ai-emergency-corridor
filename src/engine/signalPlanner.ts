import { TrafficSignal, SignalLamp, LatLng } from './types';
import { calculateDistanceKm } from './routeOptimizer';

export const NORMAL_GREEN_SEC = 25;
export const NORMAL_YELLOW_SEC = 3;
export const NORMAL_RED_SEC = 28;
export const TOTAL_CYCLE_SEC = NORMAL_GREEN_SEC + NORMAL_YELLOW_SEC + NORMAL_RED_SEC; // 56s

export const PREPARE_YELLOW_DURATION_SEC = 3;
export const CORRIDOR_CLEARANCE_HOLD_SEC = 3;
export const LOOKAHEAD_ETA_THRESHOLD_SEC = 25;
export const MAX_CORRIDOR_SIGNALS = 3;

/**
 * Computes normal signal lamp state based on elapsed cycle time
 */
export function getNormalCycleLamp(cycleTime: number): SignalLamp {
  const norm = ((cycleTime % TOTAL_CYCLE_SEC) + TOTAL_CYCLE_SEC) % TOTAL_CYCLE_SEC;
  if (norm < NORMAL_GREEN_SEC) {
    return 'GREEN';
  } else if (norm < NORMAL_GREEN_SEC + NORMAL_YELLOW_SEC) {
    return 'YELLOW';
  } else {
    return 'RED';
  }
}

export interface SignalUpdateResult {
  updatedSignals: TrafficSignal[];
  activeControlledCount: number;
  currentApproachingSignal: TrafficSignal | null;
  nextApproachingSignal: TrafficSignal | null;
  eventsToEmit: Array<{
    type: 'SIGNAL' | 'ALERT';
    message: string;
  }>;
}

/**
 * Updates all signal states for a simulation tick `dt` seconds
 */
export function updateSignals(
  signals: TrafficSignal[],
  corridorActive: boolean,
  ambulancePos: LatLng,
  ambulanceSpeedKmh: number,
  dt: number
): SignalUpdateResult {
  const eventsToEmit: Array<{ type: 'SIGNAL' | 'ALERT'; message: string }> = [];

  // 1. Calculate ambulance distance and ETA to each signal
  // Convert speed from km/h to m/s, or km/s
  const speedKmSec = Math.max(ambulanceSpeedKmh, 10) / 3600;

  interface SignalDistanceInfo {
    signal: TrafficSignal;
    distKm: number;
    etaSec: number;
    isAhead: boolean;
  }

  const signalInfos: SignalDistanceInfo[] = signals.map((sig) => {
    const distKm = calculateDistanceKm(ambulancePos, sig.location);
    const etaSec = distKm / speedKmSec;
    return {
      signal: sig,
      distKm,
      etaSec,
      isAhead: true, // will determine based on route progress
    };
  });

  // Find approaching signals ahead of ambulance that haven't been passed
  // We identify signals with distKm < 0.035 (35m) as "at/passed"
  const upcomingSignals = signalInfos
    .filter((info) => !info.signal.isFaulty)
    .sort((a, b) => a.signal.routeIndex - b.signal.routeIndex);

  // Determine which signals qualify for green-wave lock (at most 3)
  const candidateLocks: string[] = [];
  if (corridorActive) {
    for (const info of upcomingSignals) {
      if (candidateLocks.length >= MAX_CORRIDOR_SIGNALS) break;

      // If ambulance is within 25s ETA or very close
      if (
        info.etaSec <= LOOKAHEAD_ETA_THRESHOLD_SEC ||
        info.signal.mode === 'CORRIDOR_GREEN' ||
        info.signal.mode === 'PREPARING_GREEN'
      ) {
        candidateLocks.push(info.signal.id);
      }
    }
  }

  let activeControlledCount = 0;
  let currentApproachingSignal: TrafficSignal | null = null;
  let nextApproachingSignal: TrafficSignal | null = null;

  const updatedSignals = signals.map((sig) => {
    const nextSig: TrafficSignal = { ...sig };

    // Advance background cycle timer
    nextSig.cycleTimer = (nextSig.cycleTimer + dt) % TOTAL_CYCLE_SEC;

    // Handle FAULT state
    if (nextSig.isFaulty) {
      nextSig.lamp = 'FAULT';
      nextSig.mode = 'FAULT';
      nextSig.yellowCountdownRemaining = 0;
      nextSig.corridorHoldRemaining = 0;
      return nextSig;
    }

    const distKm = calculateDistanceKm(ambulancePos, nextSig.location);
    const hasAmbulancePassed = distKm < 0.025; // within 25m

    const shouldBeControlled =
      corridorActive && candidateLocks.includes(nextSig.id);

    if (shouldBeControlled) {
      activeControlledCount++;

      if (!currentApproachingSignal) {
        currentApproachingSignal = nextSig;
      } else if (!nextApproachingSignal && nextSig.id !== currentApproachingSignal.id) {
        nextApproachingSignal = nextSig;
      }

      if (nextSig.mode === 'NORMAL' || nextSig.mode === 'RESTORING') {
        // Must transition to green safely
        if (nextSig.lamp === 'GREEN') {
          // Already green, lock immediately
          nextSig.mode = 'CORRIDOR_GREEN';
          nextSig.corridorHoldRemaining = 10;
          eventsToEmit.push({
            type: 'SIGNAL',
            message: `Intersection ${nextSig.id} (${nextSig.name}) locked in GREEN corridor wave.`,
          });
        } else {
          // It is RED: transition to 3s YELLOW first (never skip yellow)
          nextSig.mode = 'PREPARING_GREEN';
          nextSig.lamp = 'YELLOW';
          nextSig.yellowCountdownRemaining = PREPARE_YELLOW_DURATION_SEC;
          eventsToEmit.push({
            type: 'SIGNAL',
            message: `Intersection ${nextSig.id} preparing green-wave: 3s Yellow transition engaged.`,
          });
        }
      } else if (nextSig.mode === 'PREPARING_GREEN') {
        nextSig.yellowCountdownRemaining = Math.max(
          0,
          nextSig.yellowCountdownRemaining - dt
        );
        if (nextSig.yellowCountdownRemaining <= 0) {
          nextSig.mode = 'CORRIDOR_GREEN';
          nextSig.lamp = 'GREEN';
          nextSig.corridorHoldRemaining = 10;
          eventsToEmit.push({
            type: 'SIGNAL',
            message: `Intersection ${nextSig.id} (${nextSig.name}) switched to PRIORITY GREEN.`,
          });
        } else {
          nextSig.lamp = 'YELLOW';
        }
      } else if (nextSig.mode === 'CORRIDOR_GREEN') {
        nextSig.lamp = 'GREEN';
        if (hasAmbulancePassed) {
          nextSig.isCleared = true;
          // Ambulance has passed intersection, begin post-clearance countdown
          nextSig.corridorHoldRemaining = Math.max(
            0,
            nextSig.corridorHoldRemaining - dt
          );
          if (nextSig.corridorHoldRemaining <= 0) {
            nextSig.mode = 'RESTORING';
            eventsToEmit.push({
              type: 'SIGNAL',
              message: `Ambulance AMB-001 CLEARED ${nextSig.id} (${nextSig.name}) ✓. Restoring civil traffic.`,
            });
          }
        } else {
          // Keep holding until passed + 3s
          nextSig.corridorHoldRemaining = CORRIDOR_CLEARANCE_HOLD_SEC;
        }
      }
    } else {
      // Normal or restoring state
      if (nextSig.mode === 'CORRIDOR_GREEN' || nextSig.mode === 'PREPARING_GREEN') {
        nextSig.mode = 'RESTORING';
      }

      if (nextSig.mode === 'RESTORING') {
        // Rejoin normal cycle smoothly
        nextSig.mode = 'NORMAL';
        nextSig.lamp = getNormalCycleLamp(nextSig.cycleTimer + nextSig.offsetSeconds);
      } else {
        nextSig.lamp = getNormalCycleLamp(nextSig.cycleTimer + nextSig.offsetSeconds);
      }
    }

    return nextSig;
  });

  return {
    updatedSignals,
    activeControlledCount,
    currentApproachingSignal,
    nextApproachingSignal,
    eventsToEmit,
  };
}

/**
 * Restores all signals back to normal operation (e.g. on completion or abort)
 */
export function restoreAllSignals(signals: TrafficSignal[]): TrafficSignal[] {
  return signals.map((sig) => {
    if (sig.isFaulty) {
      return { ...sig, lamp: 'FAULT', mode: 'FAULT' };
    }
    const lamp = getNormalCycleLamp(sig.cycleTimer + sig.offsetSeconds);
    return {
      ...sig,
      mode: 'NORMAL',
      lamp,
      corridorHoldRemaining: 0,
      yellowCountdownRemaining: 0,
    };
  });
}
