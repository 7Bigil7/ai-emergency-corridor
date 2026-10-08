import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Radio, Clock, ArrowRight, TrendingUp } from 'lucide-react';

export const CorridorStatus: React.FC = () => {
  const { sim } = useSimStore();
  const { stats, signals, currentSignalApproachingId, nextSignalApproachingId, activeSignalsControlledCount, trafficRedirectedPercent, state } = sim;

  const currentSignal = signals.find((s) => s.id === currentSignalApproachingId);
  const nextSignal = signals.find((s) => s.id === nextSignalApproachingId);

  const formatMinSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3.5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            CORRIDOR TELEMETRY
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
          {activeSignalsControlledCount} / 7 SIGNALS LOCKED
        </span>
      </div>

      {/* Signal Synchronization Progression */}
      <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#8A919E] uppercase">Current Intersection:</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {currentSignal ? `${currentSignal.id} - ${currentSignal.name}` : 'Entering Grid'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#8A919E] uppercase">Next Intersection:</span>
          <span className="font-semibold text-sky-300 flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-sky-400" />
            {nextSignal ? `${nextSignal.id} - ${nextSignal.name}` : 'Trauma Center Gate'}
          </span>
        </div>
      </div>

      {/* Grid of Micro-Metrics */}
      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-[#8A919E] uppercase">Traffic Redirected</span>
          <span className="text-base font-bold text-emerald-400">
            {trafficRedirectedPercent}%
          </span>
          <span className="text-[9px] text-slate-500">Cross-traffic buffer active</span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] text-[#8A919E] uppercase">Green-Wave Sync</span>
          <span className="text-base font-bold text-sky-400">
            {state === 'ACTIVE' ? '100% Phase Lock' : 'Standby Grid'}
          </span>
          <span className="text-[9px] text-slate-500">Max 3 Preempted Ahead</span>
        </div>
      </div>

      {/* ETA Comparison Card */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-950/40 via-black/50 to-black/40 border border-emerald-500/30 font-mono flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-[11px]">AI Impact Delta</span>
          </div>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
            -{stats.timeSavedPercent}% TIME REDUCTION
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
          <div>
            <span className="text-[10px] text-slate-400 block">Baseline (No AI)</span>
            <span className="text-xs font-bold text-rose-400 line-through">
              {formatMinSec(stats.currentEtaWithoutAiSec)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Corridor ETA (AI)</span>
            <span className="text-sm font-black text-emerald-400">
              {formatMinSec(stats.currentEtaWithAiSec)}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-emerald-300/90 font-semibold text-center pt-1 border-t border-dashed border-white/10 flex items-center justify-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Estimated Time Saved: ~{formatMinSec(stats.timeSavedSeconds)}</span>
        </div>
      </div>
    </div>
  );
};
