import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { Banner } from '../Banner';
import { EmergencyResponseCard } from '../EmergencyResponseCard';
import { AITrafficIntelligence } from '../AITrafficIntelligence';
import { TrafficSignalControl } from '../TrafficSignalControl';
import { LiveEventLog } from '../LiveEventLog';
import { CorridorStatistics } from '../CorridorStatistics';
import { simulationEngine } from '../../engine/simulation';

describe('UI Components', () => {
  beforeEach(() => {
    simulationEngine.init();
  });

  it('renders Header with brand title and system online badge', () => {
    render(<Header />);
    expect(screen.getByText('AI EMERGENCY CORRIDOR')).toBeInTheDocument();
    expect(screen.getByText('AI-POWERED EMERGENCY TRAFFIC MANAGEMENT')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument();
  });

  it('renders Banner with standby or active dispatch state', () => {
    render(<Banner />);
    expect(screen.getByText(/STANDBY • READY FOR EMERGENCY DISPATCH/i)).toBeInTheDocument();
  });

  it('renders EmergencyResponseCard with ambulance telemetry and CTA', () => {
    render(<EmergencyResponseCard />);
    expect(screen.getByText('EMERGENCY RESPONSE')).toBeInTheDocument();
    expect(screen.getByText('AMB-001')).toBeInTheDocument();
    expect(screen.getByText('ACTIVATE EMERGENCY CORRIDOR')).toBeInTheDocument();
  });

  it('renders AITrafficIntelligence with route comparison and simulated AI badge', () => {
    render(<AITrafficIntelligence />);
    expect(screen.getByText('AI TRAFFIC INTELLIGENCE')).toBeInTheDocument();
    expect(screen.getByText('SIMULATED AI')).toBeInTheDocument();
    expect(screen.getByText('Route Comparison')).toBeInTheDocument();
  });

  it('renders TrafficSignalControl with 7 signal indicators', () => {
    render(<TrafficSignalControl />);
    expect(screen.getByText('TRAFFIC SIGNAL CONTROL')).toBeInTheDocument();
    expect(screen.getByText('7 SIGNALS')).toBeInTheDocument();
    expect(screen.getByText('S01')).toBeInTheDocument();
    expect(screen.getByText('S07')).toBeInTheDocument();
  });

  it('renders LiveEventLog with terminal stream header', () => {
    render(<LiveEventLog />);
    expect(screen.getByText('LIVE EVENT LOG')).toBeInTheDocument();
    expect(screen.getByText('Live Updates')).toBeInTheDocument();
  });

  it('renders CorridorStatistics with length and progress track', () => {
    render(<CorridorStatistics />);
    expect(screen.getByText('CORRIDOR STATISTICS')).toBeInTheDocument();
    expect(screen.getByText('Corridor Length')).toBeInTheDocument();
    expect(screen.getByText('Ambulance Progress')).toBeInTheDocument();
  });
});
