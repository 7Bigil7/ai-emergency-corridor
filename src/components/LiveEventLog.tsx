import React, { useRef, useEffect } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Terminal, Circle } from 'lucide-react';
import { EventLogEntry } from '../engine/types';

export const LiveEventLog: React.FC = () => {
  const { sim, setActiveNavTab } = useSimStore();
  const { events } = sim;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  // Default fallback logs if empty
  const defaultLogs: Partial<EventLogEntry>[] = [
    { timestamp: '19:42:01', message: 'Emergency dispatch initialized (AMB-001 • Critical)' },
    { timestamp: '19:42:02', message: 'Origin GPS verified: Indiranagar CBD' },
    { timestamp: '19:42:03', message: 'Hospital ED notified: Victoria Hospital Trauma Bay 4' },
    { timestamp: '19:42:04', message: 'Optimal green-wave trajectory computed (4.8 km)' },
    { timestamp: '19:42:05', message: '7 V2I traffic signal nodes synchronized' },
    { timestamp: '19:42:06', message: 'Emergency corridor dynamic preemption armed' },
    { timestamp: '19:42:09', message: 'Signal S01 (100ft Road) → GREEN Active' },
    { timestamp: '19:42:12', message: 'Signal S02 (CMH Road) → GREEN Active' },
  ];

  const logsToRender = events && events.length > 0 ? events : defaultLogs;

  return (
    <div
      className="w-full rounded-2xl bg-[#090C12]/95 border border-slate-700/80 p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-md h-full font-sans"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
            LIVE EVENT LOG
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-ping" />
            <span>Live Updates</span>
          </div>
          <button
            onClick={() => setActiveNavTab('audit')}
            className="text-[10px] font-mono text-sky-400 hover:text-sky-300 underline font-bold"
          >
            Full Log ↗
          </button>
        </div>
      </div>

      {/* Terminal Log Container */}
      <div className="flex-1 max-h-[140px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-white/10">
        {logsToRender.map((log, idx) => {
          const time = log.timestamp || '19:42:' + (10 + idx);
          const isActivation =
            log.message &&
            (log.message.toLowerCase().includes('corridor active') ||
              log.message.toLowerCase().includes('activated'));

          return (
            <div
              key={log.id || idx}
              className={`flex items-start gap-2.5 py-1 px-2.5 rounded-lg transition-colors ${
                isActivation
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_8px_rgba(52,211,153,0.15)]'
                  : 'text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-emerald-400/80 font-bold flex-shrink-0">
                {time}
              </span>
              <span className="truncate">
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
