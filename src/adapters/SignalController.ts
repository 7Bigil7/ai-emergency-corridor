/**
 * SignalController Adapter
 *
 * PRODUCTION REPLACEMENT:
 * In a production municipal deployment, this adapter would interface with:
 * 1. SCATS (Sydney Coordinated Adaptive Traffic System) / SCOOT / NTCIP 1202 protocol controllers
 * 2. Secure TLS-encrypted municipal field gateway with hardware fail-safe watchdog timeouts
 *
 * CURRENT IMPLEMENTATION:
 * Dispatches simulated signal lock, yellow phase transitions, and green-wave holding commands
 * to the in-memory hardware signal simulation.
 */

import { TrafficSignal } from '../engine/types';

export class SignalController {
  /**
   * Request signal preemption priority
   */
  public requestPreemption(signalId: string, holdDurationSec: number): {
    acknowledged: boolean;
    signalId: string;
    lockExpiresIn: number;
  } {
    return {
      acknowledged: true,
      signalId,
      lockExpiresIn: holdDurationSec,
    };
  }

  /**
   * Safe restoration command after clearance
   */
  public releasePreemption(_signalId: string): { restored: boolean } {
    return {
      restored: true,
    };
  }

  /**
   * Formats the lamp visual status for accessibility & hardware compliance
   */
  public getAriaDescription(signal: TrafficSignal): string {
    if (signal.isFaulty) {
      return `Intersection ${signal.name} is in FAULT mode. Manual traffic control active.`;
    }
    const modeDesc =
      signal.mode === 'CORRIDOR_GREEN'
        ? 'Priority Green Corridor Wave Active'
        : signal.mode === 'PREPARING_GREEN'
        ? 'Preparing Green Wave (3s Yellow safety phase)'
        : 'Standard Civil Traffic Cycle';

    return `Signal ${signal.id} at ${signal.name}. Current Lamp: ${signal.lamp}. Mode: ${modeDesc}.`;
  }
}

export const signalController = new SignalController();
