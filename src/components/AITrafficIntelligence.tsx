import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Cpu, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export const AITrafficIntelligence: React.FC = () => {
  const { sim } = useSimStore();
  const { state } = sim;

  // Checklist items dynamic state
  const isAnalyzing = state === 'ANALYZING';
  const isActive = state === 'ACTIVE';
  const isCompleted = state === 'COMPLETED';

  const steps = [
    {
      label: 'Analyzing real-time traffic conditions...',
      status: state === 'IDLE' ? 'Pending' : 'Completed',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      done: state !== 'IDLE',
    },
    {
      label: 'Evaluating alternative routes...',
      status: isAnalyzing ? 'In Progress' : state === 'IDLE' ? 'Pending' : 'Completed',
      statusClass: isAnalyzing ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      done: state === 'PLANNED' || isActive || isCompleted,
    },
    {
      label: 'Optimal route selected (4.8 km)',
      status: state === 'IDLE' || isAnalyzing ? 'Pending' : 'Completed',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      done: state === 'PLANNED' || isActive || isCompleted,
    },
    {
      label: '7 traffic signals identified',
      status: state === 'IDLE' || isAnalyzing ? 'Pending' : 'Completed',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
      done: state === 'PLANNED' || isActive || isCompleted,
    },
    {
      label: 'Green wave synchronization initiated',
      status: isActive ? 'In Progress' : isCompleted ? 'Completed' : 'Pending',
      statusClass: isActive ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' : isCompleted ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' : 'text-slate-400 bg-slate-900 border-white/10',
      done: isActive || isCompleted,
    },
    {
      label: 'Monitoring ambulance progress...',
      status: isActive ? 'Active' : isCompleted ? 'Completed' : 'Standby',
      statusClass: isActive ? 'text-sky-400 bg-sky-950/60 border-sky-500/40 animate-pulse' : isCompleted ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' : 'text-slate-400 bg-slate-900 border-white/10',
      done: isActive || isCompleted,
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#090C12]/90 border border-white/[0.08] p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
            AI TRAFFIC INTELLIGENCE
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center gap-1 shadow-[0_0_8px_rgba(56,189,248,0.3)]">
          <Sparkles className="w-2.5 h-2.5" />
          SIMULATED AI
        </span>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: AI Step Checklist (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-1.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-black/30 border border-white/[0.04] text-[11px] font-mono"
            >
              <div className="flex items-center gap-2 min-w-0">
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : step.status === 'In Progress' || step.status === 'Active' ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex-shrink-0" />
                )}
                <span className="text-slate-300 truncate">{step.label}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 ${step.statusClass}`}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column: Route Comparison Box & Mini Traffic Density Chart (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-2.5 font-mono">
          {/* Route Comparison Box */}
          <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5 flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Route Comparison
            </span>
            <div className="flex items-center justify-between text-xs border-b border-white/[0.04] pb-1">
              <span className="text-slate-400 text-[11px]">Normal Route</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-300">8.7 km</span>
                <span className="text-amber-400 font-bold">8 min 42 sec</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-emerald-400 font-bold text-[11px]">AI Optimized</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-300">4.8 km</span>
                <span className="text-emerald-400 font-black">5 min 31 sec</span>
              </div>
            </div>
            <div className="mt-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-black text-emerald-400 text-center tracking-wider">
              36% faster
            </div>
          </div>

          {/* Mini Traffic Density Bar Chart */}
          <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2 flex flex-col gap-1.5">
            <div className="flex items-end justify-between gap-1 h-10 px-2 pt-1">
              {/* High Traffic bars */}
              <div className="flex items-end gap-1 flex-1 justify-center">
                <div className="w-1.5 h-8 bg-red-500 rounded-t shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                <div className="w-1.5 h-5 bg-red-500/70 rounded-t" />
                <div className="w-1.5 h-7 bg-red-500 rounded-t" />
              </div>
              {/* Moderate bars */}
              <div className="flex items-end gap-1 flex-1 justify-center">
                <div className="w-1.5 h-4 bg-amber-400 rounded-t shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                <div className="w-1.5 h-6 bg-amber-400 rounded-t" />
              </div>
              {/* Clear bars */}
              <div className="flex items-end gap-1 flex-1 justify-center">
                <div className="w-1.5 h-3 bg-emerald-400 rounded-t" />
                <div className="w-1.5 h-4 bg-emerald-400 rounded-t shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <div className="w-1.5 h-2 bg-emerald-400/80 rounded-t" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[8px] text-slate-400 px-1 border-t border-white/[0.04] pt-1">
              <span className="text-red-400">High Traffic</span>
              <span className="text-amber-400">Moderate</span>
              <span className="text-emerald-400">Clear</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
