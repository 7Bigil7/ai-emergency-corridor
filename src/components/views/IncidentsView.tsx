import React, { useState } from 'react';
import { ACTIVE_INCIDENTS, TrafficIncident } from '../../data/incidents';
import { AlertOctagon, MapPin } from 'lucide-react';
import { IncidentInspectorModal } from '../modals/IncidentInspectorModal';

export const IncidentsView: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filteredIncidents = ACTIVE_INCIDENTS.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase">
              CBD TRAFFIC INCIDENTS & CONGESTION LOG
            </h2>
            <p className="text-xs font-mono text-slate-400">
              REAL-TIME HAZARD DETECTION • AI BOTTLENECK EVASION • FIELD CLEARANCE
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => setSelectedIncident(inc)}
            className="p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 hover:border-amber-500/50 transition-all cursor-pointer shadow-xl flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
                <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-black/80 border border-white/20">
                  {inc.code}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                  inc.severity === 'HIGH'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : inc.severity === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                }`}>
                  {inc.severity} SEVERITY
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {inc.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {inc.locationName}
              </p>
              <p className="text-xs text-slate-300 mt-2 font-sans line-clamp-2">
                {inc.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] font-mono text-[11px] flex items-center justify-between text-slate-400">
              <span>Reported: {inc.reportedTime}</span>
              <span className="text-emerald-400 font-bold">Clearance ~{inc.clearanceEtaMin}m</span>
            </div>
          </div>
        ))}
      </div>

      {selectedIncident && (
        <IncidentInspectorModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
};
