import { describe, it, expect } from 'vitest';
import {
  getNormalCycleLamp,
  updateSignals,
  restoreAllSignals,
  TOTAL_CYCLE_SEC,
} from '../signalPlanner';
import { INITIAL_SIGNALS } from '../../data/signals';
import { TrafficSignal } from '../types';

describe('Signal Planner & Green-Wave Controller', () => {
  it('correctly maps normal cycle lamps: Green (0-25s), Yellow (25-28s), Red (28-56s)', () => {
    expect(getNormalCycleLamp(10)).toBe('GREEN');
    expect(getNormalCycleLamp(24.9)).toBe('GREEN');
    expect(getNormalCycleLamp(25.5)).toBe('YELLOW');
    expect(getNormalCycleLamp(27.9)).toBe('YELLOW');
    expect(getNormalCycleLamp(28.1)).toBe('RED');
    expect(getNormalCycleLamp(55.9)).toBe('RED');
    expect(getNormalCycleLamp(TOTAL_CYCLE_SEC + 5)).toBe('GREEN');
  });

  // Requirement: signals never go GREEN without YELLOW first
  it('signals never go GREEN without YELLOW first when preempted by approaching ambulance', () => {
    const signals: TrafficSignal[] = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    // Explicitly set S01 to RED in normal cycle
    signals[0]!.lamp = 'RED';
    signals[0]!.mode = 'NORMAL';

    const ambulancePos = { lat: 12.9797, lng: 77.6110 }; // Near S01
    // First tick when corridor is active
    const tick1 = updateSignals(signals, true, ambulancePos, 48, 0.1);
    const s01AfterTrigger = tick1.updatedSignals.find((s) => s.id === 'S01')!;

    // Must be in PREPARING_GREEN with YELLOW lamp, NOT GREEN!
    expect(s01AfterTrigger.mode).toBe('PREPARING_GREEN');
    expect(s01AfterTrigger.lamp).toBe('YELLOW');
    expect(s01AfterTrigger.yellowCountdownRemaining).toBeGreaterThan(0);

    // Advance halfway through yellow (1.5s): still YELLOW
    const tick2 = updateSignals(tick1.updatedSignals, true, ambulancePos, 48, 1.5);
    const s01MidYellow = tick2.updatedSignals.find((s) => s.id === 'S01')!;
    expect(s01MidYellow.lamp).toBe('YELLOW');

    // Advance past remaining yellow (1.6s): now GREEN
    const tick3 = updateSignals(tick2.updatedSignals, true, ambulancePos, 48, 1.6);
    const s01Green = tick3.updatedSignals.find((s) => s.id === 'S01')!;
    expect(s01Green.lamp).toBe('GREEN');
    expect(s01Green.mode).toBe('CORRIDOR_GREEN');
  });

  // Requirement: all signals restored after completion
  it('all signals restored to normal civil cycling after corridor completion', () => {
    const signals: TrafficSignal[] = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    // Simulate active corridor with several signals locked in green
    signals[0]!.mode = 'CORRIDOR_GREEN';
    signals[0]!.lamp = 'GREEN';
    signals[1]!.mode = 'CORRIDOR_GREEN';
    signals[1]!.lamp = 'GREEN';
    signals[2]!.mode = 'PREPARING_GREEN';
    signals[2]!.lamp = 'YELLOW';

    const restored = restoreAllSignals(signals);

    // All signals must be back to NORMAL mode
    expect(restored.every((s) => s.mode === 'NORMAL')).toBe(true);
    expect(restored.every((s) => s.corridorHoldRemaining === 0)).toBe(true);
    expect(restored.every((s) => s.yellowCountdownRemaining === 0)).toBe(true);
  });

  it('preserves FAULT state on faulty signals and excludes from green wave', () => {
    const signals = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    signals[0].isFaulty = true;

    const ambulancePos = { lat: 12.9795, lng: 77.6105 };
    const res = updateSignals(signals, true, ambulancePos, 48, 0.1);

    const s01 = res.updatedSignals.find((s) => s.id === 'S01')!;
    expect(s01.lamp).toBe('FAULT');
    expect(s01.mode).toBe('FAULT');
  });
});
