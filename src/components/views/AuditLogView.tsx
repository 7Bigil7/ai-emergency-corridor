import React, { useState } from 'react';
import { useSimStore } from '../../store/useSimStore';
import { Terminal, Download, Search } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { sim } = useSimStore();
  const { events } = sim;
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = events.filter((ev) => {
    if (filterType !== 'ALL' && ev.source !== filterType) return false;
    if (searchTerm && !ev.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `btp_emergency_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase">
              OPERATIONAL AUDIT TRAIL & LIVE TELEMETRY LOG
            </h2>
            <p className="text-xs font-mono text-slate-400">
              TAMPER-EVIDENT DISPATCH LOG • C-V2X EVENT STREAM • ISO 27001 AUDIT READY
            </p>
          </div>
        </div>

        {/* Export & Search Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AUDIT LOG</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1">
        {(['ALL', 'AI_CORE', 'GPS_TELEMETRY', 'SIGNAL_CONTROLLER', 'OPERATOR'] as const).map((src) => (
          <button
            key={src}
            onClick={() => setFilterType(src)}
            className={`px-3 py-1 rounded-xl border transition-all ${
              filterType === src
                ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)] font-bold'
                : 'bg-[#090C12] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Log Terminal Container */}
      <div className="w-full rounded-2xl bg-[#090C12] border border-slate-700/80 p-4 shadow-xl font-mono text-xs">
        <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {filteredLogs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">{log.timestamp}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-bold">
                  {log.source}
                </span>
                <span className="text-white font-medium">{log.message}</span>
              </div>
              <span className="text-[10px] text-slate-500">{log.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
