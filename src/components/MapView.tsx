import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSimStore } from '../store/useSimStore';
import {
  CORRIDOR_WAYPOINTS,
  CORRIDOR_SVG_PATH_D,
  SIGNAL_DEFINITIONS,
  getPointOnCorridor,
  AMBIENT_LANES,
} from '../utils/corridorPath';
import { Layers, Compass, Search, Plus, Minus, Bug } from 'lucide-react';

export const MapView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MAP' | 'SATELLITE' | '3D'>('3D');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('debug=1');
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylinesRef = useRef<Map<string, L.Polyline>>(new Map());

  const { sim, dispatch } = useSimStore();
  const { ambulance, signals, routes, selectedRouteId, state: corridorState } = sim;

  // Smooth 60 FPS interpolation for ambulance position
  const [renderedProgress, setRenderedProgress] = useState<number>(ambulance.progressPercent);
  const targetProgressRef = useRef<number>(ambulance.progressPercent);
  targetProgressRef.current = ambulance.progressPercent;

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRenderedProgress((prev) => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.05) return target;
        return prev + diff * 0.18; // Smooth 60fps lerp
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Ambient vehicles internal clock
  const [ambientTick, setAmbientTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbientTick((t) => (t + 1) % 1000);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Initialize 2D Leaflet Map when in MAP or SATELLITE mode
  useEffect(() => {
    if (viewMode === '3D') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = [12.9715, 77.5960];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const tileUrl =
      viewMode === 'SATELLITE'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const bounds = L.latLngBounds([
          [12.9815, 77.6185],
          [12.9612, 77.5742],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }, 150);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode]);

  // Update Route Polylines in 2D Mode
  useEffect(() => {
    if (viewMode === '3D') return;
    const map = mapInstanceRef.current;
    if (!map) return;

    routePolylinesRef.current.forEach((line) => line.remove());
    routePolylinesRef.current.clear();

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const latLngs: [number, number][] = route.waypoints.map((w) => [w.lat, w.lng]);

      let color = '#505662';
      let opacity = 0.4;
      let weight = 4;
      let dashArray: string | undefined = '4, 8';

      if (isSelected) {
        color = corridorState === 'ACTIVE' ? '#FF3B30' : '#38BDF8';
        opacity = 0.9;
        weight = 6;
        dashArray = undefined;
      }

      const polyline = L.polyline(latLngs, {
        color,
        opacity,
        weight,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylinesRef.current.set(route.id, polyline);
    });
  }, [viewMode, routes, selectedRouteId, corridorState]);

  // Compute live ambulance coordinate from the single source of truth route
  const currentRatio = renderedProgress / 100;
  const ambulanceState = getPointOnCorridor(currentRatio);

  return (
    <div className="relative w-full h-full min-h-[440px] lg:min-h-[580px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070A0F] shadow-2xl flex flex-col group select-none">
      {/* 3D Isometric Digital Twin Canvas (100% Unified Aspect Space) */}
      {viewMode === '3D' ? (
        <div
          className="relative w-full h-full flex-1 overflow-hidden transition-transform duration-300 flex items-center justify-center bg-[#070A0F]"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Unified Container ensuring background image and SVG path share identical geometry */}
          <div className="relative w-full aspect-[16/9] max-h-full max-w-full">
            {/* Background 3D City Grid Imagery */}
            <img
              src="/city_3d_bg.jpg"
              alt="3D Digital Twin City Grid"
              className="w-full h-full object-cover filter contrast-110 brightness-95 pointer-events-none"
            />

            {/* SVG Vector Layer (viewBox 0 0 1000 562.5 matching 16:9 aspect) */}
            <svg
              viewBox="0 0 1000 562.5"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Red Emergency Pulse Glow Filter */}
                <filter id="corridor-red-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Multi-Track Emergency Corridor Highway (Matching Image 2) */}
              {/* Outer Glow Halo */}
              <path
                d={CORRIDOR_SVG_PATH_D}
                fill="none"
                stroke="#EF4444"
                strokeWidth="26"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#corridor-red-glow)"
                className="opacity-45 animate-pulse"
              />

              {/* Multi-Lane Triple Red Highway Lines */}
              <path
                d={CORRIDOR_SVG_PATH_D}
                fill="none"
                stroke="#DC2626"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
              <path
                d={CORRIDOR_SVG_PATH_D}
                fill="none"
                stroke="#F87171"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-95"
              />
              <path
                d={CORRIDOR_SVG_PATH_D}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                strokeLinecap="round"
                className="opacity-90"
              />

              {/* Glowing Circular Intersection Junction Beacons */}
              {CORRIDOR_WAYPOINTS.map((wp, idx) => (
                <g key={idx}>
                  <circle cx={wp.x} cy={wp.y} r="14" fill="#EF4444" opacity="0.2" className="animate-ping" />
                  <circle cx={wp.x} cy={wp.y} r="8" fill="#EF4444" opacity="0.6" />
                  <circle cx={wp.x} cy={wp.y} r="4" fill="#FFFFFF" opacity="0.9" />
                </g>
              ))}

              {/* Debug Visualizer Mode (?debug=1) */}
              {debugMode && (
                <g className="z-50">
                  {CORRIDOR_WAYPOINTS.map((wp, idx) => (
                    <g key={idx}>
                      <circle cx={wp.x} cy={wp.y} r="6" fill="#F59E0B" stroke="#000" strokeWidth="1.5" />
                      <text x={wp.x + 8} y={wp.y + 4} fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        W{idx} ({wp.x}, {wp.y})
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </svg>

            {/* Ambient Vehicles moving on cross avenues */}
            {AMBIENT_LANES.map((lane, lIdx) => {
              const ambProgress = (ambientTick * lane.speed + lIdx * 0.33) % 1.0;
              const ambPt = getPointOnCorridor(ambProgress, lane.waypoints);
              return (
                <div
                  key={lane.id}
                  className="absolute z-15 pointer-events-none transition-all duration-100 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(ambPt.position.x / 1000) * 100}%`,
                    top: `${(ambPt.position.y / 562.5) * 100}%`,
                  }}
                >
                  <div
                    className="w-3.5 h-2 rounded-sm bg-cyan-400/80 border border-white/60 shadow-[0_0_6px_#38BDF8]"
                    style={{ transform: `rotate(${ambPt.headingDeg + 90}deg)` }}
                  />
                </div>
              );
            })}

            {/* Traffic Signal Posts (S01 to S07) placed strictly along this route */}
            {SIGNAL_DEFINITIONS.map((def, idx) => {
              const sigPt = getPointOnCorridor(def.distanceRatio);
              const sigX = sigPt.position.x + def.sideOffset.x;
              const sigY = sigPt.position.y + def.sideOffset.y;

              const sig = signals[idx] || { id: def.id, lamp: 'GREEN', isFaulty: false };
              const passed = currentRatio >= def.distanceRatio;
              const approaching = !passed && currentRatio >= def.distanceRatio - 0.14;

              const isGreen = corridorState === 'ACTIVE' && (passed || approaching);
              const isPrepare = corridorState === 'ACTIVE' && !isGreen && currentRatio >= def.distanceRatio - 0.22;
              const isRed = !isGreen && !isPrepare;

              return (
                <div
                  key={def.id}
                  onClick={() => dispatch({ type: 'TOGGLE_SIGNAL_FAULT', signalId: sig.id })}
                  className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer transition-all transform hover:scale-110 group"
                  style={{
                    left: `${(sigX / 1000) * 100}%`,
                    top: `${(sigY / 562.5) * 100}%`,
                  }}
                  title={`Signal ${def.id} (${def.name}) - Click to toggle FAULT`}
                >
                  {/* Signal Tag */}
                  <div className="px-1.5 py-0.5 rounded bg-black/90 border border-white/20 text-[9px] font-mono font-black text-white shadow-md text-center mb-1">
                    {def.id}
                  </div>

                  {/* Vertical 3-Lamp Traffic Signal Housing */}
                  <div className="w-4 h-10 rounded-md bg-black/95 border border-slate-700 p-0.5 flex flex-col items-center justify-between shadow-xl">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRed ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' : 'bg-rose-950/60'
                      }`}
                    />
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isPrepare ? 'bg-amber-400 shadow-[0_0_8px_#FBBF24]' : 'bg-amber-950/60'
                      }`}
                    />
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isGreen ? 'bg-emerald-400 shadow-[0_0_10px_#34D399]' : 'bg-emerald-950/60'
                      }`}
                    />
                  </div>

                  {/* Mounting Post Stem */}
                  <div className="w-0.5 h-3 bg-slate-600 mx-auto" />
                </div>
              );
            })}

            {/* Destination Beacon: Victoria Hospital */}
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer flex flex-col items-center"
              style={{
                left: `${(940 / 1000) * 100}%`,
                top: `${(50 / 562.5) * 100}%`,
              }}
            >
              <div className="px-2 py-0.5 rounded-md bg-red-600/90 border border-red-400 text-white font-mono text-[10px] font-black tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                <span>✚</span>
                <span>Victoria Hospital</span>
              </div>
              <div className="relative w-8 h-8 flex items-center justify-center mt-1">
                <span className="absolute w-8 h-8 rounded-full border border-red-500/80 animate-ping" />
                <span className="absolute w-5 h-5 rounded-full bg-red-500/30 border border-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444]" />
              </div>
            </div>

            {/* Realistic 3D Isometric Ambulance Vehicle Sprite (Transparent PNG, Northeast-Facing) */}
            <div
              className="absolute z-30 -translate-x-1/2 -translate-y-[62%] transition-all duration-75 pointer-events-none flex flex-col items-center"
              style={{
                left: `${(ambulanceState.position.x / 1000) * 100}%`,
                top: `${(ambulanceState.position.y / 562.5) * 100}%`,
              }}
            >
              {/* AMB-001 Floating Badge */}
              <div className="px-2 py-0.5 rounded bg-black/90 border border-red-500/90 text-[9px] font-mono font-black text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] flex items-center gap-1.5 mb-0.5 whitespace-nowrap">
                <span className="text-white">AMB-001</span>
                <span className="text-red-400 text-[8px] font-extrabold tracking-wider">CRITICAL</span>
              </div>

              {/* Realistic 3D Isometric Vehicle Model with Lightbar and Emergency Aura */}
              <div className="relative flex items-center justify-center">
                {/* Dynamic Ground Shadow on Asphalt */}
                <div className="absolute -bottom-1 w-14 h-6 rounded-full bg-black/80 blur-[2.5px] pointer-events-none" />

                {/* Forward Headlight Cone Beam */}
                <div className="absolute -top-3 -right-6 w-14 h-8 bg-gradient-to-r from-amber-200/40 via-yellow-100/20 to-transparent blur-[2px] transform rotate-[-25deg] pointer-events-none" />

                {/* Pulsing Emergency Red Halo */}
                <div className="absolute w-16 h-16 rounded-full bg-red-500/25 blur-md animate-pulse pointer-events-none" />

                {/* 3D Realistic Transparent Ambulance Sprite */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <img
                    src="/ambulance_3d_sprite.png"
                    alt="Real 3D Ambulance Vehicle"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                  />
                  {/* Flashing Roof Siren Beacon Strobes */}
                  <div className="absolute top-2.5 right-7 w-2.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#38BDF8] animate-ping" />
                  <div className="absolute top-2 left-6 w-2.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Perspective Street Names */}
            <div className="absolute left-[6%] bottom-[12%] px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-slate-300 pointer-events-none">
              Indiranagar
            </div>
            <div className="absolute left-[36%] top-[54%] px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-slate-300 pointer-events-none">
              100ft Road / CMH
            </div>
            <div className="absolute right-[22%] top-[34%] px-2 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-slate-300 pointer-events-none">
              Brigade Expressway
            </div>
          </div>
        </div>
      ) : (
        /* 2D Leaflet OSM Map Container */
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />
      )}

      {/* Top Left View Switcher (Map | Satellite | 3D View) */}
      <div className="absolute top-3.5 left-3.5 z-40 flex items-center gap-1.5 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 font-mono text-xs shadow-xl">
        {(['MAP', 'SATELLITE', '3D'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === mode
                ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {mode === 'MAP' ? 'Map' : mode === 'SATELLITE' ? 'Satellite' : '3D View'}
          </button>
        ))}
      </div>

      {/* Top Left Floating Legend */}
      <div className="absolute top-16 left-3.5 z-40 hidden sm:flex flex-col gap-2 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[10px] text-slate-300 shadow-xl pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-xs">🚑</span>
          <span className="text-white font-medium">Ambulance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold text-xs">✚</span>
          <span className="text-white font-medium">Hospital</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-1 rounded bg-red-500 shadow-[0_0_6px_#EF4444]" />
          <span className="text-white font-medium">Active Corridor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          <span className="text-white font-medium">Traffic Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-1 rounded bg-sky-500" />
          <span className="text-white font-medium">Normal Traffic</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sky-400 text-xs">🚗</span>
          <span className="text-white font-medium">Other Vehicles</span>
        </div>
      </div>

      {/* Top Right Controls (Debug Toggle, Search, Compass, Layers) */}
      <div className="absolute top-3.5 right-3.5 z-40 flex items-center gap-2">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
            debugMode
              ? 'bg-amber-500/30 border-amber-500 text-amber-300'
              : 'bg-black/80 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Waypoint Debug Overlay (?debug=1)"
        >
          <Bug className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Search junctions"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Orient Compass"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={() => {}}
          className="p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Map Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left Compass Rose */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col items-center justify-center w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 shadow-xl font-mono text-[9px] font-black">
        <span className="text-red-400 leading-none">▲</span>
        <span className="text-white leading-none">N</span>
      </div>

      {/* Bottom Right Zoom Buttons */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1 p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
          className="p-2 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-full h-[1px] bg-white/10" />
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.85))}
          className="p-2 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
