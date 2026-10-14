import React, { useState, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Siren, Settings, Play, Pause, Bell, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { sim, dispatch } = useSimStore();
  const { demoMode, speedMultiplier } = sim;
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#06090E]/95 backdrop-blur-md border-b border-white/[0.08] px-3 lg:px-6 py-2.5 flex items-center justify-between gap-3 select-none shadow-xl">
      {/* Left Brand Identity matching Image 2 */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/15 to-transparent border border-red-500/50 text-red-500 shadow-[0_0_16px_rgba(255,59,48,0.4)]">
          <Siren className="w-5 h-5 text-[#FF3B30] animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white font-sans">
              AI EMERGENCY CORRIDOR
            </h1>
          </div>
          <p className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold">
            AI-POWERED EMERGENCY TRAFFIC MANAGEMENT
          </p>
        </div>
      </div>

      {/* Middle Status Indicators matching Image 2 */}
      <div className="hidden md:flex items-center gap-3 lg:gap-5">
        {/* SYSTEM ONLINE Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399] animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-black text-white leading-tight">
              SYSTEM ONLINE
            </span>
            <span className="text-[8px] font-mono text-emerald-400/80 leading-none">
              All systems operational
            </span>
          </div>
        </div>

        {/* Date and Time Chip */}
        <div className="flex flex-col text-right font-mono border-l border-white/[0.08] pl-3.5">
          <span className="text-[10px] text-slate-300 font-medium leading-tight">
            {dateStr || 'Tue, 7 Oct 2026'}
          </span>
          <span className="text-[11px] font-bold text-white leading-tight tracking-wider">
            {timeStr || '07:42:18 PM'}
          </span>
        </div>

        {/* Weather Indicator */}
        <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3.5">
          <Sun className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col text-left font-mono">
            <span className="text-[11px] font-bold text-white leading-tight">
              26°C
            </span>
            <span className="text-[9px] text-slate-400 leading-none">
              Bengaluru
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls matching Image 2 */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Speed Multiplier Toggles (1x, 2x, 4x) */}
        <div className="flex items-center gap-0.5 bg-black/60 p-0.5 rounded-xl border border-white/[0.08] font-mono text-[10px]">
          {([1, 2, 4] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => dispatch({ type: 'SET_SPEED_MULTIPLIER', multiplier: spd })}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                speedMultiplier === spd
                  ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`Simulate at ${spd}x speed`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* DEMO MODE Button */}
        {!demoMode.isRunning ? (
          <button
            onClick={() => dispatch({ type: 'START_DEMO' })}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-sky-400/50 transition-all transform active:scale-95"
            title="Start automated end-to-end corridor demo"
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
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,176,32,0.4)] border border-amber-400/50 transition-all"
            title={demoMode.isPaused ? 'Resume Demo' : 'Pause Demo'}
          >
            {demoMode.isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{demoMode.isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
          className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
          title="Reset Simulation / Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <button
          className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/[0.08] text-slate-300 hover:text-white transition-colors relative"
          title="System Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#EF4444]" />
        </button>
      </div>
    </header>
  );
};
