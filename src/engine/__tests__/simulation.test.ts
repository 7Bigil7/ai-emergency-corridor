import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '../simulation';

describe('Simulation Engine State Machine & Dispatcher', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    engine = new SimulationEngine();
  });

  it('initializes in IDLE state with default values', () => {
    const state = engine.getState();
    expect(state.state).toBe('IDLE');
    expect(state.ambulance.id).toBe('AMB-001');
    expect(state.ambulance.patientStatus).toBe('STANDBY');
    expect(state.selectedRouteId).toBe('route_b');
    expect(state.signals.length).toBe(7);
  });

  it('transitions from IDLE -> ANALYZING upon START_ANALYSIS', () => {
    const state = engine.dispatch({ type: 'START_ANALYSIS' });
    expect(state.state).toBe('ANALYZING');
    expect(state.ambulance.patientStatus).toBe('CRITICAL');
  });

  it('transitions to ACTIVE upon ACTIVATE_CORRIDOR', () => {
    engine.dispatch({ type: 'START_ANALYSIS' });
    const state = engine.dispatch({ type: 'ACTIVATE_CORRIDOR' });
    expect(state.state).toBe('ACTIVE');
    expect(state.ambulance.targetSpeedKmh).toBe(48);
  });

  it('restores signals and state on ABORT_CORRIDOR human override', () => {
    engine.dispatch({ type: 'ACTIVATE_CORRIDOR' });
    const state = engine.dispatch({ type: 'ABORT_CORRIDOR', reason: 'Operator Safety Abort' });
    expect(state.state).toBe('ABORTED');
    expect(state.signals.every((s) => s.mode === 'NORMAL' || s.mode === 'FAULT')).toBe(true);
  });

  it('allows toggling FAULT state on individual signals', () => {
    engine.dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: 'S02' });
    let sig = engine.getState().signals.find((s) => s.id === 'S02');
    expect(sig?.isFaulty).toBe(true);
    expect(sig?.lamp).toBe('FAULT');

    // Toggle off
    engine.dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: 'S02' });
    sig = engine.getState().signals.find((s) => s.id === 'S02');
    expect(sig?.isFaulty).toBe(false);
  });

  it('ticks physics and advances ambulance position when active', () => {
    engine.dispatch({ type: 'ACTIVATE_CORRIDOR' });

    // Tick for 5 seconds
    for (let i = 0; i < 50; i++) {
      engine.tick(0.1);
    }

    const nextState = engine.getState();
    expect(nextState.ambulance.progressPercent).toBeGreaterThan(0);
    expect(nextState.ambulance.speedKmh).toBeGreaterThan(0);
  });
});
