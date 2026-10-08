import React, { useState, useEffect } from 'react';
import { useSimStore, NavTab } from '../store/useSimStore';
import { Siren, Settings, Play, Pause, Shield, Radio, Activity, Navigation, Terminal, AlertOctagon, Users } from 'lucide-react';

export const Header: React.FC = () => {
  const { sim, dispatch, activeNavTab, setActiveNavTab } = useSimStore();
  const { demoMode, speedMultiplier, state } = sim;
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

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'map', label: 'Tactical Map', icon: Navigation },
    { id: 'fleet', label: 'Fleet & Hospital', icon: Users },
    { id: 'signals', label: 'Signals Matrix', icon: Radio },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
    { id: 'audit', label: 'Audit Log', icon: Terminal },
    { id: 'settings', label: 'System Config', icon: Settings },
  ];

  return (
    <header className="w-full bg-[#070A0F] border-b border-slate-800/80 px-3 lg:px-6 py-2.5 flex flex-col gap-2.5 select-none z-30 shadow-2xl">
      {/* Top Bar: Brand, KPI Badges, Demo Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/10 to-transparent border border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(255,59,48,0.35)]">
            <Siren className="w-5 h-5 text-[#FF3B30] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-black tracking-tight text-white font-sans">
                AI EMERGENCY CORRIDOR
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 font-mono text-[9px] font-bold text-emerald-300">
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-semibold">
              AI-POWERED EMERGENCY TRAFFIC MANAGEMENT
            </p>
          </div>
        </div>

        {/* Center Live KPI Summary Strip (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/50 border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase">ACTIVE EMERGENCIES</span>
            <span className="text-red-400 font-black">01</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/50 border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase">CORRIDORS ACTIVE</span>
            <span className="text-emerald-400 font-black">{state === 'ACTIVE' ? '01' : '00'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/50 border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase">SIGNALS COORDINATED</span>
            <span className="text-sky-400 font-black">07</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/50 border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase">AVG TIME SAVED</span>
            <span className="text-emerald-400 font-black">36%</span>
          </div>
        </div>

        {/* Right Controls: Demo Mode, Speed selector, Reset, Time */}
        <div className="flex items-center gap-2">
          {/* Operator Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[10px] text-slate-300">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>OPERATOR #419</span>
          </div>

          {/* Demo Mode Button */}
          {!demoMode.isRunning ? (
            <button
              onClick={() => dispatch({ type: 'START_DEMO' })}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)] border border-sky-400/50 transition-all transform active:scale-95"
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
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(255,176,32,0.4)] border border-amber-400/50"
            >
              {demoMode.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{demoMode.isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
          )}

          {/* Speed Toggles (1x, 2x, 4x) */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-xl border border-white/[0.08] font-mono text-[10px]">
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => dispatch({ type: 'SET_SPEED_MULTIPLIER', multiplier: spd })}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  speedMultiplier === spd
                    ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Reset Simulation Button */}
          <button
            onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
            className="p-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="Reset Simulation"
            aria-label="Reset simulation"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1.5" role="tablist">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveNavTab(item.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/20 border border-sky-400/60 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Date & Time Chip */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-slate-400 pl-4 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white font-bold">{timeStr || '19:42:18'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{dateStr || 'Thu, 8 Oct 2026'}</span>
        </div>
      </div>
    </header>
  );
};
