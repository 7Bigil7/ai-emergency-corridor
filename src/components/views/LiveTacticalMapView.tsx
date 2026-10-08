import React from 'react';
import { MapView } from '../MapView';
import { useSimStore } from '../../store/useSimStore';
import { ShieldAlert, Gauge, Clock, Navigation } from 'lucide-react';

export const LiveTacticalMapView: React.FC = () => {
  const { sim } = useSimStore();
  const { ambulance, state } = sim;

  const totalEtaSec = Math.max(0, Math.round(ambulance.etaWithAiSec));
  const etaMin = Math.floor(totalEtaSec / 60);
  const etaSec = totalEtaSec % 60;
  const etaFormatted = `${etaMin}m ${etaSec < 10 ? '0' : ''}${etaSec}s`;

  return (
    <div className="w-full flex flex-col gap-3 font-sans select-none relative">
      {/* Dominant Full-Screen Tactical Map */}
      <div className="w-full min-h-[640px] lg:min-h-[720px] rounded-2xl overflow-hidden relative shadow-2xl">
        <MapView />

        {/* Floating Top Telemetry HUD Overlay */}
        <div className="absolute top-16 right-4 z-40 hidden md:flex items-center gap-3 p-3 rounded-2xl bg-[#090C12]/90 border border-slate-700/80 backdrop-blur-md shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-2 border-r border-white/[0.08] pr-3">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold">{ambulance.callSign || 'AMB-001'}</span>
              <span className="text-[10px] text-red-400 font-bold uppercase">{state}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-r border-white/[0.08] pr-3">
            <Gauge className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-white font-bold">{ambulance.speedKmh.toFixed(0)} km/h</span>
              <span className="text-[10px] text-slate-400">SPEED</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-r border-white/[0.08] pr-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-emerald-400 font-bold">{etaFormatted}</span>
              <span className="text-[10px] text-slate-400">ETA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-white font-bold">
                {Math.max(0, ambulance.totalDistanceKm - ambulance.distanceCoveredKm).toFixed(1)} km
              </span>
              <span className="text-[10px] text-slate-400">REMAINING</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
