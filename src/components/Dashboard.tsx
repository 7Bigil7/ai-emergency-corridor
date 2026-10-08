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
import { useSimLoop } from '../hooks/useSimLoop';

export const Dashboard: React.FC = () => {
  // Run simulation 10Hz physics loop
  useSimLoop(true);

  return (
    <div className="min-h-screen w-full bg-[#05070B] text-[#F2F4F7] flex flex-col font-sans relative overflow-x-hidden overflow-y-auto pb-16">
      {/* Top Header Bar */}
      <Header />

      {/* Top Emergency Active Corridor Banner */}
      <Banner />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 w-full px-4 lg:px-6 py-3 flex flex-col gap-3 max-w-[1920px] mx-auto">
        {/* Top Half Grid: Map View (8 cols) + Right Intelligence Panels (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
          {/* Left / Center Map (8 cols on desktop) */}
          <section className="lg:col-span-8 flex flex-col min-h-[440px] lg:min-h-[560px]">
            <MapView />
          </section>

          {/* Right Rail: Emergency Response Card + AI Traffic Intelligence (4 cols on desktop) */}
          <section className="lg:col-span-4 flex flex-col gap-3">
            <EmergencyResponseCard />
            <AITrafficIntelligence />
          </section>
        </div>

        {/* Bottom Row: Traffic Signal Control (4 cols) + Live Event Log (4 cols) + Corridor Statistics (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Traffic Signal Control (4 cols) */}
          <section className="lg:col-span-4 flex flex-col">
            <TrafficSignalControl />
          </section>

          {/* Live Event Log (4 cols) */}
          <section className="lg:col-span-4 flex flex-col">
            <LiveEventLog />
          </section>

          {/* Corridor Statistics (4 cols) */}
          <section className="lg:col-span-4 flex flex-col">
            <CorridorStatistics />
          </section>
        </div>
      </main>

      {/* Patient Delivery Completion Modal */}
      <CompletionSummary />
    </div>
  );
};
