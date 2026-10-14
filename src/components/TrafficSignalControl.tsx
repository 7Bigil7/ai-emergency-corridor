import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Radio, AlertTriangle } from 'lucide-react';
import { SignalInspectorModal } from './modals/SignalInspectorModal';

export const TrafficSignalControl: React.FC = () => {
  const { sim } = useSimStore();
  const { signals, state, ambulance, currentSignalApproachingId, nextSignalApproachingId } = sim;
  const [inspectSignalId, setInspectSignalId] = useState<string | null>(null);

  // 7 Signals: S01 to S07
  const displaySignals = signals.slice(0, 7);

  const signalNames = [
    '100ft Road',
    'CMH Road',
    'Trinity Ave',
    'Central Cross',
    'Brigade Expwy',
    'Richmond Blvd',
    'Victoria Gate',
  ];

  const isCorridorActive = state === 'ACTIVE';

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/95 border border-slate-700/80 p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-md font-sans">
      {/* Header matching Image 2 */}
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

      {/* 7 Hardware Signal Cards matching Image 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1 font-mono">
        {displaySignals.map((sig, idx) => {
          const signalName = `S0${idx + 1}`;
          const junctionLabel = signalNames[idx] || `Junction ${idx + 1}`;

          let isGreen = false;
          let isPrepare = false;
          let statusText = 'RED';
          let subText = 'Civil Cycle';
          let isCardHighlighted = false;

          if (isCorridorActive) {
            // Active corridor flow
            const isCorridorGreen = sig.mode === 'CORRIDOR_GREEN' || sig.id === currentSignalApproachingId;
            const isCorridorPrepare = sig.mode === 'PREPARING_GREEN' || sig.id === nextSignalApproachingId;

            if (sig.isFaulty) {
              statusText = 'FAULT';
              subText = 'Bypass';
            } else if (isCorridorGreen) {
              isGreen = true;
              statusText = 'GREEN';
              subText = 'Active';
            } else if (isCorridorPrepare) {
              isPrepare = true;
              statusText = 'PREPARE';
              subText = 'Next';
              isCardHighlighted = true;
            } else if (sig.isCleared) {
              isGreen = sig.lamp === 'GREEN';
              if (sig.lamp === 'YELLOW') isPrepare = true;
              statusText = sig.lamp;
              subText = 'Restored';
            } else {
              statusText = 'RED';
              const remainingMinutes = Math.max(1, Math.ceil(((idx + 1) * 0.8) - (ambulance.progressPercent / 100 * 5)));
              subText = `${remainingMinutes} min`;
            }
          } else {
            // STANDBY / Normal Civil Cycling (GREEN 25s, YELLOW 3s, RED 28s)
            if (sig.isFaulty) {
              statusText = 'FAULT';
              subText = 'Hazard';
            } else {
              isGreen = sig.lamp === 'GREEN';
              isPrepare = sig.lamp === 'YELLOW';
              statusText = sig.lamp;
              subText = sig.lamp === 'GREEN' ? 'Normal Green' : sig.lamp === 'YELLOW' ? 'Caution' : 'Normal Stop';
            }
          }

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

          return (
            <div
              key={sig.id || idx}
              onClick={() => setInspectSignalId(sig.id)}
              className={`rounded-xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none group ${
                isCardHighlighted
                  ? 'bg-black/90 border-2 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                  : 'bg-black/50 border border-white/[0.06] hover:border-sky-500/50'
              }`}
              title={`Click to inspect ${signalName} (${junctionLabel}) timing & hardware`}
            >
              {/* Signal ID & Junction Name */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-black text-white">
                  {signalName}
                </span>
                <span className="text-[9px] text-slate-400 truncate max-w-[70px]" title={junctionLabel}>
                  {junctionLabel}
                </span>
              </div>

              {/* Glowing Lamp Circle */}
              <div className="my-2 relative flex items-center justify-center">
                {sig.isFaulty ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                ) : (
                  <div className={`w-3.5 h-3.5 rounded-full ${lampColor} transition-all duration-300`} />
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

      {inspectSignalId && (
        <SignalInspectorModal
          signalId={inspectSignalId}
          onClose={() => setInspectSignalId(null)}
        />
      )}
    </div>
  );
};
