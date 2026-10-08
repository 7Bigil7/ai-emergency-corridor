import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Navigation, Radio, Car, Clock } from 'lucide-react';

export const CorridorStatistics: React.FC = () => {
  const { sim } = useSimStore();
  const { stats, ambulance } = sim;

  // 4 metrics
  const corridorKm = ambulance.totalDistanceKm.toFixed(1);
  const signalsCount = 7;
  const trafficDensity = '42%';
  const timeSavedSec = stats.timeSavedSeconds > 0 ? stats.timeSavedSeconds : 191;
  const savedMin = Math.floor(timeSavedSec / 60);
  const savedSec = timeSavedSec % 60;
  const savedFormatted = `${savedMin}m ${savedSec < 10 ? '0' : ''}${savedSec}s`;

  const progressPercent = Math.min(100, Math.max(0, ambulance.progressPercent));

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/90 border border-white/[0.08] p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md h-full justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
            CORRIDOR STATISTICS
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Live
        </span>
      </div>

      {/* 4 Metric Badges in 4-column layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {/* Metric 1 */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{corridorKm} km</span>
            <span className="text-[9px] text-slate-400">Corridor Length</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{signalsCount}</span>
            <span className="text-[9px] text-slate-400">Signals Controlled</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Car className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{trafficDensity}</span>
            <span className="text-[9px] text-slate-400">Traffic Density</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/[0.06]">
          <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white">{savedFormatted}</span>
            <span className="text-[9px] text-slate-400">Time Saved</span>
          </div>
        </div>
      </div>

      {/* Ambulance Linear Progress Track */}
      <div className="flex flex-col gap-1.5 pt-1 font-mono">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Ambulance Progress
        </span>
        <div className="relative w-full pt-3 pb-1">
          {/* Track Line */}
          <div className="w-full h-1 bg-slate-800 rounded-full relative">
            {/* Active progress fill */}
            <div
              className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#38BDF8]"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Intermediate waypoints */}
            {[0, 20, 40, 60, 80, 100].map((pt) => (
              <div
                key={pt}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0E1117] border border-cyan-400/60"
                style={{ left: `${pt}%` }}
              />
            ))}

            {/* Moving Ambulance Vehicle Icon */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300 z-10"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white text-white flex items-center justify-center shadow-[0_0_12px_#EF4444] text-[11px]">
                🚑
              </div>
            </div>
          </div>

          {/* Start and Destination Labels */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 font-mono">
            <div>
              <span className="text-slate-500">Start </span>
              <span className="text-white font-bold">Indiranagar</span>
            </div>
            <div>
              <span className="text-slate-500">Destination </span>
              <span className="text-cyan-300 font-bold">Victoria Hospital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
