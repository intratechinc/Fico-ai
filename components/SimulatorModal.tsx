import React, { useState, useEffect, useMemo } from 'react';
import { Goal, CreditData, ManualAdjustments } from '../types';
import { CalendarIcon, ClockIcon } from './Icons';
import { Line } from 'react-chartjs-2';
import { calculateFicoScore } from '../utils/ficoScoreCalculator';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  initialScore: number;
  creditData: CreditData;
}

interface CalendarItem {
  month: string;
  step?: string;
  score?: number;
}

type HistoryItem = {
    score: number;
    adjustments: ManualAdjustments;
    timestamp: Date;
};

const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose, goal, initialScore, creditData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectedScores, setProjectedScores] = useState<number[]>([initialScore]);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustments | null>(null);
  const [initialAdjustments, setInitialAdjustments] = useState<ManualAdjustments | null>(null);
  const [scoreKey, setScoreKey] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'projections' | 'history'>('projections');

  const plan = useMemo(() => goal.action_plan || [], [goal]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProjectedScores([initialScore]);
      const calendarLength = Math.max(goal.timeframe_months, plan.length);
      const initialCalendar = Array.from({ length: calendarLength }, (_, i) => ({ month: `Month ${i + 1}` }));
      setCalendar(initialCalendar);
      setBadges([]);
      setHistory([]);
      setActiveTab('projections');

      // Initialize manual adjustments based on initial credit data
      const revolvingAccounts = creditData.accounts?.filter(acc => acc.type.toLowerCase() === 'revolving') || [];
      const totalRevolvingBalance = revolvingAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      const totalRevolvingLimit = revolvingAccounts.reduce((sum, acc) => sum + (acc.limit || 0), 0);
      const initialUtilization = totalRevolvingLimit > 0 ? (totalRevolvingBalance / totalRevolvingLimit) * 100 : (totalRevolvingBalance > 0 ? 100 : 0);
      
      const initialValues = {
          utilization: Math.round(initialUtilization),
          inquiries: creditData.inquiries || 0,
          latePayments: creditData.late_payments || 0,
      };

      setManualAdjustments(initialValues);
      setInitialAdjustments(initialValues);

    }
  }, [isOpen, goal, initialScore, plan, creditData]);
  
  const liveSimulatedScore = useMemo(() => {
    if (!creditData || !manualAdjustments) {
        return projectedScores[projectedScores.length - 1];
    }

    // 1. Create a deep copy of the initial creditData to avoid mutations
    const adjustedCreditData = JSON.parse(JSON.stringify(creditData)) as CreditData;

    // 2. Apply manual adjustments to the copied data
    adjustedCreditData.inquiries = manualAdjustments.inquiries;
    adjustedCreditData.late_payments = manualAdjustments.latePayments;

    // Adjust revolving account balances to match the desired utilization
    const revolvingAccounts = adjustedCreditData.accounts?.filter(acc => acc.type.toLowerCase() === 'revolving') || [];
    const totalRevolvingLimit = revolvingAccounts.reduce((sum, acc) => sum + (acc.limit || 0), 0);
    
    if (totalRevolvingLimit > 0) {
        const newTotalBalance = totalRevolvingLimit * (manualAdjustments.utilization / 100);
        const originalTotalBalance = revolvingAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

        for (const acc of adjustedCreditData.accounts) {
            if (acc.type.toLowerCase() === 'revolving') {
                if (originalTotalBalance > 0) {
                    const proportion = (acc.balance || 0) / originalTotalBalance;
                    acc.balance = newTotalBalance * proportion;
                } else if (revolvingAccounts.length > 0) {
                    // If original balance was 0, distribute evenly
                    acc.balance = newTotalBalance / revolvingAccounts.length;
                }
            }
        }
    }

    // 3. Calculate the base score with the adjusted data
    const baseAdjustedScore = calculateFicoScore(adjustedCreditData);

    // 4. Add the impact from completed steps
    const completedStepsImpact = plan.slice(0, currentStep).reduce((total, step) => total + (step.impact || 0), 0);
    
    const finalScore = baseAdjustedScore + completedStepsImpact;

    return Math.max(300, Math.min(850, finalScore));

  }, [creditData, manualAdjustments, currentStep, plan, projectedScores]);

  useEffect(() => {
    setScoreKey(prev => prev + 1);
  }, [liveSimulatedScore]);


  const handleNextStep = () => {
    if (currentStep >= plan.length) return;

    const stepAction = plan[currentStep];
    const newScore = projectedScores[projectedScores.length - 1] + (stepAction.impact || 0);
    const newScores = [...projectedScores, newScore];
    setProjectedScores(newScores);

    const updatedCalendar = [...calendar];
    if(currentStep < updatedCalendar.length) {
       updatedCalendar[currentStep] = { ...updatedCalendar[currentStep], step: stepAction.step, score: newScore };
    }
    setCalendar(updatedCalendar);

    const newBadges = [...badges];
    if (currentStep === plan.length - 1 && !newBadges.includes("🏆 Goal Completed!")) {
      newBadges.push("🏆 Goal Completed!");
    }
    if ((stepAction.impact || 0) > 8 && !newBadges.includes("🎯 Great Progress!")) {
      newBadges.push("🎯 Great Progress!");
    }
    setBadges(newBadges);

    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep === 0) return;

    const newCurrentStep = currentStep - 1;
    
    const newScores = projectedScores.slice(0, -1);
    setProjectedScores(newScores);
    
    const updatedCalendar = [...calendar];
    if (newCurrentStep < updatedCalendar.length) {
      updatedCalendar[newCurrentStep] = { month: `Month ${newCurrentStep + 1}` };
    }
    setCalendar(updatedCalendar);
    
    let newBadges = badges.filter(b => b !== "🏆 Goal Completed!");
    const greatProgressStillEarned = plan
        .slice(0, newCurrentStep)
        .some(step => (step.impact || 0) > 8);
    if (!greatProgressStillEarned) {
        newBadges = newBadges.filter(b => b !== "🎯 Great Progress!");
    }
    setBadges(newBadges);

    setCurrentStep(newCurrentStep);
  };

  const handleAdjustmentChange = (field: keyof ManualAdjustments, valueStr: string) => {
    if (!manualAdjustments) return;

    let numericValue = parseInt(valueStr, 10);
    // If input is empty or invalid (e.g., ""), default to 0.
    if (isNaN(numericValue)) {
      numericValue = 0;
    }

    const bounds = {
      utilization: { min: 0, max: 100 },
      inquiries: { min: 0, max: 20 },
      latePayments: { min: 0, max: 20 },
    };

    const { min, max } = bounds[field];

    // Clamp the value to ensure it's within the valid range.
    const clampedValue = Math.max(min, Math.min(numericValue, max));

    setManualAdjustments({ ...manualAdjustments, [field]: clampedValue });
  };

  const handleResetAdjustments = () => {
    if (initialAdjustments) {
      setManualAdjustments(initialAdjustments);
    }
  };

  const handleSaveSnapshot = () => {
    if (!manualAdjustments) return;
    const newSnapshot: HistoryItem = {
        score: liveSimulatedScore,
        adjustments: { ...manualAdjustments },
        timestamp: new Date(),
    };
    setHistory(prevHistory => [newSnapshot, ...prevHistory]);
  };

  const currentAction = plan[currentStep] || plan[plan.length - 1];
  const isCompleted = currentStep >= plan.length;

  const chartData = useMemo(() => {
    const labels = ['Start', ...plan.map((_, i) => `Step ${i + 1}`)];
    const data = [...projectedScores];
    while (data.length < labels.length) {
      data.push(null);
    }

    return {
      labels,
      datasets: [{
        label: "Projected Score",
        data,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 5,
      }]
    };
  }, [projectedScores, plan]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { 
            ticks: { color: '#9ca3af' }, 
            grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
            min: Math.max(300, Math.min(...projectedScores) - 20), 
            max: Math.min(850, Math.max(...projectedScores) + 20) 
        }
    },
    plugins: { legend: { display: false } }
  }), [projectedScores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full shadow-xl relative border border-gray-700 animate-slide-up my-auto" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-2xl z-10" onClick={onClose}>&times;</button>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-1">{goal.title}</h2>
        <p className="text-gray-400 mb-6">
          {isCompleted ? "Simulation Complete!" : `Current Step (${currentStep + 1}/${plan.length})`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Actions & Controls */}
          <div className="flex flex-col space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-center">
              <p className="font-semibold text-gray-400 text-sm mb-1">{isCompleted ? "Final Step" : `Action ${currentStep + 1}`}</p>
              <p className="text-lg text-blue-300 mb-2 min-h-[56px] flex items-center justify-center">{isCompleted ? "Congratulations! You've completed the goal." : currentAction?.step}</p>
              <p className="text-sm text-gray-400">
                Projected Score: <span key={scoreKey} className="font-bold text-green-400 text-3xl inline-block animate-score-glow">{liveSimulatedScore}</span>
              </p>
            </div>

            {/* What-If Adjustments */}
            {manualAdjustments && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-300">What-If Adjustments</h3>
                        <div className="flex items-center gap-4">
                             <button
                                onClick={handleSaveSnapshot}
                                className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                                aria-label="Save current simulation as a snapshot"
                            >
                                Save Snapshot
                            </button>
                            <button
                                onClick={handleResetAdjustments}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                aria-label="Reset adjustments to their original values"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div className="sm:col-span-2">
                            <label htmlFor="utilization" className="block text-gray-400 mb-1">Utilization</label>
                            <div className="flex items-center gap-3">
                                <input type="range" id="utilization" min="0" max="100" value={manualAdjustments.utilization} onChange={(e) => handleAdjustmentChange('utilization', e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                <span className="font-mono text-blue-300 w-12 text-center bg-gray-700/50 rounded-md py-1">{manualAdjustments.utilization}%</span>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="inquiries" className="block text-gray-400 mb-1">Inquiries (2 yrs)</label>
                            <input type="number" id="inquiries" min="0" max="20" value={manualAdjustments.inquiries} onChange={(e) => handleAdjustmentChange('inquiries', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="latePayments" className="block text-gray-400 mb-1">Late Payments</label>
                            <input type="number" id="latePayments" min="0" max="20" value={manualAdjustments.latePayments} onChange={(e) => handleAdjustmentChange('latePayments', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="!mt-auto flex justify-between pt-2">
              <button onClick={handlePrevStep} disabled={currentStep === 0} className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 transition-colors hover:bg-gray-600">Previous</button>
              <button onClick={handleNextStep} disabled={isCompleted} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:bg-gray-500 transition-colors hover:bg-blue-500">
                {isCompleted ? 'Finished' : 'Next Step'}
              </button>
            </div>
          </div>
          
          {/* Right Column: Chart & Tabs */}
          <div className="space-y-4">
            <div className="h-48">
                <Line data={chartData} options={chartOptions} />
            </div>
            
            <div>
              <div className="border-b border-gray-700">
                  <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                      <button
                          onClick={() => setActiveTab('projections')}
                          className={`whitespace-nowrap py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === 'projections'
                                  ? 'border-blue-500 text-white'
                                  : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                      >
                          Projections
                      </button>
                      <button
                          onClick={() => setActiveTab('history')}
                          className={`whitespace-nowrap py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === 'history'
                                  ? 'border-blue-500 text-white'
                                  : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                      >
                          History
                      </button>
                  </nav>
              </div>
              <div className="mt-4">
                  {activeTab === 'projections' && (
                      <div className="space-y-4 animate-fade-in">
                          <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Achievements</h3>
                            <div className="flex flex-wrap gap-2 min-h-[30px]">
                            {badges.map((b, idx) => (
                                <span key={idx} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium animate-fade-in">{b}</span>
                            ))}
                            {badges.length === 0 && <p className="text-sm text-gray-500 italic">Complete steps to earn badges!</p>}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-300"><CalendarIcon className="h-5 w-5"/> Monthly Plan</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                              {calendar.map((m, idx) => (
                                <div key={idx} className={`border rounded-lg p-2 text-xs transition-colors ${m.step ? 'bg-green-900/50 border-green-700' : 'bg-gray-700/50 border-gray-600'}`}>
                                  <p className="font-bold text-gray-200">{m.month}</p>
                                  {m.step && <p className="text-green-300 mt-1">{m.step}</p>}
                                  {m.score && <p className="font-semibold mt-1">Score: {m.score}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                      </div>
                  )}
                  {activeTab === 'history' && (
                      <div className="animate-fade-in">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-300"><ClockIcon className="h-5 w-5"/> Simulation History</h3>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                            {history.length > 0 ? (
                                history.map((item, index) => (
                                    <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm animate-fade-in">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-lg text-white">Score: {item.score}</p>
                                            <p className="text-xs text-gray-400">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className="text-xs text-gray-300 mt-1">
                                            Util: <span className="font-mono">{item.adjustments.utilization}%</span> | 
                                            Inq: <span className="font-mono">{item.adjustments.inquiries}</span> | 
                                            Late: <span className="font-mono">{item.adjustments.latePayments}</span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500 italic">
                                        Use "Save Snapshot" to track your what-if scenarios here.
                                    </p>
                                </div>
                            )}
                        </div>
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorModal;