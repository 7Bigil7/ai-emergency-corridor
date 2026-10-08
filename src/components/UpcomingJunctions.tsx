import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { CheckCircle2, Radio, Clock, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

export const UpcomingJunctions: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { signals, state, currentSignalApproachingId } = sim;

  return (
    <div className="glass-panel rounded-xl p-3.5 flex flex-col gap-3 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            UPCOMING JUNCTIONS
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
          7 CORRIDOR NODES
        </span>
      </div>

      {/* Junction Cards List (Matching Image 2) */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {signals.map((sig, idx) => {
          const isApproaching = sig.id === currentSignalApproachingId;
          const isCleared = sig.isCleared;
          const isFault = sig.isFaulty;
          const isLocked = sig.mode === 'CORRIDOR_GREEN';
          const isPreparing = sig.mode === 'PREPARING_GREEN';

          let cardStyle = 'bg-black/30 border-white/5 text-slate-400';
          let statusText = 'QUEUED IN GRID';
          let statusBadge = 'bg-slate-800 text-slate-400 border-white/5';
          let icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;

          if (isCleared) {
            cardStyle = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(43,217,124,0.15)]';
            statusText = 'JUNCTION CLEARED ✓';
            statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
            icon = <CheckCircle2 className="w-4 h-4 text-[#2BD97C]" />;
          } else if (isFault) {
            cardStyle = 'bg-amber-950/40 border-amber-500/40 text-amber-300';
            statusText = 'FAULT • MANUAL CONTROL';
            statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          } else if (isLocked) {
            cardStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(43,217,124,0.3)] animate-pulse';
            statusText = 'AI CONTROL ACTIVE • GREEN WAVE';
            statusBadge = 'bg-[#2BD97C] text-slate-950 font-black border-emerald-300';
            icon = <Radio className="w-4 h-4 text-[#2BD97C] animate-ping" />;
          } else if (isPreparing) {
            cardStyle = 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(255,176,32,0.25)] animate-pulse';
            statusText = 'TRAFFIC REDIRECTED • 3s YELLOW';
            statusBadge = 'bg-amber-500 text-slate-950 font-black border-amber-300';
            icon = <Clock className="w-4 h-4 text-amber-400" />;
          } else if (isApproaching && state === 'ACTIVE') {
            cardStyle = 'bg-sky-950/40 border-sky-500/50 text-sky-200';
            statusText = 'NEXT APPROACHING JUNCTION';
            statusBadge = 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold';
            icon = <ArrowRight className="w-4 h-4 text-sky-400" />;
          }

          return (
            <div
              key={sig.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2.5 font-mono text-xs transition-all ${cardStyle}`}
            >
              {/* Left Indicator & Name */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="shrink-0">{icon}</div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white uppercase text-xs">
                      Junction {idx + 1}: {sig.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 truncate">
                    {sig.name}
                  </span>
                </div>
              </div>

              {/* Right Status Badge */}
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border ${statusBadge}`}
                >
                  {statusText}
                </span>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  Lamp: <span className="font-bold text-white">{sig.lamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Quick-Action Corridor Trigger */}
      {state !== 'ACTIVE' ? (
        <button
          onClick={() => {
            dispatch({ type: 'START_ANALYSIS' });
            setTimeout(() => {
              dispatch({ type: 'ACTIVATE_CORRIDOR' });
            }, 300);
          }}
          className="w-full py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(43,217,124,0.4)] transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>START AMBULANCE TRANSIT RUN</span>
        </button>
      ) : (
        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-center font-mono text-xs text-emerald-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>AMBULANCE AMB-001 IN TRANSIT (48 KM/H)</span>
        </div>
      )}
    </div>
  );
};
