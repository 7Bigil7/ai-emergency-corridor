import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { DEMO_TIMELINE } from '../data/demoScript';
import { Play, Pause, FastForward, RotateCcw, Sparkles, Gauge } from 'lucide-react';

export const DemoMode: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { demoMode, speedMultiplier } = sim;

  const currentStep = DEMO_TIMELINE[demoMode.currentStepIndex];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0E1013]/95 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-wrap items-center gap-3 font-mono text-xs max-w-[95vw]">
      {/* Demo Pill & Title */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <div className="p-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white uppercase text-[11px]">
            DEMO SCENARIO
          </span>
          <span className="text-[9px] text-purple-300">
            {demoMode.isRunning
              ? `Step ${demoMode.currentStepIndex + 1}/${DEMO_TIMELINE.length}: ${currentStep?.actionName || ''}`
              : 'End-to-End Simulation'}
          </span>
        </div>
      </div>

      {/* Main Play / Pause / Start Button */}
      {!demoMode.isRunning ? (
        <button
          onClick={() => dispatch({ type: 'START_DEMO' })}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(43,217,124,0.4)] transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>START DEMO</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          {demoMode.isPaused ? (
            <button
              onClick={() => dispatch({ type: 'RESUME_DEMO' })}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 font-bold"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'PAUSE_DEMO' })}
              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 font-bold"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={() => dispatch({ type: 'SKIP_DEMO_STEP' })}
            className="px-2 py-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1"
            title="Skip to next demo milestone"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip</span>
          </button>
        </div>
      )}

      {/* Speed Controls: 1x, 2x, 4x */}
      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
        <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
        {([1, 2, 4] as const).map((spd) => (
          <button
            key={spd}
            onClick={() => dispatch({ type: 'SET_SPEED_MULTIPLIER', multiplier: spd })}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              speedMultiplier === spd
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(43,217,124,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {spd}x
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
        className="p-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
        title="Reset simulation"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
