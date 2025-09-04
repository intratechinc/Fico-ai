export interface Account {
  type: string;
  balance: number;
  limit: number;
  status: string;
  payment_history: string;
}

export interface Collection {
  type: string;
  amount: number;
  status: string;
}

export interface CreditMix {
  revolving: number;
  installment: number;
  mortgage: number;
}

export interface CreditData {
  accounts: Account[];
  collections: Collection[];
  late_payments: number;
  inquiries: number;
  average_account_age_months: number;
  credit_mix: CreditMix;
}

export interface ActionStep {
  step: string;
  impact: number;
}

export interface Goal {
  goal_id: string;
  title: string;
  category: string;
  timeframe_months: number;
  action_plan: ActionStep[];
}

export interface GeminiResponse {
  credit_data: CreditData;
  personalized_goals: Goal[];
}

export type AppState = 'idle' | 'loading' | 'results' | 'error';

export interface ManualAdjustments {
    utilization: number;
    inquiries: number;
    latePayments: number;
}
