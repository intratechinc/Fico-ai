import React, { useState, useCallback, useMemo } from 'react';
import { analyzeCreditReport } from '../../services/geminiService';
import { CreditData, Goal, AppState } from '../../types';
import SimulatorModal from '../SimulatorModal';
import GoalCard from '../GoalCard';
import FileUpload from '../../FileUpload';
import { SparklesIcon, AlertIcon, ArrowPathIcon, DocumentArrowUpIcon, ClipboardIcon } from '../Icons';
import { calculateFicoScore } from '../../utils/ficoScoreCalculator';

type InputMethod = 'upload' | 'paste';

const SimulatorPage: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [reportData, setReportData] = useState<{ content: string; mimeType: string } | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethod>('upload');
  const [pastedText, setPastedText] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!reportData) {
      setError("Please provide your credit report data before analyzing.");
      return;
    }
    setAppState('loading');
    setError(null);
    setCreditData(null);
    setGoals([]);

    try {
      const result = await analyzeCreditReport(reportData);
      if (result && result.credit_data && result.personalized_goals) {
        setCreditData(result.credit_data);
        setGoals(result.personalized_goals);
        setAppState('results');
      } else {
        throw new Error("Received invalid data structure from AI. Please try again.");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to analyze report. ${errorMessage}`);
      setAppState('error');
    }
  }, [reportData]);

  const handleSelectGoal = useCallback((goal: Goal) => {
    setSelectedGoal(goal);
  }, []);

  const handleReset = () => {
    setAppState('idle');
    setReportData(null);
    setCreditData(null);
    setGoals([]);
    setSelectedGoal(null);
    setError(null);
    setPastedText('');
  };
  
  const handleClearInput = () => {
    setReportData(null);
    setError(null);
    setPastedText('');
  };
  
  const switchInputMethod = (method: InputMethod) => {
    if (inputMethod !== method) {
      setInputMethod(method);
      handleClearInput();
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    if (text) {
      setReportData({ content: text, mimeType: 'text/plain' });
      setError(null);
    } else {
      setReportData(null);
    }
  };


  const initialScore = useMemo(() => {
    if (!creditData) return 650;
    return calculateFicoScore(creditData);
  }, [creditData]);


  return (
    <>
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Welcome to the FICO Simulator
        </h1>
        <p className="mt-2 text-md text-gray-400">
          Upload your credit report to get personalized goals and simulate your score improvement.
        </p>
      </div>

      {appState === 'idle' || appState === 'loading' || appState === 'error' ? (
        <section className="bg-gray-800/50 p-6 rounded-2xl shadow-lg animate-slide-up border border-gray-700">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-purple-400" /> Get Started</h2>
          
          <div className="flex border-b border-gray-700 mb-4">
              <button 
                  onClick={() => switchInputMethod('upload')}
                  className={`flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors ${inputMethod === 'upload' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  Upload File
              </button>
              <button 
                  onClick={() => switchInputMethod('paste')}
                  className={`flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors ${inputMethod === 'paste' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                  <ClipboardIcon className="h-5 w-5" />
                  Paste Text
              </button>
          </div>

          {inputMethod === 'upload' && (
            <FileUpload 
              onFileRead={setReportData}
              onClear={handleClearInput}
              onError={setError}
              disabled={appState === 'loading'}
            />
          )}

          {inputMethod === 'paste' && (
            <div>
              <textarea
                value={pastedText}
                onChange={handleTextChange}
                placeholder="Paste your credit report data here..."
                className="w-full h-48 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-200"
                disabled={appState === 'loading'}
              />
            </div>
          )}


          <button
            onClick={handleAnalyze}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={appState === 'loading' || !reportData}
          >
            {appState === 'loading' ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                Analyzing with Gemini AI...
              </>
            ) : (
              'Analyze Report'
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-2">
              <AlertIcon className="h-5 w-5"/>
              <span>{error}</span>
            </div>
          )}
        </section>
      ) : null}

      {appState === 'results' && creditData && (
        <section className="animate-fade-in space-y-8">
          <div className="text-center p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-lg animate-fade-in-down">
            <h3 className="text-gray-400 font-medium tracking-wide">Your Estimated FICO Score</h3>
            <p key={initialScore} className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500 my-2 animate-score-bump">
                {initialScore}
            </p>
            <button onClick={handleReset} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Start Over</button>
          </div>
          
          <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Your Personalized Goals</h2>
                <p className="text-gray-400 mt-1">Select a goal to start simulating your score improvement.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal, index) => (
                <GoalCard key={goal.goal_id} goal={goal} onSelect={() => handleSelectGoal(goal)} index={index}/>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedGoal && creditData && (
        <SimulatorModal
          isOpen={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
          goal={selectedGoal}
          initialScore={initialScore}
          creditData={creditData}
        />
      )}
    </>
  );
};

export default SimulatorPage;
