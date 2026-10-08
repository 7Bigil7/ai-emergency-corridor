import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Radio, AlertTriangle } from 'lucide-react';

export const TrafficSignalControl: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { signals, state, ambulance } = sim;

  // 7 Signals: S01 to S07
  const displaySignals = signals.slice(0, 7);

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/90 border border-white/[0.08] p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
            TRAFFIC SIGNAL CONTROL
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
          7 SIGNALS
        </span>
      </div>

      {/* 7 Hardware Signal Cards */}
      <div className="grid grid-cols-7 gap-2 pt-1 font-mono">
        {displaySignals.map((sig, idx) => {
          const isGreen = sig.lamp === 'GREEN' || (state === 'ACTIVE' && idx <= Math.floor((ambulance.progressPercent / 100) * 7));
          const isPrepare = sig.lamp === 'YELLOW' || (state === 'ACTIVE' && idx === Math.floor((ambulance.progressPercent / 100) * 7) + 1);

          const signalName = `S0${idx + 1}`;
          const statusText = isGreen ? 'GREEN' : isPrepare ? 'PREPARE' : 'RED';
          const subText = isGreen ? 'Active' : isPrepare ? 'Next' : `${Math.max(1, (idx - 1) * 2)} min`;

          const lampColor = isGreen
            ? 'bg-emerald-400 shadow-[0_0_12px_#34D399]'
            : isPrepare
            ? 'bg-amber-400 shadow-[0_0_12px_#FBBF24]'
            : 'bg-rose-500 shadow-[0_0_10px_#F43F5E]';

          const textColor = isGreen
            ? 'text-emerald-400'
            : isPrepare
            ? 'text-amber-400'
            : 'text-rose-400';

          const isCardHighlighted = isPrepare;

          return (
            <div
              key={sig.id || idx}
              onClick={() => dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: sig.id })}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none group ${
                isCardHighlighted
                  ? 'bg-black/80 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-black/40 border border-white/[0.06] hover:border-white/20'
              }`}
              title="Click to toggle simulated hardware fault override"
            >
              {/* Signal ID */}
              <span className="text-[10px] font-bold text-slate-300">
                {signalName}
              </span>

              {/* Glowing Lamp Circle */}
              <div className="my-2 relative flex items-center justify-center">
                {sig.isFaulty ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />
                ) : (
                  <div className={`w-4 h-4 rounded-full ${lampColor} transition-all duration-300`} />
                )}
              </div>

              {/* Status & Timing */}
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black uppercase ${textColor}`}>
                  {sig.isFaulty ? 'FAULT' : statusText}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">
                  {subText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
