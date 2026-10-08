import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { Radio, AlertTriangle, Cpu, X } from 'lucide-react';

interface SignalInspectorModalProps {
  signalId: string;
  onClose: () => void;
}

export const SignalInspectorModal: React.FC<SignalInspectorModalProps> = ({ signalId, onClose }) => {
  const { sim, dispatch } = useSimStore();
  const { signals, state: corridorState } = sim;

  const signal = signals.find((s) => s.id === signalId) || signals[0]!;

  const isGreen = signal.lamp === 'GREEN';
  const isYellow = signal.lamp === 'YELLOW';
  const isRed = signal.lamp === 'RED';
  const isFault = signal.isFaulty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl bg-[#090C12] border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4 text-[#F2F4F7] font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-inspector-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 id="signal-inspector-title" className="text-base font-black tracking-wide uppercase text-white flex items-center gap-2">
                SIGNAL CONTROLLER DIAGNOSTICS: {signal.id}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                LOCATION: {signal.name} • C-V2X V2I NODE #{signal.id.replace('S', '10')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Signal Lamp Preview & Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
          {/* Signal Housing */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] flex items-center justify-around">
            <div className="w-10 h-28 rounded-xl bg-black/95 border-2 border-slate-700 p-1.5 flex flex-col items-center justify-between shadow-2xl">
              <div
                className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  isRed
                    ? 'bg-rose-500 shadow-[0_0_15px_#F43F5E]'
                    : isFault
                    ? 'bg-amber-600 animate-pulse'
                    : 'bg-rose-950/40'
                }`}
              />
              <div
                className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  isYellow ? 'bg-amber-400 shadow-[0_0_15px_#FBBF24]' : 'bg-amber-950/40'
                }`}
              />
              <div
                className={`w-6 h-6 rounded-full transition-all duration-300 ${
                  isGreen ? 'bg-emerald-400 shadow-[0_0_18px_#34D399]' : 'bg-emerald-950/40'
                }`}
              />
            </div>

            <div className="flex flex-col gap-1 font-mono text-xs">
              <div className="text-[10px] text-slate-400 uppercase">ACTIVE LAMP</div>
              <div className={`text-base font-black uppercase ${
                isGreen ? 'text-emerald-400' : isYellow ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {isFault ? 'FAULT / OVERRIDE' : signal.lamp}
              </div>
              <div className="text-[11px] text-slate-400">
                Mode: <span className="text-white font-bold">{signal.mode}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Cycle: <span className="text-cyan-300 font-bold">{signal.cycleTimer}s remaining</span>
              </div>
            </div>
          </div>

          {/* Phase Timings Breakdown */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase font-bold border-b border-white/[0.04] pb-1">
              NORMAL PHASE CONFIGURATION
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400 font-bold">Green Duration:</span>
              <span className="text-white">{signal.normalCycleSeconds.green} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400 font-bold">Yellow Clearance:</span>
              <span className="text-white">{signal.normalCycleSeconds.yellow} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-400 font-bold">Red Hold Phase:</span>
              <span className="text-white">{signal.normalCycleSeconds.red} seconds</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-slate-400">Coordination Offset:</span>
              <span className="text-cyan-300 font-bold">+{signal.offsetSeconds}s</span>
            </div>
          </div>
        </div>

        {/* AI Preemption Status */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Cpu className="w-3.5 h-3.5" />
              AI CORRIDOR PREEMPTION
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              corridorState === 'ACTIVE'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {corridorState === 'ACTIVE' ? 'DYNAMIC GREEN WAVE ENGAGED' : 'CIVIL TIMED CYCLE'}
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            {isGreen && corridorState === 'ACTIVE'
              ? 'Signal locked GREEN with cross-traffic hold phase until AMB-001 completely clears clearance zone.'
              : isYellow
              ? 'Transitional clearance active. Cross-traffic warned via VMS digital signage.'
              : 'Operating under standard UTC / ITMS signal plan. Priority override queue armed.'}
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: signal.id })}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors border ${
              isFault
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/60'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isFault ? 'CLEAR HARDWARE FAULT' : 'TEST HARDWARE FAULT'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
