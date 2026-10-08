import React from 'react';
import { Header } from './Header';
import { Banner } from './Banner';
import { MapView } from './MapView';
import { EmergencyResponseCard } from './EmergencyResponseCard';
import { AITrafficIntelligence } from './AITrafficIntelligence';
import { TrafficSignalControl } from './TrafficSignalControl';
import { LiveEventLog } from './LiveEventLog';
import { CorridorStatistics } from './CorridorStatistics';
import { CompletionSummary } from './CompletionSummary';
import { LiveTacticalMapView } from './views/LiveTacticalMapView';
import { FleetView } from './views/FleetView';
import { SignalsMatrixView } from './views/SignalsMatrixView';
import { IncidentsView } from './views/IncidentsView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsView } from './views/SettingsView';
import { useSimLoop } from '../hooks/useSimLoop';
import { useSimStore } from '../store/useSimStore';

export const Dashboard: React.FC = () => {
  // Run simulation 10Hz physics loop
  useSimLoop(true);
  const { activeNavTab } = useSimStore();

  return (
    <div className="min-h-screen w-full bg-[#05070B] text-[#F2F4F7] flex flex-col font-sans relative overflow-x-hidden overflow-y-auto pb-16">
      {/* Top Header Bar & Navigation */}
      <Header />

      {/* Main Workspace based on active tab */}
      <main className="flex-1 w-full px-3 lg:px-6 py-3 flex flex-col gap-3 max-w-[1920px] mx-auto">
        {activeNavTab === 'overview' && (
          <>
            {/* Top Emergency Active Corridor Banner */}
            <Banner />

            {/* Top Half Grid: Dominant Centerpiece Map View (8 cols) + Right Intelligence Panels (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
              {/* Left / Center Dominant Map (8 cols on desktop) */}
              <section className="lg:col-span-8 flex flex-col min-h-[460px] lg:min-h-[580px]" aria-label="Live Map">
                <MapView />
              </section>

              {/* Right Rail: Emergency Response Card + AI Traffic Intelligence (4 cols on desktop) */}
              <section className="lg:col-span-4 flex flex-col gap-3" aria-label="Emergency Response and AI Intelligence">
                <EmergencyResponseCard />
                <AITrafficIntelligence />
              </section>
            </div>

            {/* Bottom Row: Traffic Signal Control (4 cols) + Live Event Log (4 cols) + Corridor Statistics (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Traffic Signal Control (4 cols) */}
              <section className="lg:col-span-4 flex flex-col" aria-label="Traffic Signal Control">
                <TrafficSignalControl />
              </section>

              {/* Live Event Log (4 cols) */}
              <section className="lg:col-span-4 flex flex-col" aria-label="Live Event Log">
                <LiveEventLog />
              </section>

              {/* Corridor Statistics (4 cols) */}
              <section className="lg:col-span-4 flex flex-col" aria-label="Corridor Statistics">
                <CorridorStatistics />
              </section>
            </div>
          </>
        )}

        {activeNavTab === 'map' && <LiveTacticalMapView />}
        {activeNavTab === 'corridors' && (
          <div className="flex flex-col gap-3">
            <Banner />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              <section className="lg:col-span-8 flex flex-col min-h-[520px]">
                <MapView />
              </section>
              <section className="lg:col-span-4 flex flex-col gap-3">
                <EmergencyResponseCard />
                <CorridorStatistics />
              </section>
            </div>
          </div>
        )}
        {activeNavTab === 'fleet' && <FleetView />}
        {activeNavTab === 'signals' && <SignalsMatrixView />}
        {activeNavTab === 'incidents' && <IncidentsView />}
        {activeNavTab === 'audit' && <AuditLogView />}
        {activeNavTab === 'settings' && <SettingsView />}
      </main>

      {/* Patient Delivery Completion Modal */}
      <CompletionSummary />
    </div>
  );
};
