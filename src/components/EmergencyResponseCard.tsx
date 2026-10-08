import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Square, Sparkles } from 'lucide-react';

export const EmergencyResponseCard: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { state, ambulance, stats } = sim;

  const isRunning = state === 'ACTIVE';

  // Computed metrics
  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const etaFormatted = `${etaMin} min ${etaSec < 10 ? '0' : ''}${etaSec} sec`;

  const timeSavedSec = stats.timeSavedSeconds > 0 ? stats.timeSavedSeconds : 191; // 3m 11s
  const savedMin = Math.floor(timeSavedSec / 60);
  const savedSec = timeSavedSec % 60;
  const savedFormatted = `${savedMin} min ${savedSec < 10 ? '0' : ''}${savedSec} sec`;

  const handleToggle = () => {
    if (isRunning) {
      dispatch({ type: 'ABORT_CORRIDOR' });
    } else {
      dispatch({ type: 'ACTIVATE_CORRIDOR' });
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/90 border border-white/[0.08] p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Siren className="w-4 h-4" />
          </div>
          <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
            EMERGENCY RESPONSE
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          CRITICAL
        </span>
      </div>

      {/* Hero Image & Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Realistic Ambulance Vehicle Image */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-black/60 group">
          <img
            src="/ambulance_hero.jpg"
            alt="Emergency Ambulance AMB-001"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-black/70 border border-red-500/40 text-[9px] font-mono font-bold text-red-400">
              AMB-001
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400">
              PRIORITY 1
            </span>
          </div>
        </div>

        {/* Telemetry Key-Values */}
        <div className="flex flex-col justify-between h-full py-1 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Ambulance ID</span>
            <span className="text-white font-bold text-[11px]">{ambulance.callSign || 'AMB-001'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Emergency Type</span>
            <span className="text-red-400 font-bold text-[11px]">Medical Emergency</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Current Location</span>
            <span className="text-white font-medium text-[11px] truncate max-w-[120px]" title="Indiranagar, Bengaluru">
              Indiranagar, Bengaluru
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Destination</span>
            <span className="text-cyan-300 font-bold text-[11px]">Victoria Hospital</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Distance</span>
            <span className="text-white font-bold text-[11px]">
              {ambulance.totalDistanceKm.toFixed(1)} km
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
        {/* ETA (AI Optimized) */}
        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            ETA (AI Optimized)
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              {state === 'COMPLETED' ? '0m 00s' : etaFormatted}
            </div>
            <div className="text-[9px] text-slate-500 line-through mt-0.5">
              8 min 42 sec
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            Time Saved
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              {savedFormatted}
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-0.5">
              <span>↓ 36% faster</span>
            </div>
          </div>
        </div>

        {/* Signals Coordinated */}
        <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            Signals Coordinated
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              7
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              on this route
            </div>
          </div>
        </div>
      </div>

      {/* Big Action Button */}
      <button
        onClick={handleToggle}
        className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-lg ${
          isRunning
            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/50'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50'
        }`}
      >
        {isRunning ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            <span>STOP EMERGENCY CORRIDOR</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>ACTIVATE EMERGENCY CORRIDOR</span>
          </>
        )}
      </button>
    </div>
  );
};
