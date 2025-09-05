import React from 'react';
import type { Goal } from '../types';
import { ChevronRight } from './Icons';

interface Props {
  goal: Goal;
  onSimulate: () => void;
}

export const GoalCard: React.FC<Props> = ({ goal, onSimulate }) => {
  const totalImpact = goal.action_plan.reduce((s, a) => s + (a.impact || 0), 0);
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-tight">{goal.title}</h3>
          <div className="text-xs text-neutral-500 mt-0.5">{goal.category} • {goal.timeframe_months} mo</div>
        </div>
        <div className="text-xs bg-neutral-100 text-neutral-700 rounded-full px-2 py-1">+{totalImpact} pts</div>
      </div>

      <ul className="space-y-2 text-sm">
        {goal.action_plan.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <span className="text-neutral-700">{a.step}</span>
            <span className="font-medium">{a.impact > 0 ? '+' : ''}{a.impact}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <button onClick={onSimulate} className="group inline-flex items-center gap-2 rounded-xl bg-black text-white px-3 py-2">
          Simulate <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};


