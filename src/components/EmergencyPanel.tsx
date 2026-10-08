import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Hospital, MapPin, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

export const EmergencyPanel: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { ambulance, hospital, state, routes, selectedRouteId } = sim;

  const formatEta = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleMainCta = () => {
    if (state === 'IDLE' || state === 'ABORTED') {
      dispatch({ type: 'START_ANALYSIS' });
    } else if (state === 'ANALYZING' || state === 'PLANNED') {
      dispatch({ type: 'ACTIVATE_CORRIDOR' });
    } else if (state === 'ACTIVE') {
      dispatch({ type: 'ABORT_CORRIDOR', reason: 'Manual Operator Deactivation' });
    } else if (state === 'COMPLETED') {
      dispatch({ type: 'RESET_SIMULATION' });
    }
  };

  const getCtaStyles = () => {
    if (state === 'IDLE' || state === 'ABORTED') {
      return {
        text: 'START AI CORRIDOR ANALYSIS',
        icon: Zap,
        className:
          'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] border-sky-400/40',
      };
    } else if (state === 'ANALYZING' || state === 'PLANNED') {
      return {
        text: 'ACTIVATE EMERGENCY CORRIDOR',
        icon: Siren,
        className:
          'bg-[#2BD97C] hover:bg-emerald-400 text-slate-950 font-black shadow-[0_0_25px_rgba(43,217,124,0.5)] border-emerald-300 animate-pulse',
      };
    } else if (state === 'ACTIVE') {
      return {
        text: 'DEACTIVATE / CORRIDOR ACTIVE',
        icon: ShieldAlert,
        className:
          'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(255,59,48,0.4)] border-rose-400/40',
      };
    } else {
      return {
        text: 'RESET SIMULATION',
        icon: RefreshCw,
        className:
          'bg-slate-700 hover:bg-slate-600 text-white border-white/20',
      };
    }
  };

  const cta = getCtaStyles();
  const CtaIcon = cta.icon;

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4 border border-white/10">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Siren className="w-4 h-4 animate-siren" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            EMERGENCY INCIDENT
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-950/60 border border-rose-500/40 text-rose-300">
          CODE RED
        </span>
      </div>

      {/* Ambulance & Patient Status */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#8A919E] uppercase tracking-wider">
            Vehicle Unit
          </span>
          <span className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {ambulance.id}
          </span>
          <span className="text-[9px] font-mono text-slate-400">{ambulance.callSign}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#8A919E] uppercase tracking-wider">
            Patient Status
          </span>
          <span className="font-mono text-sm font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            {ambulance.patientStatus}
          </span>
          <span className="text-[9px] font-mono text-slate-400">Cardiac Trauma</span>
        </div>
      </div>

      {/* Origin & Destination */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-xs">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[10px] text-[#8A919E] uppercase tracking-wider">Origin</div>
            <div className="text-white font-medium text-xs">Ulsoor Lake East (Commercial St Sector)</div>
          </div>
        </div>

        <div className="w-full border-t border-dashed border-white/10 my-0.5"></div>

        <div className="flex items-start gap-2">
          <Hospital className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[10px] text-[#8A919E] uppercase tracking-wider">Destination</div>
            <div className="text-white font-medium text-xs">{hospital.name}</div>
            <div className="text-[10px] text-emerald-400">{hospital.emergencyDepartment}</div>
          </div>
        </div>
      </div>

      {/* Telemetry Row */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="p-2 rounded bg-black/30 border border-white/5">
          <span className="text-[9px] text-[#8A919E] uppercase block">Distance</span>
          <span className="text-xs font-bold text-white">
            {ambulance.distanceCoveredKm.toFixed(1)} / {ambulance.totalDistanceKm.toFixed(1)} km
          </span>
        </div>
        <div className="p-2 rounded bg-black/30 border border-white/5">
          <span className="text-[9px] text-[#8A919E] uppercase block">Speed</span>
          <span className="text-xs font-bold text-emerald-400">
            {Math.round(ambulance.speedKmh)} km/h
          </span>
        </div>
        <div className="p-2 rounded bg-black/30 border border-white/5">
          <span className="text-[9px] text-[#8A919E] uppercase block">Live ETA</span>
          <span className="text-xs font-bold text-sky-400">
            {formatEta(ambulance.etaWithAiSec)}
          </span>
        </div>
      </div>

      {/* Route Selector (Candidates A, B, C) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-[#8A919E] uppercase tracking-wider">
          Arterial Route Candidates
        </span>
        <div className="flex flex-col gap-1.5">
          {routes.map((r) => {
            const isSelected = r.id === selectedRouteId;
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (state !== 'ACTIVE') {
                    dispatch({ type: 'SELECT_ROUTE', routeId: r.id });
                  }
                }}
                disabled={state === 'ACTIVE'}
                className={`p-2 rounded-lg border text-left font-mono transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_10px_rgba(43,217,124,0.15)]'
                    : 'bg-black/30 border-white/5 hover:border-white/20 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{r.name}</span>
                    {r.isRecommended && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        AI Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{r.via}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold block ${
                      r.congestion > 0.6 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    Cong: {Math.round(r.congestion * 100)}%
                  </span>
                  <span className="text-[9px] text-slate-500">Cost: {r.cost}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Action CTA Button */}
      <button
        onClick={handleMainCta}
        className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-mono text-sm tracking-wider uppercase transition-all transform active:scale-[0.98] ${cta.className}`}
      >
        <CtaIcon className="w-5 h-5" />
        <span>{cta.text}</span>
      </button>
    </div>
  );
};
