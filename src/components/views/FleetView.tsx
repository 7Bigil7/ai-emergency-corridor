import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { ShieldAlert, Stethoscope, Bed, Heart, CheckCircle2 } from 'lucide-react';

export const FleetView: React.FC = () => {
  const { sim } = useSimStore();
  const { ambulance, hospital } = sim;

  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const etaFormatted = `${etaMin}m ${etaSec < 10 ? '0' : ''}${etaSec}s`;

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-700/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-black tracking-wide text-white uppercase">
              EMERGENCY FLEET & TRAUMA CAPACITY MATRIX
            </h2>
            <p className="text-xs font-mono text-slate-400">
              REAL-TIME GPS TELEMETRY • C-V2X V2N DISPATCH • BENGALURU CBD CORRIDOR
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
            1 ACTIVE UNIT EN ROUTE
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300">
            4 STANDBY UNITS
          </span>
        </div>
      </div>

      {/* Main Grid: Active Ambulance Unit (8 cols) + Hospital Trauma Receiving Center (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Active Unit Card (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs">
                AMB-001
              </span>
              <div>
                <h3 className="text-sm font-bold text-white uppercase">
                  ADVANCED LIFE SUPPORT (ALS) UNIT #108
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Vehicle: Force Traveller ICU • Reg: KA-01-EA-9021
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold uppercase animate-pulse">
              ● CRITICAL EMERGENCY
            </span>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Live Speed</span>
              <div className="text-xl font-black text-white mt-1">{ambulance.speedKmh.toFixed(0)} km/h</div>
              <span className="text-[9px] text-slate-500">Target: 60 km/h</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">ETA with AI</span>
              <div className="text-xl font-black text-emerald-400 mt-1">{etaFormatted}</div>
              <span className="text-[9px] text-slate-500">36% Time Saved</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Distance Left</span>
              <div className="text-xl font-black text-white mt-1">
                {Math.max(0, ambulance.totalDistanceKm - ambulance.distanceCoveredKm).toFixed(1)} km
              </div>
              <span className="text-[9px] text-slate-500">Total: {ambulance.totalDistanceKm.toFixed(1)} km</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06]">
              <span className="text-[10px] text-slate-400 uppercase">Signals Passed</span>
              <div className="text-xl font-black text-purple-300 mt-1">
                {Math.floor((ambulance.progressPercent / 100) * 7)} / 7
              </div>
              <span className="text-[9px] text-slate-500">Green Wave Active</span>
            </div>
          </div>

          {/* Patient Health & Paramedics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-slate-300 border-b border-white/[0.04] pb-1 font-bold">
                <span className="flex items-center gap-1.5 text-red-400">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  PATIENT VITALS (LIVE 5G TELEMETRY)
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Diagnosis:</span> <span className="text-white font-bold">Acute Coronary Syndrome (STEMI)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Heart Rate:</span> <span className="text-red-400 font-bold">118 BPM (Tachycardia)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">BP:</span> <span className="text-white font-bold">145 / 92 mmHg</span></div>
                <div className="flex justify-between"><span className="text-slate-400">SpO2:</span> <span className="text-emerald-400 font-bold">94% on High Flow O2</span></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-slate-300 border-b border-white/[0.04] pb-1 font-bold">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Stethoscope className="w-3.5 h-3.5" />
                  ONBOARD EMT CREW
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Lead Paramedic:</span> <span className="text-white font-bold">Dr. K. Sharma (ALS-Level 3)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Emergency Driver:</span> <span className="text-white font-bold">R. Natarajan (EVOC Certified)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Direct Comms:</span> <span className="text-cyan-300 font-bold">Radio Ch 12 (156.600 MHz)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">C-V2X OBU Status:</span> <span className="text-emerald-400 font-bold">LOCKED & SYNCED</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital ED Capacity Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#090C12] border border-slate-700/80 shadow-xl flex flex-col justify-between gap-4 font-mono text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Bed className="w-4 h-4" />
                </div>
                <h3 className="text-xs lg:text-sm font-black tracking-wider text-white uppercase font-sans">
                  HOSPITAL RECEPTION
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                ED PREPARED
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Receiving Hospital</span>
                <div className="text-sm font-bold text-white mt-0.5">{hospital.name}</div>
                <span className="text-[11px] text-cyan-300">{hospital.emergencyDepartment}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Trauma Beds:</span>
                  <span className="text-emerald-400 font-black">{hospital.availableTraumaBeds} / 12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reserved Trauma Bay:</span>
                  <span className="text-white font-bold">Bay #4 (ICU Ventilator Ready)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cath Lab Status:</span>
                  <span className="text-emerald-400 font-bold">ON IMMEDIATE STANDBY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">On-Call Cardiologist:</span>
                  <span className="text-white">Dr. A. Varma (Notified)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-[11px] text-emerald-300">
              Emergency entrance clearance barrier lowered. Stretcher team ready at Bay 4.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
