import { create } from 'zustand';
import { SimulationState, SimAction } from '../engine/types';
import { simulationEngine } from '../engine/simulation';

export type NavTab = 'overview' | 'map' | 'corridors' | 'fleet' | 'signals' | 'incidents' | 'audit' | 'settings';

interface SimStoreState {
  sim: SimulationState;
  activeNavTab: NavTab;
  setActiveNavTab: (tab: NavTab) => void;
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
    activeNavTab: 'overview',
    setActiveNavTab: (tab: NavTab) => {
      set({ activeNavTab: tab });
    },
    dispatch: (action: SimAction) => {
      simulationEngine.dispatch(action);
    },
    setSimState: (newState: SimulationState) => {
      set({ sim: newState });
    },
  };
});
