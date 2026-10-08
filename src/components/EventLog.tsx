import React, { useState } from 'react';
import { useSimStore } from '../store/useSimStore';
import { Terminal } from 'lucide-react';

export const EventLog: React.FC = () => {
  const { sim } = useSimStore();
  const { events } = sim;
  const [filter, setFilter] = useState<'ALL' | 'ACTION' | 'SIGNAL' | 'AI_OPTIMIZATION' | 'ALERT'>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filter === 'ALL') return true;
    return e.type === filter;
  });

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'ACTION':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SIGNAL':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'AI_OPTIMIZATION':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'ALERT':
      case 'OVERRIDE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col gap-2.5 border border-white/10 h-[190px] lg:h-[210px]">
      {/* Log Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            OPERATOR AUDIT & EVENT LOG
          </span>
          <span className="text-[10px] text-[#8A919E] hidden sm:inline">
            ({filteredEvents.length} events recorded)
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[10px]">
          {(['ALL', 'ACTION', 'SIGNAL', 'AI_OPTIMIZATION', 'ALERT'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded transition-all ${
                filter === cat
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-black/30 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'AI_OPTIMIZATION' ? 'AI' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Reader ARIA Live Region for Accessibility */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {events[0]?.ariaAnnouncement || events[0]?.message}
      </div>

      {/* Log entries table / feed */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs custom-scrollbar">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="flex items-start gap-2.5 py-1 px-2 rounded bg-black/30 hover:bg-black/50 border border-white/[0.03] transition-colors"
          >
            <span className="text-[#8A919E] text-[10px] shrink-0">{evt.timestamp}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 border ${getBadgeForType(
                evt.type
              )}`}
            >
              {evt.type}
            </span>
            <span className="text-[10px] text-slate-400 font-bold shrink-0">
              [{evt.source}]
            </span>
            <span className="text-slate-200 text-[11px] leading-tight flex-1">
              {evt.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
