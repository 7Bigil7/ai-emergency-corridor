import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Gauge, Clock, ShieldCheck, Zap, Activity } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { sim } = useSimStore();
  const { stats, state } = sim;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col gap-2 border border-white/10 h-[190px] lg:h-[210px] justify-between font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            MISSION METRICS
          </span>
        </div>
        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          REAL-TIME ENGINE
        </span>
      </div>

      {/* Metrics 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 flex-1 pt-1">
        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] text-[#8A919E] uppercase">
            <Clock className="w-3 h-3 text-sky-400" />
            <span>Mission Time</span>
          </div>
          <span className="text-sm font-bold text-white mt-0.5">
            {formatSeconds(stats.missionDurationSec)}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] text-[#8A919E] uppercase">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Signals Synced</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 mt-0.5">
            {stats.signalsCoordinatedCount} / 7
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] text-[#8A919E] uppercase">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>Avg Corridor Spd</span>
          </div>
          <span className="text-sm font-bold text-amber-300 mt-0.5">
            {state === 'ACTIVE' ? '48 km/h' : '28 km/h'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-emerald-500/20 flex flex-col justify-center bg-emerald-950/20">
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>AI Time Saved</span>
          </div>
          <span className="text-sm font-black text-emerald-300 mt-0.5">
            ~6.0 min (34%)
          </span>
        </div>
      </div>
    </div>
  );
};
