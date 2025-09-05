import type { Pass2Normalization, Pass3Advice } from '../types';

export function generateAdviceFromPass2(pass2: Pass2Normalization): Pass3Advice {
  const baseline = pass2.baselineScoreEstimate;
  const breakdown = {
    paymentHistory: `Status: ${pass2.paymentHistory.status}. Late payments: ${pass2.paymentHistory.latePaymentsTotal ?? 0}.`,
    amountsOwed: `Utilization: ${pass2.amountsOwed.overallUtilization}%. Status: ${pass2.amountsOwed.status}.`,
    lengthOfHistory: `Oldest: ${pass2.lengthOfHistory.oldestAccountAgeYears}y, Avg: ${pass2.lengthOfHistory.averageAccountAgeYears}y. Status: ${pass2.lengthOfHistory.status}.`,
    newCredit: `Recent inquiries (12mo): ${pass2.newCredit.recentInquiries12mo}. Status: ${pass2.newCredit.status}.`,
    creditMix: `Types: ${Array.isArray(pass2.creditMix.accountTypes) ? pass2.creditMix.accountTypes.join(', ') : ''}. Status: ${pass2.creditMix.status}.`,
  };

  const actions = [
    {
      action: 'Reduce revolving utilization to 30% overall',
      estimatedPointGain: '+20–40',
      timeframe: '1–3 months',
      confidence: 'high' as const,
      rationale: 'Lower utilization improves Amounts Owed (30% weight).',
    },
    {
      action: 'Avoid new hard inquiries',
      estimatedPointGain: '+5–10',
      timeframe: '6–12 months',
      confidence: 'medium' as const,
      rationale: 'Reduces New Credit pressure (10% weight).',
    },
  ];

  const summary = `Baseline estimated score: ${baseline}. Key: Utilization ${pass2.amountsOwed.overallUtilization}%, Payment history ${pass2.paymentHistory.status}.`;

  return {
    currentState: { summary, baselineScore: baseline },
    ficoImpactBreakdown: breakdown,
    personalizedActionPlan: actions,
    projectedOutcomes: {
      bestCaseScore: Math.min(850, baseline + 60),
      expectedScore: Math.min(850, baseline + 35),
      timeframe: '3–12 months',
    },
  };
}


