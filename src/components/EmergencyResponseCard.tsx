import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Square, Sparkles, Heart } from 'lucide-react';
import { AmbulanceInspectorModal } from './modals/AmbulanceInspectorModal';

export const EmergencyResponseCard: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { state, ambulance, stats } = sim;
  const [showInspector, setShowInspector] = useState<boolean>(false);

  const isRunning = state === 'ACTIVE';

  // Computed metrics
  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const etaFormatted = `${etaMin}m ${etaSec < 10 ? '0' : ''}${etaSec}s`;

  const timeSavedSec = stats.timeSavedSeconds > 0 ? stats.timeSavedSeconds : 191; // 3m 11s
  const savedMin = Math.floor(timeSavedSec / 60);
  const savedSec = timeSavedSec % 60;
  const savedFormatted = `${savedMin}m ${savedSec < 10 ? '0' : ''}${savedSec}s`;

  const handleToggle = () => {
    if (isRunning) {
      dispatch({ type: 'ABORT_CORRIDOR' });
    } else {
      dispatch({ type: 'ACTIVATE_CORRIDOR' });
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/95 border border-slate-700/80 p-4 flex flex-col gap-3.5 shadow-2xl backdrop-blur-md font-sans">
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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1.5 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          PRIORITY 1 CRITICAL
        </span>
      </div>

      {/* Hero Image & Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Vehicle Image with Click to Inspect Dossier */}
        <div
          onClick={() => setShowInspector(true)}
          className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-black/60 group cursor-pointer"
          title="Click to view full patient dossier and telemetry"
        >
          <img
            src="/ambulance_hero.jpg"
            alt="Emergency Ambulance AMB-001"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 font-mono">
            <span className="px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-bold text-red-400">
              AMB-001
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-bold text-emerald-400">
              KA-01-EA-9021
            </span>
          </div>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            INSPECT ↗
          </div>
        </div>

        {/* Telemetry Key-Values */}
        <div className="flex flex-col justify-between h-full py-0.5 text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Emergency Type</span>
            <span className="text-red-400 font-bold text-[11px] flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" />
              STEMI Cardiac Alert
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Location</span>
            <span className="text-white font-medium text-[11px] truncate max-w-[120px]" title="Indiranagar, Bengaluru">
              Indiranagar Origin
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
            <span className="text-slate-400 text-[11px]">Destination</span>
            <span className="text-cyan-300 font-bold text-[11px]">Victoria Hospital</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Route Status</span>
            <span className={`text-[11px] font-bold ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isRunning ? 'Corridor Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        {/* ETA (AI Optimized) */}
        <div className="rounded-xl bg-black/50 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            ETA (AI Optimized)
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              {state === 'COMPLETED' ? '0m 00s' : etaFormatted}
            </div>
            <div className="text-[9px] text-slate-500 line-through mt-0.5">
              8m 42s Normal
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="rounded-xl bg-black/50 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            Time Saved
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              {savedFormatted}
            </div>
            <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">
              ↓ 36% faster
            </div>
          </div>
        </div>

        {/* Signals Coordinated */}
        <div className="rounded-xl bg-black/50 border border-white/[0.06] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider leading-tight">
            Signals Controlled
          </span>
          <div className="mt-1">
            <div className="text-xs lg:text-sm font-black text-emerald-400">
              7 of 7
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              Green Wave
            </div>
          </div>
        </div>
      </div>

      {/* Big Action Button */}
      <button
        onClick={handleToggle}
        className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-xl ${
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

      {/* Dossier Modal */}
      {showInspector && (
        <AmbulanceInspectorModal onClose={() => setShowInspector(false)} />
      )}
    </div>
  );
};
