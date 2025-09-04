import React from 'react';
import { Goal } from '../types';
import {
  DebtReductionIcon,
  CollectionResolutionIcon,
  PaymentHistoryIcon,
  CreditBuildingIcon,
  CalendarIcon
} from './Icons';

interface GoalCardProps {
  goal: Goal;
  onSelect: () => void;
  index: number;
}

const categoryStyles: { [key: string]: { border: string; bg: string; text: string; icon: React.FC<{className?: string}> } } = {
  'Debt Reduction': { 
    border: 'border-blue-500', 
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    icon: DebtReductionIcon 
  },
  'Collection Resolution': { 
    border: 'border-red-500', 
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    icon: CollectionResolutionIcon
  },
  'Payment History': { 
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-300',
    icon: PaymentHistoryIcon
  },
  'Credit Building': { 
    border: 'border-yellow-500', 
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-300',
    icon: CreditBuildingIcon
  },
  'Default': { 
    border: 'border-purple-500', 
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    icon: CreditBuildingIcon
  }
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onSelect, index }) => {
  const styles = categoryStyles[goal.category] || categoryStyles['Default'];
  const Icon = styles.icon;

  return (
    <div
      onClick={onSelect}
      className={`bg-gray-800/60 p-5 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:scale-105 border-t-4 ${styles.border}`}
      style={{ animation: `slideUp 0.5s ease-in-out ${index * 0.1}s forwards`, opacity: 0 }}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-gray-100">{goal.title}</h3>
            <div className={`p-2 rounded-full ${styles.bg}`}>
                <Icon className={`h-5 w-5 ${styles.text}`} />
            </div>
        </div>
        
        <p className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${styles.bg} ${styles.text}`}>
          {goal.category}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{goal.timeframe_months} months</span>
        </div>
        <span className="font-semibold text-blue-400 hover:text-blue-300">Simulate &rarr;</span>
      </div>
    </div>
  );
};

export default GoalCard;