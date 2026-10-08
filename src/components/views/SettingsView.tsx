import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { Settings, Cpu, ShieldCheck, RefreshCw, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { dispatch } = useSimStore();

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase">
              SYSTEM DIAGNOSTICS & SIMULATION ENGINE CONFIG
            </h2>
            <p className="text-xs font-mono text-slate-400">
              PHYSICS TICK RATE: 10Hz • C-V2X SECURE PROTOCOL • SIMULATED EDGE INFERENCE
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
          className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900/80 border border-red-500/40 text-red-300 font-mono text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REBOOT SIMULATION ENGINE</span>
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Core Engine Parameters */}
        <div className="p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-white/[0.08] pb-2">
            <Cpu className="w-4 h-4" />
            <span>AI INFERENCE ENGINE</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-slate-400">Model:</span> <span className="text-white font-bold">Fast-A* Dynamic Preemption v4.2</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Inference Latency:</span> <span className="text-emerald-400 font-bold">14.2 ms</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Preemption Lookahead:</span> <span className="text-white font-bold">25.0 seconds (450m)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Confidence Threshold:</span> <span className="text-white font-bold">90.0%</span></div>
          </div>
        </div>

        {/* C-V2X V2I Protocol */}
        <div className="p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-white/[0.08] pb-2">
            <Server className="w-4 h-4" />
            <span>C-V2X NETWORK STACK</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-slate-400">Frequency:</span> <span className="text-white font-bold">5.9 GHz ITS Band</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Signal Controllers:</span> <span className="text-white font-bold">7 V2I RSU Nodes</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Packet Jitter:</span> <span className="text-emerald-400 font-bold">1.2 ms</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Fail-safe Mode:</span> <span className="text-emerald-400 font-bold">Auto-Revert Active</span></div>
          </div>
        </div>

        {/* Disclaimer & Operational Integrity */}
        <div className="p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-white/[0.08] pb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>SIMULATION INTEGRITY</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            This deployment runs on a mathematical simulation engine utilizing Bengaluru road geometry and live V2I state progression. No live municipal hardware is modified.
          </p>
          <div className="pt-2 border-t border-white/[0.06] text-[10px] text-amber-400 font-bold">
            AUTHORIZATION: MOCK BTP-EOC BADGE #419
          </div>
        </div>
      </div>
    </div>
  );
};
