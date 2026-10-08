# AI Emergency Corridor (Bengaluru Central EOC)

> **"An AI-powered emergency traffic coordination platform that dynamically creates a green-wave corridor for ambulances."**

A local, interactive, smart-city emergency operations center web application simulating dynamic green-wave traffic signal preemption, multi-route congestion evaluation, and live AI decision reasoning for emergency ambulances.

---

## 🚦 System Architecture & Separation of Concerns

The application is structured into decoupled layers:

```
src/
├── engine/              # Pure TypeScript deterministic simulation engine (Zero React imports)
│   ├── types.ts         # State machine, Route, Signal, Ambulance, Telemetry contracts
│   ├── simulation.ts    # 10Hz physics loop, action dispatcher (init, tick, dispatch, subscribe)
│   ├── routeOptimizer.ts# Candidate cost evaluation: Cost = travelTime * (1 + 0.8 * congestion) + 15s * signals
│   ├── signalPlanner.ts # Signal phase machine (Green 25s, Yellow 3s, Red 28s), 3s yellow-preempt, lock & restore
│   ├── trafficAnalyzer.ts # Telemetry aggregation & ambient vehicle yielding simulation
│   └── insightGenerator.ts# Dynamic real-time streamed AI reasoning logs
│
├── adapters/            # Modular Integration Adapters (with real vs simulated mapping)
│   ├── TrafficProvider.ts   # Replaces TomTom / HERE / BTP road sensor loop telemetry
│   ├── RouteProvider.ts     # Replaces OSRM / Valhalla routing engine
│   ├── GpsProvider.ts       # Replaces 108 Fleet AVL / OBD-II GNSS telematics
│   ├── HospitalProvider.ts  # Replaces HL7 FHIR Emergency Department bed tracking
│   └── SignalController.ts  # Replaces SCATS / SCOOT / NTCIP 1202 municipal signal gateways
│
├── data/                # Bengaluru CBD geographical data, signals S01-S07, candidate routes A/B/C, demo script
├── store/               # Zustand reactive store (useSimStore) bound to pure engine
├── hooks/               # useSimLoop (10Hz physics tick with requestAnimationFrame)
└── components/          # Glassmorphism dark-ops HUD UI (MapView, EmergencyPanel, AIInsights, EventLog, etc.)
```

---

## ⚡ Simulated vs. Future Real-World Integrations

| Subsystem | Current Simulation Implementation | Future Production Municipal Replacement |
| :--- | :--- | :--- |
| **Traffic Telemetry** | Deterministic segment congestion model (MG Rd 0.78, Cubbon Rd 0.41, Ulsoor 0.55) | TomTom Real-Time Traffic API, Google Roads Flow, and Bengaluru Traffic Police (BTP) live sensor loops & CCTV video AI |
| **Routing Engine** | Geo-distance + cost formula: $C = t \cdot (1 + 0.8c) + 15 N_{signals}$ | Self-hosted OSRM / Valhalla cluster with dynamic road closures and variable message sign (VMS) integration |
| **Vehicle Telemetry** | 10Hz mathematical interpolation along GPS waypoints | 108 Emergency Service Vehicle Telematics (RTK-GNSS + CAN-bus OBD-II) via secure MQTT / WebSocket gateway |
| **Signal Control** | 3-lamp virtual hardware state machine with 3s yellow transition and green wave lock | SCATS / SCOOT / NTCIP 1202 protocol controllers via TLS-encrypted municipal field gateway with hardware watchdog fail-safes |
| **Hospital ED** | In-memory Trauma ICU bed readiness and pre-alerting | HL7 / FHIR Emergency Department EHR integration and cath-lab automated paging |

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript (Strict Mode, 0 `any` types)
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS (Custom Dark HUD Palette `#07080A`, `#0E1013`, `#2BD97C`, `#FF3B30`)
- **Mapping**: Leaflet + OpenStreetMap CartoDB Dark Matter tiles (with fallback handling)
- **State Management**: Zustand
- **Animations**: Framer Motion & CSS keyframe interpolation
- **Testing**: Vitest (Unit & Integration), React Testing Library, Playwright (E2E)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Tests
```bash
# Run unit & component tests (23 passing tests)
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Run Playwright End-to-End tests
npm run test:e2e
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🎮 Features & Interactive Workflows

1. **AI Route Analysis**: Evaluates 3 arterial options (MG Road, Cubbon/Kasturba, Ulsoor Bypass). Automatically selects Route B (Cost 1061 vs 1840 on MG Rd).
2. **Dynamic Green-Wave Synchronization**: Approaching intersections (ETA $\le 25$s) enter a mandatory **3-second safety yellow transition** before holding priority green.
3. **Signal Restorations**: Once the ambulance passes (+3s clearance margin), signals automatically restore to normal civil traffic cycles.
4. **Signal Fault Injection**: Click any signal on the map (S01 to S07) to toggle a hardware `FAULT` state; the engine immediately routes priority around the faulty node and slows the vehicle safely.
5. **Human Override Abort**: Click `HUMAN ABORT` in the top bar to safely terminate green-wave preemption and restore all intersections.
6. **Automated Demo Mode**: Floating bottom control bar allows 1-click execution of the entire 75-second operational story with `1x`, `2x`, and `4x` speed multipliers, Pause, Skip, and Reset.
7. **Post-Mission Summary**: Modal displaying count-up savings metric (**~34% time reduction / 6.0 minutes saved**) with celebration animation.
