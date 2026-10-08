import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Sun, Settings, Bell, Play, Pause } from 'lucide-react';

export const Header: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { demoMode, speedMultiplier } = sim;
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#070A0F] border-b border-white/[0.08] px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none z-30 shadow-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/10 to-transparent border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(255,59,48,0.3)]">
          <Siren className="w-5 h-5 text-[#FF3B30] animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-black tracking-tight text-white font-sans flex items-center gap-2">
            AI EMERGENCY CORRIDOR
          </h1>
          <p className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-semibold">
            AI-POWERED EMERGENCY TRAFFIC MANAGEMENT
          </p>
        </div>
      </div>

      {/* Center Status Indicators: System Online, Clock, Weather */}
      <div className="hidden md:flex items-center gap-3">
        {/* System Online Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#2BD97C]"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-emerald-400 leading-none">SYSTEM ONLINE</span>
            <span className="text-[8px] text-emerald-300/70 leading-none mt-0.5">All systems operational</span>
          </div>
        </div>

        {/* Live Date & Time Clock */}
        <div className="flex flex-col px-3 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-center font-mono">
          <span className="text-[9px] text-[#8A919E] uppercase tracking-wider">{dateStr || 'Tue, 7 Oct 2026'}</span>
          <span className="text-xs font-bold text-white tracking-wider">{timeStr || '07:42:18 PM'}</span>
        </div>

        {/* Weather Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-xs">
          <Sun className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-none">26°C</span>
            <span className="text-[9px] text-slate-400 leading-none mt-0.5">Bengaluru</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Demo Mode CTA, Speed selector, Settings */}
      <div className="flex items-center gap-2.5">
        {!demoMode.isRunning ? (
          <button
            onClick={() => dispatch({ type: 'START_DEMO' })}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500 hover:from-sky-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-400/50 transition-all transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>DEMO MODE</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (demoMode.isPaused) {
                dispatch({ type: 'RESUME_DEMO' });
              } else {
                dispatch({ type: 'PAUSE_DEMO' });
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,176,32,0.4)] border border-amber-400/50"
          >
            {demoMode.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{demoMode.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
        )}

        {/* Speed Toggles (1x, 2x, 4x) */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/[0.08] font-mono text-[10px]">
          {([1, 2, 4] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => dispatch({ type: 'SET_SPEED_MULTIPLIER', multiplier: spd })}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                speedMultiplier === spd
                  ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Settings & Alert Bell */}
        <button
          onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
          className="p-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
          title="Reset Simulation"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="relative p-2 rounded-lg bg-black/40 border border-white/[0.08] text-slate-300">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </div>
      </div>
    </header>
  );
};
