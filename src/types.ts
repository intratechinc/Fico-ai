export interface CreditData {
  accounts: Array<{ type: string; balance: number; limit: number }>;
  collections: Array<{ amount: number }>;
  late_payments: number;
  inquiries: number;
  average_account_age_months: number;
  credit_mix: { revolving: number; installment: number; mortgage: number };
}

export interface Goal {
  goal_id: string;
  title: string;
  category: string;
  timeframe_months: number;
  action_plan: Array<{ step: string; impact: number }>; // impact in points
}

export type AppState = 'idle' | 'loading' | 'results' | 'error';

export interface AnalyzeResponse {
  credit_data: CreditData;
  personalized_goals: Goal[];
}

// --- Three-Pass Types ---
export interface FicoCategoryProfile {
  scoreContribution: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  [key: string]: any;
}

export interface Pass2Normalization {
  paymentHistory: FicoCategoryProfile;
  amountsOwed: FicoCategoryProfile;
  lengthOfHistory: FicoCategoryProfile;
  newCredit: FicoCategoryProfile;
  creditMix: FicoCategoryProfile;
  baselineScoreEstimate: number;
}

export interface ActionStep {
  action: string;
  estimatedPointGain: string;
  timeframe: string;
  confidence?: 'low' | 'medium' | 'high';
  rationale?: string;
}

export interface Pass3Advice {
  currentState: {
    summary: string;
    baselineScore: number;
  };
  ficoImpactBreakdown: {
    paymentHistory: string;
    amountsOwed: string;
    lengthOfHistory: string;
    newCredit: string;
    creditMix: string;
  };
  personalizedActionPlan: ActionStep[];
  projectedOutcomes: {
    bestCaseScore: number;
    expectedScore: number;
    timeframe: string;
  };
}


