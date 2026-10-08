import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIInsights: React.FC = () => {
  const { sim } = useSimStore();
  const { insights } = sim;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ROUTING':
        return 'text-sky-400 bg-sky-950/60 border-sky-500/30';
      case 'SIGNALS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'IMPACT':
        return 'text-teal-300 bg-teal-950/60 border-teal-500/30';
      case 'SAFETY':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      default:
        return 'text-slate-300 bg-slate-900 border-white/10';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 border border-white/10 max-h-[300px] lg:max-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
            AI DECISION STREAM
          </span>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-950/60 border border-sky-500/40 text-sky-300">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          REAL-TIME REASONING
        </span>
      </div>

      {/* Insights Stream */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {insights.map((ins) => (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1 font-mono text-xs hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getCategoryColor(
                    ins.category
                  )}`}
                >
                  {ins.category}
                </span>
                <span className="text-[10px] text-[#8A919E]">{ins.timestamp}</span>
              </div>
              <p className="text-[#F2F4F7] text-[11px] leading-relaxed pt-0.5">
                {ins.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
