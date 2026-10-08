import { describe, it, expect } from 'vitest';
import {
  getNormalCycleLamp,
  updateSignals,
  restoreAllSignals,
  TOTAL_CYCLE_SEC,
} from '../signalPlanner';
import { INITIAL_SIGNALS } from '../../data/signals';

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

  it('engages 3-second yellow transition when red signal is triggered by approaching ambulance', () => {
    const signals = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    // S01 is at [12.9795, 77.6105], set lamp to RED
    signals[0].lamp = 'RED';
    signals[0].mode = 'NORMAL';

    const ambulancePos = { lat: 12.9797, lng: 77.6110 }; // very close, within 25s ETA
    const res = updateSignals(signals, true, ambulancePos, 48, 0.1);

    const s01 = res.updatedSignals.find((s) => s.id === 'S01')!;
    expect(s01.mode).toBe('PREPARING_GREEN');
    expect(s01.lamp).toBe('YELLOW');
    expect(s01.yellowCountdownRemaining).toBe(3);
  });

  it('switches to GREEN after 3s yellow preparation countdown finishes', () => {
    const signals = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    signals[0].lamp = 'YELLOW';
    signals[0].mode = 'PREPARING_GREEN';
    signals[0].yellowCountdownRemaining = 0.5;

    const ambulancePos = { lat: 12.9797, lng: 77.6110 };
    const res = updateSignals(signals, true, ambulancePos, 48, 0.6);

    const s01 = res.updatedSignals.find((s) => s.id === 'S01')!;
    expect(s01.mode).toBe('CORRIDOR_GREEN');
    expect(s01.lamp).toBe('GREEN');
  });

  it('restores all signals to normal cycles upon restoreAllSignals() call', () => {
    const signals = JSON.parse(JSON.stringify(INITIAL_SIGNALS));
    signals[0].mode = 'CORRIDOR_GREEN';
    signals[0].lamp = 'GREEN';

    const restored = restoreAllSignals(signals);
    expect(restored[0]!.mode).toBe('NORMAL');
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
