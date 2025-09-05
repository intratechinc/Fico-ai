import type { CreditData, FicoCategoryProfile, Pass2Normalization } from '../types';

function getStatusFromPercent(value: number, thresholds: number[]): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (value <= thresholds[0]) return 'Excellent';
  if (value <= thresholds[1]) return 'Good';
  if (value <= thresholds[2]) return 'Fair';
  return 'Poor';
}

export function normalizeFromCreditData(data: CreditData): Pass2Normalization {
  // Payment History
  const totalLate = data.late_payments || 0;
  const delinquencies = totalLate > 0 ? 1 : 0; // coarse without per-account history
  const paymentHistory: FicoCategoryProfile = {
    scoreContribution: 35,
    latePaymentsTotal: totalLate,
    delinquencies,
    status: totalLate === 0 ? 'Excellent' : totalLate <= 2 ? 'Good' : totalLate <= 5 ? 'Fair' : 'Poor',
  };

  // Amounts Owed
  const totals = data.accounts?.reduce(
    (acc, a) => {
      acc.balance += a.balance || 0;
      acc.limit += a.limit || 0;
      return acc;
    },
    { balance: 0, limit: 0 }
  ) || { balance: 0, limit: 0 };
  const utilization = totals.limit > 0 ? Math.round(((totals.balance / totals.limit) * 100) * 100) / 100 : 0;
  const amountsOwed: FicoCategoryProfile = {
    scoreContribution: 30,
    overallUtilization: utilization,
    accountsWithBalances: data.accounts?.filter(a => (a.balance || 0) > 0).length || 0,
    status: getStatusFromPercent(utilization, [10, 30, 50]),
  };

  // Length of History (approx via average age provided)
  const avgYears = (data.average_account_age_months || 0) / 12;
  const lengthOfHistory: FicoCategoryProfile = {
    scoreContribution: 15,
    oldestAccountAgeYears: avgYears, // without per-account dates, approximate
    averageAccountAgeYears: avgYears,
    status: avgYears > 10 ? 'Excellent' : avgYears > 5 ? 'Good' : avgYears > 2 ? 'Fair' : 'Poor',
  };

  // New Credit
  const inquiries = data.inquiries || 0;
  const newCredit: FicoCategoryProfile = {
    scoreContribution: 10,
    recentInquiries12mo: inquiries,
    newAccounts12mo: 0,
    status: inquiries === 0 ? 'Excellent' : inquiries <= 2 ? 'Good' : inquiries <= 4 ? 'Fair' : 'Poor',
  };

  // Credit Mix
  const mix = data.credit_mix || { revolving: 0, installment: 0, mortgage: 0 };
  const diversity = (mix.revolving > 0 ? 1 : 0) + (mix.installment > 0 ? 1 : 0) + (mix.mortgage > 0 ? 1 : 0);
  const creditMix: FicoCategoryProfile = {
    scoreContribution: 10,
    accountTypes: [
      ...(mix.revolving > 0 ? ['credit_card'] : []),
      ...(mix.installment > 0 ? ['installment'] : []),
      ...(mix.mortgage > 0 ? ['mortgage'] : []),
    ],
    diversityScore: diversity,
    status: diversity >= 3 ? 'Excellent' : diversity === 2 ? 'Good' : diversity === 1 ? 'Fair' : 'Poor',
  };

  const weights: Record<string, number> = { Excellent: 1, Good: 0.75, Fair: 0.5, Poor: 0.25 };
  const cats = [paymentHistory, amountsOwed, lengthOfHistory, newCredit, creditMix];
  const normalizedScore = cats.reduce((sum, c) => sum + c.scoreContribution * (weights[c.status] || 0.5), 0);
  const baselineScoreEstimate = Math.round((normalizedScore / 100) * 550 + 300);

  return { paymentHistory, amountsOwed, lengthOfHistory, newCredit, creditMix, baselineScoreEstimate };
}


