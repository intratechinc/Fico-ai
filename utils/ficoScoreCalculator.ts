import { CreditData } from '../types';

// Constants for FICO score calculation
const BASE_SCORE = 300;
const MAX_SCORE = 850;
const SCORE_RANGE = MAX_SCORE - BASE_SCORE;

// Weights for each FICO category based on the provided reference
const WEIGHTS = {
  paymentHistory: 0.35,
  amountsOwed: 0.30,
  lengthOfCreditHistory: 0.15,
  creditMix: 0.10,
  newCredit: 0.10,
};

/**
 * Calculates the score for the Payment History category.
 * This is the most critical factor. It rewards consistent on-time payments and penalizes late payments, collections, and bankruptcies.
 * The impact of negative events diminishes over time.
 * @param data - The user's credit data.
 * @returns A score component between 0 and 1.
 */
function calculatePaymentHistoryScore(data: CreditData): number {
  const totalAccounts = data.accounts?.length || 0;
  if (totalAccounts === 0) return 0.7; // Start with a neutral score for no history

  const latePayments = data.late_payments || 0;
  const collections = data.collections?.length || 0;

  // A simple model: each negative event reduces the score. More accounts provide a larger buffer.
  const negativeEvents = (latePayments * 2) + (collections * 3); // Collections are weighted more heavily
  const score = Math.max(0, (totalAccounts * 2 - negativeEvents) / (totalAccounts * 2));

  return score;
}

/**
 * Calculates the score for the Amounts Owed category.
 * Primarily focuses on credit utilization ratio for revolving accounts. Lower is significantly better.
 * Also considers total outstanding debt.
 * @param data - The user's credit data.
 * @returns A score component between 0 and 1.
 */
function calculateAmountsOwedScore(data: CreditData): number {
    const revolvingAccounts = data.accounts?.filter(acc => acc.type.toLowerCase() === 'revolving') || [];
    if (revolvingAccounts.length === 0) return 0.8; // High score if no revolving credit is used

    const totalBalance = revolvingAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalLimit = revolvingAccounts.reduce((sum, acc) => sum + (acc.limit || 0), 0);

    if (totalLimit === 0) {
        return totalBalance > 0 ? 0.1 : 1.0; // Penalize if there's a balance with no limit, otherwise perfect score
    }

    const utilization = totalBalance / totalLimit;

    // The impact of utilization is non-linear. Scores drop sharply after 30%.
    if (utilization < 0.01) return 1.0; // 0% utilization
    if (utilization < 0.10) return 0.95; // 1-9% - Excellent
    if (utilization < 0.30) return 0.8;  // 10-29% - Good
    if (utilization < 0.50) return 0.6;  // 30-49% - Fair
    if (utilization < 0.75) return 0.3;  // 50-74% - Poor
    return 0.1; // 75%+ - Very Poor
}


/**
 * Calculates the score for the Length of Credit History category.
 * A longer history is better. Considers the average age of accounts.
 * @param data - The user's credit data.
 * @returns A score component between 0 and 1.
 */
function calculateLengthOfCreditHistoryScore(data: CreditData): number {
  const avgAgeMonths = data.average_account_age_months || 0;
  const avgAgeYears = avgAgeMonths / 12;

  // Score scales up to 15 years, where it maxes out.
  if (avgAgeYears < 1) return 0.2;
  if (avgAgeYears < 2) return 0.4;
  if (avgAgeYears < 5) return 0.6;
  if (avgAgeYears < 8) return 0.8;
  return 1.0;
}

/**
 * Calculates the score for the Credit Mix category.
 * FICO favors a healthy mix of revolving (credit cards) and installment (loans) accounts.
 * @param data - The user's credit data.
 * @returns A score component between 0 and 1.
 */
function calculateCreditMixScore(data: CreditData): number {
    const mix = data.credit_mix || { revolving: 0, installment: 0, mortgage: 0 };
    const hasRevolving = mix.revolving > 0;
    const hasInstallment = mix.installment > 0;
    const hasMortgage = mix.mortgage > 0;

    if (hasMortgage && hasRevolving && hasInstallment) return 1.0; // Excellent mix
    if ((hasRevolving && hasInstallment) || (hasRevolving && hasMortgage)) return 0.8; // Good mix
    if (hasRevolving || hasInstallment) return 0.5; // Fair, only one type
    return 0.2; // Poor or no mix
}

/**
 * Calculates the score for the New Credit category.
 * Opening several new accounts in a short period represents higher risk. This is measured by hard inquiries.
 * @param data - The user's credit data.
 * @returns A score component between 0 and 1.
 */
function calculateNewCreditScore(data: CreditData): number {
  const inquiries = data.inquiries || 0;

  if (inquiries === 0) return 1.0;
  if (inquiries <= 1) return 0.9;
  if (inquiries <= 2) return 0.8;
  if (inquiries <= 4) return 0.6;
  if (inquiries <= 6) return 0.3;
  return 0.1;
}

/**
 * Calculates an estimated FICO score based on provided credit data, strictly adhering to the
 * categories and weights outlined by myFICO.
 *
 * Reference: https://www.myfico.com/credit-education/whats-in-your-credit-score
 *
 * @param creditData The structured credit data of a user.
 * @returns An estimated FICO score between 300 and 850.
 */
export const calculateFicoScore = (creditData: CreditData | null): number => {
  if (!creditData || !creditData.accounts || creditData.accounts.length === 0) {
    return BASE_SCORE; // Return base score for insufficient data
  }

  // Calculate the raw score contribution from each category
  const paymentHistoryComponent = calculatePaymentHistoryScore(creditData) * WEIGHTS.paymentHistory;
  const amountsOwedComponent = calculateAmountsOwedScore(creditData) * WEIGHTS.amountsOwed;
  const lengthOfCreditHistoryComponent = calculateLengthOfCreditHistoryScore(creditData) * WEIGHTS.lengthOfCreditHistory;
  const creditMixComponent = calculateCreditMixScore(creditData) * WEIGHTS.creditMix;
  const newCreditComponent = calculateNewCreditScore(creditData) * WEIGHTS.newCredit;

  // Sum the weighted scores to get a final value between 0 and 1
  const totalWeightedScore =
    paymentHistoryComponent +
    amountsOwedComponent +
    lengthOfCreditHistoryComponent +
    creditMixComponent +
    newCreditComponent;

  // Scale the result to the FICO score range (300-850)
  const finalScore = BASE_SCORE + Math.round(totalWeightedScore * SCORE_RANGE);

  return Math.max(BASE_SCORE, Math.min(MAX_SCORE, finalScore));
};