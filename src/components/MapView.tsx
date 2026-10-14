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
  Plus,
  Minus,
  LocateFixed,
  Compass,
} from 'lucide-react';
import { AmbulanceInspectorModal } from './modals/AmbulanceInspectorModal';
import { SignalInspectorModal } from './modals/SignalInspectorModal';
import { IncidentInspectorModal } from './modals/IncidentInspectorModal';
import { RouteComparisonModal } from './modals/RouteComparisonModal';

export const MapView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'MAP' | 'SATELLITE' | '3D'>('3D');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [debugMode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.search.includes('debug=1');
  });

  // Layer Visibility Toggles
  const [layerTraffic] = useState<boolean>(true);
  const [layerSignals] = useState<boolean>(true);
  const [layerIncidents] = useState<boolean>(true);

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

  // Smooth 60 FPS interpolation for ambulance position and heading
  const [smoothProgress, setSmoothProgress] = useState<number>(ambulance.progressPercent);
  const [smoothedHeading, setSmoothedHeading] = useState<number>(ambulance.heading || -42);
  const targetProgressRef = useRef<number>(ambulance.progressPercent);
  targetProgressRef.current = ambulance.progressPercent;

  useEffect(() => {
    let animId: number;
    let prevTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(0.05, (time - prevTime) / 1000);
      prevTime = time;

      setSmoothProgress((prev) => {
        const target = targetProgressRef.current;
        const diff = target - prev;
        if (Math.abs(diff) < 0.02) return target;
        // Smooth lerp without overshoot
        return prev + diff * Math.min(1, dt * 10);
      });

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update smoothed heading based on tangent
  const currentRatio = smoothProgress / 100;
  const ambulanceState = getPointOnCorridor(currentRatio);

  useEffect(() => {
    if (ambulanceState && !isNaN(ambulanceState.headingDeg)) {
      setSmoothedHeading((prev) => {
        let diff = (ambulanceState.headingDeg - prev) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return prev + diff * 0.15; // Smooth low-pass filter
      });
    }
  }, [ambulanceState.headingDeg]);

  // Ambient vehicles internal clock
  const [ambientTick, setAmbientTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbientTick((t) => (t + 1) % 1000);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Camera Auto-Follow in Demo/Active mode when enabled
  useEffect(() => {
    if (autoFollow && (corridorState === 'ACTIVE' || sim.demoMode.isRunning) && zoomLevel > 1) {
      // Pan camera so ambulance stays near center of view
      const targetPanX = -((ambulanceState.position.x - 500) / 1000) * 150 * (zoomLevel - 1);
      const targetPanY = -((ambulanceState.position.y - 281.25) / 562.5) * 150 * (zoomLevel - 1);
      setPanOffset({ x: targetPanX, y: targetPanY });
    }
  }, [autoFollow, corridorState, sim.demoMode.isRunning, zoomLevel, ambulanceState.position.x, ambulanceState.position.y]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    setAutoFollow(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetCamera = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setAutoFollow(true);
  };

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

  // Scaled ambulance width between 36px and 60px based on zoom
  const ambulanceMarkerWidth = Math.round(44 * Math.max(0.85, Math.min(1.4, zoomLevel)));

  // Subtle body sway on turns
  const bodySwayDeg = Math.sin(smoothProgress * 0.5) * 1.5;

  // Strobe beacon alternate flashing state
  const isStrobeRed = (Math.floor(smoothProgress * 8) % 2) === 0;

  return (
    <div
      className="relative w-full h-full min-h-[480px] lg:min-h-[580px] rounded-2xl overflow-hidden border border-slate-800/90 bg-[#05070B] shadow-2xl flex flex-col group select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 3D Isometric Digital Twin Canvas */}
      {viewMode === '3D' ? (
        <div
          className="relative w-full h-full flex-1 overflow-hidden transition-transform duration-150 flex items-center justify-center bg-[#05070B]"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            transformOrigin: 'center center',
          }}
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
                <filter id="corridor-red-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
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

              {/* Normal Traffic Thin Cyan Road Grid Lanes (Always Visible) */}
              {layerTraffic && (
                <g className="opacity-60">
                  {/* Diagonal Primary Boulevard (Indiranagar to Victoria) */}
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-75"
                  />
                  {/* Cross Avenues */}
                  <path
                    d="M 380 70 L 545 275 L 810 560"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 6"
                    className="opacity-60"
                  />
                  <path
                    d="M 620 120 L 690 175 L 880 330"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 6"
                    className="opacity-60"
                  />
                  <path
                    d="M 100 380 L 260 555 L 440 560"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 6"
                    className="opacity-60"
                  />
                </g>
              )}

              {/* Emergency Cleared RED Corridor Layer (ONLY VISIBLE AFTER ACTIVATION) */}
              {corridorState === 'ACTIVE' && (
                <g className="animate-in fade-in duration-500">
                  {/* Outer Red Ambient Halo */}
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

                  {/* Dual Glowing Red Corridor Rails matching Image 2 */}
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FF3B30"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-95"
                  />
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FFA39E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    className="opacity-80"
                  />
                </g>
              )}

              {/* Debug Visualizer Mode (?debug=1) */}
              {debugMode && (
                <g className="z-50">
                  {/* Path Polyline Line */}
                  <path
                    d={CORRIDOR_SVG_PATH_D}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Waypoints */}
                  {CORRIDOR_WAYPOINTS.map((wp, idx) => (
                    <g key={idx}>
                      <circle cx={wp.x} cy={wp.y} r="5" fill="#F59E0B" stroke="#000" strokeWidth="1.5" />
                      <text x={wp.x + 8} y={wp.y + 4} fill="#F59E0B" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        W{idx} ({wp.x}, {wp.y})
                      </text>
                    </g>
                  ))}
                  {/* Ambulance Bounding Box Overlay */}
                  <rect
                    x={ambulanceState.position.x - 22}
                    y={ambulanceState.position.y - 14}
                    width="44"
                    height="28"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                </g>
              )}
            </svg>

            {/* Ambient Vehicles (6-12 small cars) moving on cross avenues */}
            {AMBIENT_LANES.map((lane, lIdx) => {
              const ambProgress = (ambientTick * lane.speed + lIdx * 0.28) % 1.0;
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
                    className="w-3.5 h-2 rounded-sm bg-cyan-400/90 border border-white/60 shadow-[0_0_6px_#38BDF8]"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectIncident(inc);
                  }}
                  className="absolute z-25 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform transform hover:scale-125 group pointer-events-auto"
                  style={{
                    left: `${(inc.coords.x / 1000) * 100}%`,
                    top: `${(inc.coords.y / 562.5) * 100}%`,
                  }}
                  title={`Incident ${inc.code}: ${inc.title} - Click for details`}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-6 h-6 rounded-full bg-amber-500/30 border border-amber-400 animate-ping" />
                    <div className="w-4 h-4 rounded-full bg-amber-500 border border-white text-black font-black text-[9px] flex items-center justify-center shadow-[0_0_10px_#F59E0B]">
                      !
                    </div>
                  </div>
                  <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-black/90 border border-amber-400 text-[9px] font-mono text-amber-300 whitespace-nowrap shadow-xl z-30">
                    {inc.code}: {inc.title}
                  </div>
                </div>
              ))}

            {/* Traffic Signal Posts (S01 to S07) Matching Reference Image 2 */}
            {layerSignals &&
              SIGNAL_DEFINITIONS.map((def, idx) => {
                const sigPt = getPointOnCorridor(def.distanceRatio);
                const sigX = sigPt.position.x + def.sideOffset.x;
                const sigY = sigPt.position.y + def.sideOffset.y;

                const sig = signals[idx] || { id: def.id, lamp: 'RED', isFaulty: false, mode: 'NORMAL' };
                const isGreen = sig.lamp === 'GREEN';
                const isYellow = sig.lamp === 'YELLOW';
                const isRed = sig.lamp === 'RED';
                const isFault = sig.isFaulty;

                return (
                  <div
                    key={def.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectSignalId(def.id);
                    }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer flex items-center gap-1.5 transition-all transform hover:scale-110 group pointer-events-auto"
                    style={{
                      left: `${(sigX / 1000) * 100}%`,
                      top: `${(sigY / 562.5) * 100}%`,
                    }}
                    title={`Signal ${def.id} (${def.name}) - Status: ${sig.lamp} - Click to inspect`}
                  >
                    {/* Vertical 3-Lamp Traffic Signal Housing (36-48px height) */}
                    <div className="relative flex flex-col items-center">
                      {/* Radial green aura glow if green */}
                      {isGreen && (
                        <div className="absolute top-4 w-9 h-9 -translate-y-1/2 rounded-full bg-emerald-400/35 blur-sm animate-pulse pointer-events-none" />
                      )}

                      <div className="w-3.5 h-9 rounded-md bg-black/95 border border-slate-700 p-0.5 flex flex-col items-center justify-between shadow-2xl relative z-10">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isRed ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' : isFault ? 'bg-amber-600 animate-pulse' : 'bg-rose-950/60'
                          }`}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isYellow ? 'bg-amber-400 shadow-[0_0_10px_#FBBF24]' : 'bg-amber-950/60'
                          }`}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isGreen ? 'bg-emerald-400 shadow-[0_0_12px_#34D399]' : 'bg-emerald-950/60'
                          }`}
                        />
                      </div>
                      {/* Mounting Post Stem */}
                      <div className="w-0.5 h-2.5 bg-slate-500 mx-auto" />
                    </div>

                    {/* Dark Pill Signal Badge (S01, S02, etc.) Beside Post */}
                    <div className="px-1.5 py-0.5 rounded-full bg-black/90 border border-white/30 text-[9px] font-mono font-black text-white shadow-xl whitespace-nowrap">
                      {def.id}
                    </div>
                  </div>
                );
              })}

            {/* Destination Hospital Marker: Pulsing Red Target Rings & Victoria Hospital Badge */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setInspectAmbulance(true);
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer flex flex-col items-center group transition-transform hover:scale-105 pointer-events-auto"
              style={{
                left: `${(825 / 1000) * 100}%`,
                top: `${(118 / 562.5) * 100}%`,
              }}
              title="Victoria Hospital Emergency Department"
            >
              {/* Victoria Hospital Red Pill Badge */}
              <div className="px-2.5 py-1 rounded-full bg-[#E11D48] border border-rose-300 text-white font-mono text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-[0_0_18px_rgba(225,29,72,0.8)]">
                <span className="w-3.5 h-3.5 rounded-full bg-white text-[#E11D48] flex items-center justify-center font-black text-xs leading-none">
                  ✚
                </span>
                <span>Victoria Hospital</span>
              </div>

              {/* Concentric Pulsing Red Ground Target Rings */}
              <div className="relative w-14 h-14 flex items-center justify-center mt-0.5">
                <span className="absolute w-14 h-14 rounded-full border-2 border-red-500/80 animate-ping opacity-60" />
                <span className="absolute w-10 h-10 rounded-full border border-red-400/90 animate-pulse" />
                <span className="absolute w-5 h-5 rounded-full bg-red-600/40 border border-red-400 shadow-[0_0_10px_#EF4444]" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#EF4444]" />
              </div>
            </div>

            {/* Small Realistic Ambulance Marker (about 44px wide) matching Image 2 */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setInspectAmbulance(true);
              }}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group pointer-events-auto"
              style={{
                left: `${(ambulanceState.position.x / 1000) * 100}%`,
                top: `${(ambulanceState.position.y / 562.5) * 100}%`,
              }}
              title="Ambulance AMB-001 - Click to inspect patient vitals"
            >
              {/* AMB-001 / CRITICAL Floating Badge Card Attached Above Ambulance */}
              <div className="px-2.5 py-0.5 rounded-lg bg-black/95 border border-red-500/90 text-center shadow-[0_0_15px_rgba(239,68,68,0.7)] font-mono leading-tight mb-1 group-hover:scale-105 transition-transform">
                <div className="font-bold text-white text-[9px] tracking-wider">AMB-001</div>
                <div className="font-black text-red-500 text-[8px] tracking-widest leading-none">CRITICAL</div>
              </div>

              {/* Scaled Vehicle Sprite with Smooth Rotation, Lighting, and Siren Glow */}
              <div
                className="relative flex items-center justify-center transition-transform duration-75"
                style={{
                  width: `${ambulanceMarkerWidth}px`,
                  height: `${Math.round(ambulanceMarkerWidth * 0.55)}px`,
                  transform: `rotate(${smoothedHeading + bodySwayDeg}deg)`,
                }}
              >
                {/* Dynamic Ground Asphalt Shadow */}
                <div className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-black/80 blur-[2px] pointer-events-none" />

                {/* Soft Red/Blue Flashing Siren Glow */}
                <div
                  className={`absolute -inset-2 rounded-full blur-md pointer-events-none transition-all duration-150 ${
                    isStrobeRed ? 'bg-red-500/35 shadow-[0_0_14px_#EF4444]' : 'bg-sky-400/35 shadow-[0_0_14px_#38BDF8]'
                  }`}
                />

                {/* Forward Headlight Beams */}
                <div className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-8 h-6 bg-gradient-to-r from-amber-200/50 via-yellow-100/20 to-transparent blur-[2px] pointer-events-none" />

                {/* High-Definition Vector 3D Isometric Ambulance Sprite */}
                <svg
                  viewBox="0 0 100 55"
                  className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                >
                  {/* Ambulance Main Chassis Body */}
                  <rect x="5" y="8" width="76" height="38" rx="6" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
                  {/* Front Cabin Windshield */}
                  <path d="M 62 12 L 76 17 L 76 37 L 62 42 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                  {/* Red Lateral Emergency Chevrons */}
                  <rect x="18" y="22" width="40" height="10" fill="#EF4444" />
                  {/* Medical Cross Graphic */}
                  <path d="M 35 15 L 41 15 L 41 39 L 35 39 Z" fill="#EF4444" />
                  <path d="M 27 23 L 49 23 L 49 31 L 27 31 Z" fill="#EF4444" />
                  <circle cx="38" cy="27" r="3" fill="#FFFFFF" />
                  {/* Dual Roof Emergency Strobe Lights */}
                  <rect x="42" y="10" width="8" height="6" rx="2" fill="#EF4444" className={isStrobeRed ? 'animate-pulse' : ''} />
                  <rect x="42" y="38" width="8" height="6" rx="2" fill="#38BDF8" className={!isStrobeRed ? 'animate-pulse' : ''} />
                  {/* Side Mirrors */}
                  <rect x="66" y="5" width="4" height="4" fill="#64748B" />
                  <rect x="66" y="45" width="4" height="4" fill="#64748B" />
                </svg>
              </div>
            </div>

            {/* Perspective Street Names on Asphalt matching Image 2 */}
            <div className="absolute left-[16%] bottom-[4%] px-2.5 py-0.5 rounded-lg bg-black/80 border border-white/20 text-[9px] font-mono text-white font-bold pointer-events-none shadow-xl">
              Indiranagar
            </div>
            <div className="absolute right-[22%] bottom-[32%] px-2.5 py-0.5 rounded-lg bg-black/80 border border-white/20 text-[9px] font-mono text-white font-bold pointer-events-none shadow-xl">
              100ft Road
            </div>
            <div className="absolute right-[16%] top-[34%] px-2.5 py-0.5 rounded-lg bg-black/80 border border-white/20 text-[9px] font-mono text-white font-bold pointer-events-none shadow-xl transform rotate-[-35deg]">
              CMH Road
            </div>
          </div>
        </div>
      ) : (
        /* 2D Leaflet OSM Map Container */
        <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />
      )}

      {/* Top Left View Switcher (Map | Satellite | 3D View) Matching Reference Image 2 */}
      <div className="absolute top-3.5 left-3.5 z-40 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 font-mono text-xs shadow-2xl">
          {(['Map', 'Satellite', '3D View'] as const).map((label) => {
            const mode = label === 'Map' ? 'MAP' : label === 'Satellite' ? 'SATELLITE' : '3D';
            const isActive = viewMode === mode;
            return (
              <button
                key={label}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Legend Overlay Panel matching Image 2 */}
        <div className="p-2.5 rounded-xl bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 font-mono text-[10px] shadow-2xl flex flex-col gap-1.5 text-slate-300 w-36">
          <div className="flex items-center gap-2">
            <span className="text-xs">🚑</span>
            <span>Ambulance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] text-white flex items-center justify-center text-[7px] font-bold">✚</span>
            <span>Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-[#FF3B30] shadow-[0_0_6px_#EF4444]" />
            <span>Active Corridor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-3 rounded-sm bg-black border border-slate-600 flex flex-col items-center justify-around py-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
            </span>
            <span>Traffic Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_4px_#00E5FF]" />
            <span>Normal Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 rounded-sm bg-cyan-400 border border-white" />
            <span>Other Vehicles</span>
          </div>
        </div>
      </div>

      {/* Bottom Left Compass / North Indicator matching Image 2 */}
      <div className="absolute bottom-3.5 left-3.5 z-40 p-2 rounded-full bg-[#090C12]/90 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl flex items-center justify-center">
        <div className="relative w-7 h-7 flex items-center justify-center">
          <Compass className="w-7 h-7 text-slate-400" />
          <span className="absolute top-0 text-[8px] font-mono font-bold text-red-500">N</span>
        </div>
      </div>

      {/* Bottom Right Zoom & Navigation Controls matching Image 2 */}
      <div className="absolute bottom-3.5 right-3.5 z-40 flex flex-col items-center gap-1.5 pointer-events-auto">
        <button
          onClick={resetCamera}
          className="p-2 rounded-xl bg-[#090C12]/90 hover:bg-white/10 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl transition-colors"
          title="Re-centre on Ambulance"
          aria-label="Re-centre camera"
        >
          <LocateFixed className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
          className="p-2 rounded-xl bg-[#090C12]/90 hover:bg-white/10 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl transition-colors"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
          className="p-2 rounded-xl bg-[#090C12]/90 hover:bg-white/10 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl transition-colors"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Modals */}
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
