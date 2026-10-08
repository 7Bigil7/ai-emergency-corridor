import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { Heart, Activity, ShieldAlert, Navigation, Gauge, Clock, X, UserCheck, Stethoscope } from 'lucide-react';

interface AmbulanceInspectorModalProps {
  onClose: () => void;
}

export const AmbulanceInspectorModal: React.FC<AmbulanceInspectorModalProps> = ({ onClose }) => {
  const { sim } = useSimStore();
  const { ambulance, state, hospital } = sim;

  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const etaFormatted = `${etaMin}m ${etaSec < 10 ? '0' : ''}${etaSec}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#090C12] border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4 text-[#F2F4F7] font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="amb-inspector-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="amb-inspector-title" className="text-base font-black tracking-wide uppercase text-white">
                AMBULANCE TELEMETRY & PATIENT DOSSIER
              </h3>
              <p className="text-xs font-mono text-slate-400">
                UNIT: {ambulance.callSign || 'AMB-001'} • REG: KA-01-EA-9021 • DISPATCHED VIA 108 EOC
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

        {/* Priority Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center justify-between">
            <span className="text-slate-300">PRIORITY LEVEL</span>
            <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold uppercase text-[10px]">
              CRITICAL (PRIORITY 1)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-slate-300">CORRIDOR STATE</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              state === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
            }`}>
              {state}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-slate-300">PARAMEDIC TEAM</span>
            <span className="text-sky-300 font-bold">DR. K. SHARMA (EMT-A)</span>
          </div>
        </div>

        {/* Dynamic Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>Speed</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{ambulance.speedKmh.toFixed(0)} km/h</div>
            <div className="text-[9px] text-slate-500">Target: 60 km/h</div>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live ETA</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">{etaFormatted}</div>
            <div className="text-[9px] text-slate-500">Normal: 8m 42s</div>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Distance Left</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              {Math.max(0, ambulance.totalDistanceKm - ambulance.distanceCoveredKm).toFixed(1)} km
            </div>
            <div className="text-[9px] text-slate-500">Total: {ambulance.totalDistanceKm.toFixed(1)} km</div>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Route Progress</span>
            </div>
            <div className="text-lg font-black text-purple-300 mt-1">
              {Math.round(ambulance.progressPercent)}%
            </div>
            <div className="text-[9px] text-slate-500">Cleared 7 Signals</div>
          </div>
        </div>

        {/* Patient Vitals & Hospital ED Coordination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          {/* Patient Card */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-white/[0.04] pb-1.5 font-bold">
              <span className="flex items-center gap-1.5 text-red-400">
                <Heart className="w-3.5 h-3.5 fill-current" />
                PATIENT MEDICAL STATUS
              </span>
              <span className="text-[10px] text-amber-400">VITALS LIVE</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-400">Condition:</span> <span className="text-white font-bold">Acute Coronary Syndrome (STEMI)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Heart Rate:</span> <span className="text-red-400 font-bold">118 BPM (Elevated)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Blood Pressure:</span> <span className="text-white font-bold">145 / 92 mmHg</span></div>
              <div className="flex justify-between"><span className="text-slate-400">SpO2 (Oxygen):</span> <span className="text-emerald-400 font-bold">94% on High-Flow O2</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Defibrillator:</span> <span className="text-emerald-400 font-bold">STANDBY • PADS ATTACHED</span></div>
            </div>
          </div>

          {/* Destination Hospital ED */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-white/[0.04] pb-1.5 font-bold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Stethoscope className="w-3.5 h-3.5" />
                DESTINATION HOSPITAL
              </span>
              <span className="text-[10px] text-emerald-400">ED NOTIFIED</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-400">Hospital:</span> <span className="text-cyan-300 font-bold">{hospital.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Receiving Dept:</span> <span className="text-white font-bold">{hospital.emergencyDepartment}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Trauma Beds:</span> <span className="text-emerald-400 font-bold">{hospital.availableTraumaBeds} Available (Bay #4 Reserved)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ED Radio Freq:</span> <span className="text-white font-bold">{hospital.contactFreq}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Cath Lab Status:</span> <span className="text-emerald-400 font-bold">PREPPED & ON STANDBY</span></div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry Link: Encrypted 5G C-V2X (Packet Loss: 0.0%)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
