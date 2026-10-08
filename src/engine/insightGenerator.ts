import { AIInsight, CorridorState, TrafficSignal } from './types';

export function createInsight(
  message: string,
  category: AIInsight['category'],
  level: AIInsight['level'] = 'info'
): AIInsight {
  const d = new Date();
  const timeStr = d.toTimeString().split(' ')[0] || '12:00:00';
  return {
    id: `ins_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timeStr,
    message,
    category,
    level,
  };
}

export function getInitialInsights(): AIInsight[] {
  return [
    createInsight(
      'AI Operations Core online. Monitoring Bengaluru Central traffic grid.',
      'SAFETY',
      'info'
    ),
    createInsight(
      'SCATS traffic signal controllers synchronized across 7 intersections.',
      'SIGNALS',
      'info'
    ),
    createInsight(
      'Ready for emergency dispatch authorization.',
      'SAFETY',
      'info'
    ),
  ];
}

export function getInsightsForStateChange(
  oldState: CorridorState,
  newState: CorridorState,
  _approachingSignal?: TrafficSignal | null
): AIInsight[] {
  const insights: AIInsight[] = [];

  if (oldState === 'IDLE' && newState === 'ANALYZING') {
    insights.push(
      createInsight(
        'High-density telemetry ingested: MG Road arterial congested at 78%.',
        'ROUTING',
        'warning'
      )
    );
    insights.push(
      createInsight(
        'Evaluating 3 multi-modal arterial corridors towards Victoria Hospital ED.',
        'ROUTING',
        'info'
      )
    );
  } else if (newState === 'PLANNED') {
    insights.push(
      createInsight(
        'Route B (Cubbon Park / Kasturba Corridor) selected: Cost 1061 vs 1840 on MG Rd.',
        'ROUTING',
        'success'
      )
    );
    insights.push(
      createInsight(
        '7 sequential intersections flagged for predictive green-wave preempt.',
        'SIGNALS',
        'info'
      )
    );
    insights.push(
      createInsight(
        'Estimated Transit Time Reduction: 34% (Target ETA: 12.0 min vs 18.2 min).',
        'IMPACT',
        'success'
      )
    );
  } else if (newState === 'ACTIVE') {
    insights.push(
      createInsight(
        'Green-Wave Corridor ACTIVE: Priority signal preemption broadcasting.',
        'SIGNALS',
        'success'
      )
    );
    insights.push(
      createInsight(
        'Civil cross-traffic safety buffers established at upcoming intersections.',
        'SAFETY',
        'info'
      )
    );
  } else if (newState === 'COMPLETED') {
    insights.push(
      createInsight(
        'Emergency Corridor Mission Completed: Patient successfully delivered to Trauma ICU.',
        'IMPACT',
        'success'
      )
    );
    insights.push(
      createInsight(
        'Post-incident signal restoration sequence executed. Normal cycles resuming.',
        'SIGNALS',
        'info'
      )
    );
  } else if (newState === 'ABORTED') {
    insights.push(
      createInsight(
        'Operator override: Emergency corridor aborted. Restoring civil signal timings.',
        'SAFETY',
        'warning'
      )
    );
  }

  return insights;
}
