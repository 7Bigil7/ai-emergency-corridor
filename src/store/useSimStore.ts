import { create } from 'zustand';
import { SimulationState, SimAction } from '../engine/types';
import { simulationEngine } from '../engine/simulation';

interface SimStoreState {
  sim: SimulationState;
  dispatch: (action: SimAction) => void;
  setSimState: (newState: SimulationState) => void;
}

export const useSimStore = create<SimStoreState>((set) => {
  // Initialize with engine state
  const initialState = simulationEngine.getState();

  // Subscribe to engine state changes
  simulationEngine.subscribe((updatedSim) => {
    set({ sim: { ...updatedSim } });
  });

  return {
    sim: initialState,
    dispatch: (action: SimAction) => {
      simulationEngine.dispatch(action);
    },
    setSimState: (newState: SimulationState) => {
      set({ sim: newState });
    },
  };
});
