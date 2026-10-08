import React from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Zap, CheckCircle2, AlertOctagon, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Banner: React.FC = () => {
  const { sim } = useSimStore();
  const { state, ambulance } = sim;

  // Calculate live ETA and progress
  const remainingDistKm = Math.max(0, ambulance.totalDistanceKm - ambulance.distanceCoveredKm).toFixed(1);
  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const progressPercent = Math.min(100, Math.round(ambulance.progressPercent));

  const getBannerConfig = () => {
    switch (state) {
      case 'ACTIVE':
        return {
          title: 'EMERGENCY CORRIDOR ACTIVE',
          subtitle: 'AI is coordinating 7 traffic signals for AMB-001',
          bgClass: 'bg-gradient-to-r from-red-950/90 via-[#2A080C] to-red-950/90 border-red-500/60 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)]',
          icon: Siren,
          iconColor: 'text-red-500 animate-pulse',
        };
      case 'ANALYZING':
        return {
          title: 'AI ROUTE ANALYSIS IN PROGRESS',
          subtitle: 'Evaluating multi-modal traffic densities for lowest latency',
          bgClass: 'bg-gradient-to-r from-amber-950/80 via-[#201505] to-amber-950/80 border-amber-500/60 text-white',
          icon: Activity,
          iconColor: 'text-amber-400 animate-spin',
        };
      case 'PLANNED':
        return {
          title: 'OPTIMAL CORRIDOR COMPUTED',
          subtitle: 'Ready to preempt 7 traffic signals for AMB-001',
          bgClass: 'bg-gradient-to-r from-sky-950/80 via-[#08182B] to-sky-950/80 border-sky-500/60 text-white',
          icon: Zap,
          iconColor: 'text-sky-400',
        };
      case 'COMPLETED':
        return {
          title: 'AMBULANCE ARRIVED AT HOSPITAL',
          subtitle: 'Patient delivered to Victoria Hospital trauma center • Signals restored',
          bgClass: 'bg-gradient-to-r from-emerald-950/80 via-[#062015] to-emerald-950/80 border-emerald-500/60 text-white',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
      case 'ABORTED':
        return {
          title: 'EMERGENCY CORRIDOR TERMINATED',
          subtitle: 'Manual override invoked • Signals returned to civil cycle',
          bgClass: 'bg-gradient-to-r from-rose-950/80 via-rose-900/30 to-black border-rose-500/60 text-white',
          icon: AlertOctagon,
          iconColor: 'text-rose-400',
        };
      default:
        return {
          title: 'STANDBY • READY FOR EMERGENCY DISPATCH',
          subtitle: 'AI Traffic Monitoring active across Bengaluru CBD junctions',
          bgClass: 'bg-[#0E1117] border-white/10 text-slate-300',
          icon: Activity,
          iconColor: 'text-slate-400',
        };
    }
  };

  const config = getBannerConfig();
  const IconComponent = config.icon;

  return (
    <div className="w-full px-4 lg:px-6 pt-2 select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className={`w-full rounded-2xl px-5 py-3 border flex flex-col lg:flex-row items-center justify-between gap-4 ${config.bgClass}`}
        >
          {/* Left Title & Subtitle */}
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(255,59,48,0.4)]">
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase font-sans">
                  {config.title}
                </h2>
              </div>
              <p className="text-xs text-slate-300/80 font-mono tracking-normal">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Right Live Transit Tracker & ETA */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 w-full lg:w-auto">
            {/* Transit Progress Bar */}
            <div className="flex flex-col gap-1 w-full sm:w-64">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-200 font-medium">Ambulance en route to Victoria Hospital</span>
                <span className="text-cyan-300 font-bold">{remainingDistKm} km remaining</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* ETA Box */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-black/50 border border-red-500/30 font-mono shadow-[0_0_12px_rgba(239,68,68,0.2)]">
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">ETA</span>
                  <div className="w-8 h-1 rounded bg-red-500/60 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm lg:text-base font-black text-white">
                    {state === 'COMPLETED' ? '0 min 00 sec' : `${etaMin} min ${etaSec < 10 ? '0' : ''}${etaSec} sec`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
