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
import { ACTIVE_INCIDENTS, TrafficIncident } from '../data/incidents';
import {
  Layers,
  Search,
  Plus,
  Minus,
  SlidersHorizontal,
  Navigation as NavIcon,
} from 'lucide-react';
import { AmbulanceInspectorModal } from './modals/AmbulanceInspectorModal';
import { SignalInspectorModal } from './modals/SignalInspectorModal';
import { IncidentInspectorModal } from './modals/IncidentInspectorModal';
import { RouteComparisonModal } from './modals/RouteComparisonModal';

export const MapView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MAP' | 'SATELLITE' | '3D'>('3D');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [debugMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('debug=1');
  });

  // Layer Visibility Toggles
  const [layerTraffic, setLayerTraffic] = useState<boolean>(true);
  const [layerSignals, setLayerSignals] = useState<boolean>(true);
  const [layerCorridor, setLayerCorridor] = useState<boolean>(true);
  const [layerIncidents, setLayerIncidents] = useState<boolean>(true);
  const [layerAltRoutes, setLayerAltRoutes] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Inspector Modal States
  const [inspectAmbulance, setInspectAmbulance] = useState<boolean>(false);
  const [inspectSignalId, setInspectSignalId] = useState<string | null>(null);
  const [inspectIncident, setInspectIncident] = useState<TrafficIncident | null>(null);
  const [inspectRoutes, setInspectRoutes] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylinesRef = useRef<Map<string, L.Polyline>>(new Map());

  const { sim } = useSimStore();
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
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[620px] rounded-2xl overflow-hidden border border-slate-800/90 bg-[#05070B] shadow-2xl flex flex-col group select-none">
      {/* 3D Isometric Digital Twin Canvas (100% Unified Aspect Space) */}
      {viewMode === '3D' ? (
        <div
          className="relative w-full h-full flex-1 overflow-hidden transition-transform duration-300 flex items-center justify-center bg-[#05070B]"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Unified Container ensuring background image and SVG path share identical geometry */}
          <div className="relative w-full aspect-[16/9] max-h-full max-w-full">
            {/* Background 3D City Grid Imagery */}
            <img
              src="/city_3d_bg.jpg"
              alt="3D Digital Twin City Grid"
              className="w-full h-full object-cover filter contrast-115 brightness-95 pointer-events-none"
            />

            {/* SVG Vector Layer (viewBox 0 0 1000 562.5 matching 16:9 aspect) */}
            <svg
              viewBox="0 0 1000 562.5"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Red Emergency Pulse Glow Filter */}
                <filter id="corridor-red-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="9" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="green-lamp-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Optional Alternative Routes Layer (Route A & Route C) */}
              {layerAltRoutes && (
                <g className="opacity-70">
                  {/* Route A (South Arterial via MG Rd / Richmond) */}
                  <path
                    d="M 235 555 C 380 560, 600 480, 720 360 C 820 260, 840 180, 825 118"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeDasharray="6 6"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => setInspectRoutes(true)}
                  />
                  {/* Route C (North Bypass via Halasuru) */}
                  <path
                    d="M 235 555 C 180 400, 300 240, 520 150 C 680 90, 760 95, 825 118"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3.5"
                    strokeDasharray="4 8"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => setInspectRoutes(true)}
                  />
                </g>
              )}

              {/* Traffic Congestion Heatmap Segments */}
              {layerTraffic && (
                <g className="opacity-45">
                  <path
                    d="M 320 480 L 470 345"
                    stroke="#EF4444"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                  <path
                    d="M 545 275 L 690 175"
                    stroke="#F59E0B"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                  <path
                    d="M 690 175 L 825 118"
                    stroke="#10B981"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="opacity-60"
                  />
                </g>
              )}

              {/* Emergency Cleared Corridor Layer */}
              {layerCorridor && (
                <>
                  {/* Dual Neon Red Track Lines matching Reference Image */}
                  {/* Outer Red Ambient Halo */}
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#corridor-red-glow)"
                    className="opacity-40 animate-pulse"
                  />

                  {/* Dual Glowing Red Corridor Rails */}
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FF3B30"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FFA39E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-95"
                  />
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="opacity-85"
                  />
                </>
              )}

              {/* Intersection Junction Beacons */}
              {CORRIDOR_WAYPOINTS.map((wp, idx) => {
                const nodeRatio = idx / (CORRIDOR_WAYPOINTS.length - 1);
                const isPassed = currentRatio >= nodeRatio;
                const isNext = !isPassed && currentRatio >= nodeRatio - 0.16;

                const beaconColor = isPassed
                  ? '#10B981' // Green passed
                  : isNext
                  ? '#F59E0B' // Yellow prepare
                  : '#EF4444'; // Red upcoming

                return (
                  <g key={idx}>
                    <circle cx={wp.x} cy={wp.y} r="14" fill={beaconColor} opacity="0.25" className={isNext ? 'animate-ping' : ''} />
                    <circle cx={wp.x} cy={wp.y} r="7" fill={beaconColor} opacity="0.75" />
                    <circle cx={wp.x} cy={wp.y} r="3" fill="#FFFFFF" opacity="0.95" />
                  </g>
                );
              })}

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
                    className="w-3.5 h-2 rounded-sm bg-cyan-400/90 border border-white/70 shadow-[0_0_8px_#38BDF8]"
                    style={{ transform: `rotate(${ambPt.headingDeg + 90}deg)` }}
                  />
                </div>
              );
            })}

            {/* Active Traffic Incident Markers */}
            {layerIncidents &&
              ACTIVE_INCIDENTS.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setInspectIncident(inc)}
                  className="absolute z-25 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform transform hover:scale-125 group"
                  style={{
                    left: `${(inc.coords.x / 1000) * 100}%`,
                    top: `${(inc.coords.y / 562.5) * 100}%`,
                  }}
                  title={`Incident ${inc.code}: ${inc.title} - Click for details`}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400 animate-ping" />
                    <div className="w-5 h-5 rounded-full bg-amber-500 border border-white text-black font-black text-[10px] flex items-center justify-center shadow-[0_0_12px_#F59E0B]">
                      !
                    </div>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-black/90 border border-amber-400 text-[9px] font-mono text-amber-300 whitespace-nowrap shadow-xl z-30">
                    {inc.code}: {inc.title}
                  </div>
                </div>
              ))}

            {/* Traffic Signal Posts (S01, S03, S06, S04, S05, S07) Matching Reference Image */}
            {layerSignals &&
              SIGNAL_DEFINITIONS.map((def, idx) => {
                const sigPt = getPointOnCorridor(def.distanceRatio);
                const sigX = sigPt.position.x + def.sideOffset.x;
                const sigY = sigPt.position.y + def.sideOffset.y;

                const sig = signals[idx] || { id: def.id, lamp: 'RED', isFaulty: false };
                const isGreen = sig.lamp === 'GREEN';
                const isYellow = sig.lamp === 'YELLOW';
                const isRed = sig.lamp === 'RED';
                const isFault = sig.isFaulty;

                return (
                  <div
                    key={def.id}
                    onClick={() => setInspectSignalId(def.id)}
                    className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer flex items-center gap-1.5 transition-all transform hover:scale-110 group"
                    style={{
                      left: `${(sigX / 1000) * 100}%`,
                      top: `${(sigY / 562.5) * 100}%`,
                    }}
                    title={`Signal ${def.id} (${def.name}) - Status: ${sig.lamp} - Click to inspect`}
                  >
                    {/* Vertical 3-Lamp Traffic Signal Housing */}
                    <div className="relative flex flex-col items-center">
                      {/* Radial green aura glow if green */}
                      {isGreen && (
                        <div className="absolute top-4 w-10 h-10 -translate-y-1/2 rounded-full bg-emerald-400/35 blur-sm animate-pulse pointer-events-none" />
                      )}

                      <div className="w-4 h-10 rounded-md bg-black/95 border border-slate-700 p-0.5 flex flex-col items-center justify-between shadow-2xl relative z-10">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isRed ? 'bg-rose-500 shadow-[0_0_10px_#F43F5E]' : isFault ? 'bg-amber-600 animate-pulse' : 'bg-rose-950/60'
                          }`}
                        />
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isYellow ? 'bg-amber-400 shadow-[0_0_12px_#FBBF24]' : 'bg-amber-950/60'
                          }`}
                        />
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isGreen ? 'bg-emerald-400 shadow-[0_0_15px_#34D399]' : 'bg-emerald-950/60'
                          }`}
                        />
                      </div>
                      {/* Mounting Post Stem */}
                      <div className="w-0.5 h-3 bg-slate-500 mx-auto" />
                    </div>

                    {/* Dark Pill Signal Badge (S01, S03, etc.) Beside Post */}
                    <div className="px-2 py-0.5 rounded-full bg-black/90 border border-white/30 text-[10px] font-mono font-black text-white shadow-xl whitespace-nowrap">
                      {def.id}
                    </div>
                  </div>
                );
              })}

            {/* Destination Hospital Marker: Pulsing Red Target Ripples & Victoria Hospital Badge */}
            <div
              onClick={() => setInspectAmbulance(true)}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer flex flex-col items-center group transition-transform hover:scale-105"
              style={{
                left: `${(825 / 1000) * 100}%`,
                top: `${(118 / 562.5) * 100}%`,
              }}
              title="Victoria Hospital Emergency Department - Click to inspect Trauma ED"
            >
              {/* Victoria Hospital Red Pill Badge */}
              <div className="px-3 py-1 rounded-full bg-[#E11D48] border border-rose-300 text-white font-mono text-[11px] font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(225,29,72,0.8)]">
                <span className="w-4 h-4 rounded-full bg-white text-[#E11D48] flex items-center justify-center font-black text-xs leading-none">
                  ✚
                </span>
                <span>Victoria Hospital</span>
              </div>

              {/* Concentric Pulsing Red Ground Target Rings */}
              <div className="relative w-16 h-16 flex items-center justify-center mt-1">
                <span className="absolute w-16 h-16 rounded-full border-2 border-red-500/80 animate-ping opacity-60" />
                <span className="absolute w-11 h-11 rounded-full border border-red-400/90 animate-pulse" />
                <span className="absolute w-6 h-6 rounded-full bg-red-600/40 border border-red-400 shadow-[0_0_12px_#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_#EF4444]" />
              </div>
            </div>

            {/* Realistic 3D Isometric Ambulance Vehicle Sprite (Clickable) */}
            <div
              onClick={() => setInspectAmbulance(true)}
              className="absolute z-30 -translate-x-1/2 -translate-y-[62%] transition-all duration-75 cursor-pointer flex flex-col items-center group"
              style={{
                left: `${(ambulanceState.position.x / 1000) * 100}%`,
                top: `${(ambulanceState.position.y / 562.5) * 100}%`,
              }}
              title="Ambulance AMB-001 - Click to inspect patient vitals and telemetry"
            >
              {/* AMB-001 / CRITICAL Floating Badge matching Reference Image */}
              <div className="px-3 py-1 rounded-xl bg-black/95 border border-red-500/90 text-center shadow-[0_0_18px_rgba(239,68,68,0.8)] font-mono leading-tight mb-1 group-hover:scale-105 transition-transform">
                <div className="font-bold text-white text-[10px] tracking-wider">AMB-001</div>
                <div className="font-black text-red-500 text-[9px] tracking-widest">CRITICAL</div>
              </div>

              {/* 3D Realistic Vehicle Model with Forward Lighting FX */}
              <div className="relative flex items-center justify-center">
                {/* Dynamic Ground Shadow on Asphalt */}
                <div className="absolute bottom-1 w-20 h-7 rounded-full bg-black/90 blur-[3px] pointer-events-none" />

                {/* Forward Headlight Cone Beam projecting towards upper right */}
                <div className="absolute -top-1 -right-7 w-20 h-8 bg-gradient-to-r from-amber-100/40 via-yellow-100/20 to-transparent blur-[2px] transform rotate-[-30deg] pointer-events-none" />

                {/* Pulsing Emergency Red Halo Underglow */}
                <div className="absolute w-20 h-20 rounded-full bg-red-500/25 blur-md animate-pulse pointer-events-none" />

                {/* 3D Realistic Transparent Ambulance Sprite (Heading Forward Northeast) */}
                <div className="relative w-22 h-22 flex items-center justify-center">
                  <img
                    src="/ambulance_3d_sprite.png"
                    alt="Real 3D Ambulance Vehicle"
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)]"
                  />
                  {/* Flashing Roof Siren Beacon Strobes (aligned on top-right cabin bar) */}
                  <div className="absolute top-2.5 right-6 w-3 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_#38BDF8] animate-ping" />
                  <div className="absolute top-2 right-10 w-3 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#EF4444] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Perspective Street Names on Asphalt (Matching Real Road Positions) */}
            <div className="absolute left-[16%] bottom-[4%] px-3 py-1 rounded-xl bg-black/80 border border-white/20 text-[10px] font-mono text-white font-bold pointer-events-none shadow-xl">
              Indiranagar
            </div>
            <div className="absolute right-[22%] bottom-[32%] px-3 py-1 rounded-xl bg-black/80 border border-white/20 text-[10px] font-mono text-white font-bold pointer-events-none shadow-xl">
              100ft Road
            </div>
            <div className="absolute right-[16%] top-[34%] px-3 py-1 rounded-xl bg-black/80 border border-white/20 text-[10px] font-mono text-white font-bold pointer-events-none shadow-xl transform rotate-[-35deg]">
              CMH Road
            </div>
          </div>
        </div>
      ) : (
        /* 2D Leaflet OSM Map Container */
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />
      )}

      {/* Top Left View Switcher (Map | Satellite | 3D View) Matching Reference Image */}
      <div className="absolute top-3.5 left-3.5 z-40 flex items-center gap-1.5 p-1 rounded-xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 font-mono text-xs shadow-2xl">
        {(['MAP', 'SATELLITE', '3D'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === mode
                ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {mode === 'MAP' ? 'Map' : mode === 'SATELLITE' ? 'Satellite' : '3D View'}
          </button>
        ))}
      </div>

      {/* Left Floating Legend Card Exactly Matching Reference Image */}
      <div className="absolute top-16 left-3.5 z-40 hidden sm:flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 font-mono text-[11px] text-slate-200 shadow-2xl pointer-events-none">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🚑</span>
          <span className="font-semibold text-white">Ambulance</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
            ✚
          </span>
          <span className="font-semibold text-white">Hospital</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
          <span className="font-semibold text-white">Active Corridor</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-base">🚦</span>
          <span className="font-semibold text-white">Traffic Signal</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8]" />
          <span className="font-semibold text-white">Normal Traffic</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-base">🚗</span>
          <span className="font-semibold text-white">Other Vehicles</span>
        </div>
      </div>

      {/* Top Right Controls (Search, Navigation/Compass, Layers) Matching Reference Image */}
      <div className="absolute top-3.5 right-3.5 z-40 flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setInspectRoutes(true)}
          className="p-2.5 rounded-xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow-xl"
          title="Search Alternative Routes"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Orient / Recenter */}
        <button
          onClick={() => setZoomLevel(1)}
          className="p-2.5 rounded-xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow-xl"
          title="Recenter Map View"
        >
          <NavIcon className="w-4 h-4" />
        </button>

        {/* Layers */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all shadow-xl ${
              showLayerMenu
                ? 'bg-sky-600 text-white border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                : 'bg-[#090C12]/90 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title="Configure Map Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Layer Popover Menu */}
          {showLayerMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#090C12]/95 border border-slate-700/80 p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2 font-mono text-xs z-50 animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase border-b border-white/[0.06] pb-1.5 flex items-center justify-between">
                <span>TACTICAL MAP LAYERS</span>
                <SlidersHorizontal className="w-3 h-3 text-sky-400" />
              </div>
              <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                <span>Emergency Corridor</span>
                <input
                  type="checkbox"
                  checked={layerCorridor}
                  onChange={(e) => setLayerCorridor(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                <span>Traffic Signals (S01-S07)</span>
                <input
                  type="checkbox"
                  checked={layerSignals}
                  onChange={(e) => setLayerSignals(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                <span>Traffic Congestion Heatmap</span>
                <input
                  type="checkbox"
                  checked={layerTraffic}
                  onChange={(e) => setLayerTraffic(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                <span>Active Incidents</span>
                <input
                  type="checkbox"
                  checked={layerIncidents}
                  onChange={(e) => setLayerIncidents(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white">
                <span>Alternative Routes (A & C)</span>
                <input
                  type="checkbox"
                  checked={layerAltRoutes}
                  onChange={(e) => setLayerAltRoutes(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-0"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Left Compass Rose Matching Reference Image */}
      <div className="absolute bottom-4 left-4 z-40 flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 shadow-2xl font-mono text-[10px] font-black">
        <span className="text-red-400 leading-none">▲</span>
        <span className="text-white leading-none">N</span>
      </div>

      {/* Bottom Right Zoom Buttons (+ / -) Matching Reference Image */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-1 p-1 rounded-2xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
          className="p-2.5 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="w-full h-[1px] bg-white/10" />
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.85))}
          className="p-2.5 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Inspectors */}
      {inspectAmbulance && (
        <AmbulanceInspectorModal onClose={() => setInspectAmbulance(false)} />
      )}
      {inspectSignalId && (
        <SignalInspectorModal
          signalId={inspectSignalId}
          onClose={() => setInspectSignalId(null)}
        />
      )}
      {inspectIncident && (
        <IncidentInspectorModal
          incident={inspectIncident}
          onClose={() => setInspectIncident(null)}
        />
      )}
      {inspectRoutes && (
        <RouteComparisonModal onClose={() => setInspectRoutes(false)} />
      )}
    </div>
  );
};
