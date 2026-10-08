import React, { useEffect, useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { CheckCircle2, TrendingUp, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export const CompletionSummary: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { state, stats } = sim;

  const [countPercent, setCountPercent] = useState(0);

  useEffect(() => {
    if (state === 'COMPLETED') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2BD97C', '#38BDF8', '#FFB020'],
        });
      } catch {
        // Fallback gracefully if canvas context restricted
      }

      // Count up animation
      let current = 0;
      const target = stats.timeSavedPercent || 34;
      const timer = setInterval(() => {
        current += 1;
        if (current >= target) {
          setCountPercent(target);
          clearInterval(timer);
        } else {
          setCountPercent(current);
        }
      }, 25);

      return () => clearInterval(timer);
    } else {
      setCountPercent(0);
    }
  }, [state, stats.timeSavedPercent]);

  if (state !== 'COMPLETED') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-[#0E1013] border border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(43,217,124,0.25)] flex flex-col gap-5 text-center font-sans"
        >
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(43,217,124,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-[#2BD97C]" />
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">
              EMERGENCY MISSION COMPLETED
            </h2>
            <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              AMB-001 Arrived Safely • Victoria Hospital Trauma ICU
            </p>
          </div>

          {/* Big Time Saved Hero Metric */}
          <div className="py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-slate-950/40 border border-emerald-500/30 flex flex-col items-center">
            <span className="text-xs font-mono text-[#8A919E] uppercase tracking-wider">
              AI Green-Wave Time Reduction
            </span>
            <div className="text-4xl lg:text-5xl font-black text-[#2BD97C] font-mono my-1 tracking-tight">
              {countPercent}% FASTER
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/90">
              <TrendingUp className="w-4 h-4 text-[#2BD97C]" />
              <span>Saved ~6.0 Minutes Critical Golden-Hour Window</span>
            </div>
          </div>

          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-left font-mono">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#8A919E] uppercase block">Total Distance</span>
              <span className="text-sm font-bold text-white">5.8 Kilometers</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#8A919E] uppercase block">Signals Coordinated</span>
              <span className="text-sm font-bold text-emerald-400">7 Intersections</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#8A919E] uppercase block">Without AI (Baseline)</span>
              <span className="text-sm font-bold text-rose-400 line-through">18.0 min</span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-[#8A919E] uppercase block">With AI Green-Wave</span>
              <span className="text-sm font-black text-[#2BD97C]">12.0 min</span>
            </div>
          </div>

          {/* CTA Action */}
          <button
            onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
            className="w-full py-3 px-4 rounded-xl bg-[#2BD97C] hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(43,217,124,0.4)] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TO NORMAL CIVIL TRAFFIC</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
