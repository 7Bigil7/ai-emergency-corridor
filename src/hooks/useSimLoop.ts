import { useEffect, useRef } from 'react';
import { simulationEngine } from '../engine/simulation';

export function useSimLoop(enabled: boolean = true) {
  const lastTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let isRunning = true;
    lastTimeRef.current = performance.now();

    // 10Hz fixed physics step with requestAnimationFrame interpolation
    const TICK_INTERVAL_MS = 100; // 10Hz
    let accumulatedMs = 0;

    const frameLoop = (now: number) => {
      if (!isRunning) return;

      const rawDeltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Clamp delta to avoid huge jumps on tab switch
      const deltaMs = Math.min(rawDeltaMs, 250);
      accumulatedMs += deltaMs;

      while (accumulatedMs >= TICK_INTERVAL_MS) {
        simulationEngine.tick(TICK_INTERVAL_MS / 1000);
        accumulatedMs -= TICK_INTERVAL_MS;
      }

      requestRef.current = requestAnimationFrame(frameLoop);
    };

    requestRef.current = requestAnimationFrame(frameLoop);

    return () => {
      isRunning = false;
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [enabled]);
}
