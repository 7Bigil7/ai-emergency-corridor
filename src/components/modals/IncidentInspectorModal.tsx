import React from 'react';
import { TrafficIncident } from '../../data/incidents';
import { AlertOctagon, MapPin, X, CheckCircle2 } from 'lucide-react';

interface IncidentInspectorModalProps {
  incident: TrafficIncident;
  onClose: () => void;
}

export const IncidentInspectorModal: React.FC<IncidentInspectorModalProps> = ({ incident, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[#090C12] border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4 text-[#F2F4F7] font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              incident.severity === 'HIGH'
                ? 'bg-red-600/20 text-red-400 border-red-500/40'
                : incident.severity === 'MEDIUM'
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                : 'bg-sky-600/20 text-sky-400 border-sky-500/40'
            }`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="incident-modal-title" className="text-base font-black tracking-wide uppercase text-white">
                TRAFFIC INCIDENT: {incident.code}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {incident.title} • REPORTED AT {incident.reportedTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">SEVERITY</span>
            <span className={`font-black uppercase text-xs mt-0.5 ${
              incident.severity === 'HIGH' ? 'text-red-400' : incident.severity === 'MEDIUM' ? 'text-amber-400' : 'text-sky-400'
            }`}>
              {incident.severity} PRIORITY
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">STATUS</span>
            <span className="text-cyan-300 font-bold uppercase text-xs mt-0.5">
              {incident.status}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">CLEARANCE ETA</span>
            <span className="text-emerald-400 font-bold uppercase text-xs mt-0.5">
              ~{incident.clearanceEtaMin} MIN
            </span>
          </div>
        </div>

        {/* Location & Description */}
        <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>{incident.locationName}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {incident.description}
          </p>
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Impact Radius:</span>
            <span className="text-white font-bold">{incident.impactRadiusM} meters</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Lanes Affected:</span>
            <span className="text-amber-300 font-bold">{incident.affectedLanes}</span>
          </div>
        </div>

        {/* AI Action Taken */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-400 uppercase text-[10px]">AI CORRIDOR ADJUSTMENT</div>
            <p className="text-[11px] text-emerald-200/90 font-sans mt-0.5">
              The AI routing engine evaluated this bottleneck and prioritized the central boulevard green wave to maintain AMB-001 continuous speed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
