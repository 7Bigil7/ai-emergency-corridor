import React from 'react';
import { useSimStore } from '../../store/useSimStore';
import { GitFork, X } from 'lucide-react';

interface RouteComparisonModalProps {
  onClose: () => void;
}

export const RouteComparisonModal: React.FC<RouteComparisonModalProps> = ({ onClose }) => {
  const { sim, dispatch } = useSimStore();
  const { routes, selectedRouteId } = sim;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#090C12] border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4 text-[#F2F4F7] font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 id="route-modal-title" className="text-base font-black tracking-wide uppercase text-white">
                MULTI-MODAL ROUTE SELECTION MATRIX
              </h3>
              <p className="text-xs font-mono text-slate-400">
                A* HEURISTIC + REAL-TIME C-V2X SIGNAL COST ALGORITHM
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

        {/* 3 Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const isRec = route.isRecommended;

            return (
              <div
                key={route.id}
                onClick={() => dispatch({ type: 'SELECT_ROUTE', routeId: route.id })}
                className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white uppercase text-[11px]">{route.id.replace('_', ' ').toUpperCase()}</span>
                    {isRec && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                        AI RECOMMENDED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans font-medium mb-2.5">
                    {route.name}
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-white/[0.04] pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="text-white font-bold">{route.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Normal Time:</span>
                    <span className="text-slate-300">{(route.normalTravelTimeSec / 60).toFixed(1)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Congestion:</span>
                    <span className={`font-bold ${route.congestion > 0.6 ? 'text-red-400' : route.congestion > 0.45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Math.round(route.congestion * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signals:</span>
                    <span className="text-white">{route.signalCount} junctions</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Cost Index: {route.cost}</span>
                  <button
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isSelected ? 'ACTIVE' : 'SELECT'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs font-mono">
          <span className="text-slate-400 text-[11px]">
            Route B delivers optimal clearance geometry with 7 coordinated V2I signal controllers.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors shadow-lg"
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};
