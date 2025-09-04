import { CreditData } from '../types';

/**
 * Calculates an estimated FICO score based on provided credit data.
 * This function models the official FICO scoring system, which is based on five key categories,
 * each with a specific weight. The final score is calculated by awarding points in each category
 * and adding them to a base score of 300.
 *
 * The FICO model categories and their weights are:
 * 1. Payment History: 35%
 * 2. Amounts Owed (Credit Utilization): 30%
 * 3. Length of Credit History: 15%
 * 4. Credit Mix: 10%
 * 5. New Credit: 10%
 *
 * @param creditData The structured credit data of a user.
 * @returns An estimated FICO score between 300 and 850.
 */
export const calculateFicoScore = (creditData: CreditData | null): number => {
    if (!creditData) return 300;

    const BASE_SCORE = 300;
    const MAX_POSSIBLE_POINTS = 550; // Total points available on top of the base score (850 - 300)

    // Define the maximum points available for each category based on FICO's official weights.
    const MAX_POINTS = {
      paymentHistory: MAX_POSSIBLE_POINTS * 0.35, // ~192.5 points
      amountsOwed:    MAX_POSSIBLE_POINTS * 0.30, // ~165.0 points
      creditLength:   MAX_POSSIBLE_POINTS * 0.15, //  ~82.5 points
      creditMix:      MAX_POSSIBLE_POINTS * 0.10, //  ~55.0 points
      newCredit:      MAX_POSSIBLE_POINTS * 0.10, //  ~55.0 points
    };

    // --- Category 1: Payment History (35%) ---
    // This is the most important factor. Penalties are applied for negative marks.
    // NOTE: The penalties have been recalibrated to be less severe and more realistic.
    const latePaymentPenalty = 25; // Previously 60
    const collectionPenalty = 45;  // Previously 100
    const paymentHistoryDeductions =
        (creditData.late_payments || 0) * latePaymentPenalty +
        (creditData.collections?.length || 0) * collectionPenalty;
    const paymentHistoryPoints = Math.max(0, MAX_POINTS.paymentHistory - paymentHistoryDeductions);

    // --- Category 2: Amounts Owed (30%) ---
    // This category is primarily about credit utilization. Lower is better.
    const revolvingAccounts = creditData.accounts?.filter(acc => acc.type.toLowerCase() === 'revolving') || [];
    const totalRevolvingBalance = revolvingAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalRevolvingLimit = revolvingAccounts.reduce((sum, acc) => sum + (acc.limit || 0), 0);
    const utilizationRatio = totalRevolvingLimit > 0 ? totalRevolvingBalance / totalRevolvingLimit : (totalRevolvingBalance > 0 ? 1 : 0);

    let utilizationPoints;
    if (utilizationRatio <= 0.09)      { utilizationPoints = MAX_POINTS.amountsOwed; }       // Excellent (9% or less)
    else if (utilizationRatio <= 0.29) { utilizationPoints = MAX_POINTS.amountsOwed * 0.85; } // Good (10-29%)
    else if (utilizationRatio <= 0.49) { utilizationPoints = MAX_POINTS.amountsOwed * 0.6; }  // Fair (30-49%)
    else if (utilizationRatio <= 0.74) { utilizationPoints = MAX_POINTS.amountsOwed * 0.3; }  // Poor (50-74%)
    else                               { utilizationPoints = 0; }                             // Very Poor (75%+)

    // --- Category 3: Length of Credit History (15%) ---
    // A longer history is better. The calculation is adjusted to be more forgiving for younger profiles.
    const ageInYears = (creditData.average_account_age_months || 0) / 12;
    // The benefit now maxes out around a 10-year average age, which is more forgiving.
    const creditLengthPoints = Math.min(ageInYears / 10, 1) * MAX_POINTS.creditLength; // Previously divided by 15

    // --- Category 4: Credit Mix (10%) ---
    // FICO scores favor a mix of different credit types (revolving, installment).
    let mixPoints = 0;
    if (creditData.credit_mix && creditData.accounts?.length > 0) {
        const hasRevolving = creditData.credit_mix.revolving > 0;
        const hasInstallment = creditData.credit_mix.installment > 0;
        const hasMortgage = creditData.credit_mix.mortgage > 0;
        let diversityScore = 0.0; // A score from 0.0 to 1.0 representing mix quality

        if (hasRevolving && (hasInstallment || hasMortgage)) { diversityScore = 0.7; } // Good basic mix
        else if (hasRevolving || hasInstallment || hasMortgage) { diversityScore = 0.3; } // Only one type of credit

        if (hasMortgage) { diversityScore += 0.2; } // Bonus for mortgage
        if ((creditData.accounts?.length || 0) >= 5) { diversityScore += 0.1; } // Bonus for a "thick" file

        mixPoints = MAX_POINTS.creditMix * Math.min(diversityScore, 1.0);
    }

    // --- Category 5: New Credit (10%) ---
    // This is primarily measured by recent hard inquiries. Replaced the punitive switch statement
    // with a more realistic linear deduction model.
    const inquiries = creditData.inquiries || 0;
    const inquiryPenalty = 8; // A more realistic point deduction per inquiry.
    const newCreditDeductions = inquiries * inquiryPenalty;
    const newCreditPoints = Math.max(0, MAX_POINTS.newCredit - newCreditDeductions);


    // --- Final Score Assembly ---
    // The final score is the base score plus the sum of points earned in each category.
    const totalPoints = paymentHistoryPoints + utilizationPoints + creditLengthPoints + mixPoints + newCreditPoints;
    const finalScore = BASE_SCORE + Math.round(totalPoints);

    // Ensure the score is clamped within the standard FICO range of 300-850.
    return Math.max(300, Math.min(850, finalScore));
}