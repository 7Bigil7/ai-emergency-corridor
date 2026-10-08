import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { Radio } from 'lucide-react';
import { SignalInspectorModal } from '../modals/SignalInspectorModal';

export const SignalsMatrixView: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { signals } = sim;
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase">
              C-V2X V2I TRAFFIC SIGNAL CONTROLLER MATRIX
            </h2>
            <p className="text-xs font-mono text-slate-400">
              7 PHYSICAL INTERSECTIONS • PHASE PREEMPTION • FAIL-SAFE RESTORATION
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
            7/7 NODES ONLINE
          </span>
          <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300">
            C-V2X LATENCY: 12ms
          </span>
        </div>
      </div>

      {/* 7 Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {signals.map((sig) => {
          const isGreen = sig.lamp === 'GREEN';
          const isYellow = sig.lamp === 'YELLOW';
          const isRed = sig.lamp === 'RED';
          const isFault = sig.isFaulty;

          return (
            <div
              key={sig.id}
              onClick={() => setSelectedSignalId(sig.id)}
              className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 hover:border-sky-500/60 transition-all cursor-pointer shadow-xl flex flex-col justify-between gap-3 group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-white/20 font-mono font-black text-xs text-white">
                    {sig.id}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[140px]" title={sig.name}>
                    {sig.name}
                  </span>
                </div>
                {isFault ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-bold">
                    FAULT
                  </span>
                ) : (
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                    isGreen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : isYellow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {sig.lamp}
                  </span>
                )}
              </div>

              {/* Housing & Timings */}
              <div className="flex items-center justify-around p-3 rounded-xl bg-black/50 border border-white/[0.04]">
                {/* 3-lamp vertical */}
                <div className="w-7 h-20 rounded-lg bg-black/95 border border-slate-700 p-1 flex flex-col items-center justify-between">
                  <div className={`w-4 h-4 rounded-full ${isRed ? 'bg-rose-500 shadow-[0_0_10px_#F43F5E]' : 'bg-rose-950/40'}`} />
                  <div className={`w-4 h-4 rounded-full ${isYellow ? 'bg-amber-400 shadow-[0_0_10px_#FBBF24]' : 'bg-amber-950/40'}`} />
                  <div className={`w-4 h-4 rounded-full ${isGreen ? 'bg-emerald-400 shadow-[0_0_12px_#34D399]' : 'bg-emerald-950/40'}`} />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 font-mono text-[11px]">
                  <div className="text-slate-400">Mode: <span className="text-white font-bold">{sig.mode}</span></div>
                  <div className="text-slate-400">Green: <span className="text-emerald-400 font-bold">{sig.normalCycleSeconds.green}s</span></div>
                  <div className="text-slate-400">Yellow: <span className="text-amber-400 font-bold">{sig.normalCycleSeconds.yellow}s</span></div>
                  <div className="text-slate-400">Red: <span className="text-rose-400 font-bold">{sig.normalCycleSeconds.red}s</span></div>
                </div>
              </div>

              {/* Bottom Override Action */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] font-mono text-[10px]">
                <span className="text-slate-400">Offset: +{sig.offsetSeconds}s</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: sig.id });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  {isFault ? 'Reset Fault' : 'Simulate Fault'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSignalId && (
        <SignalInspectorModal
          signalId={selectedSignalId}
          onClose={() => setSelectedSignalId(null)}
        />
      )}
    </div>
  );
};
