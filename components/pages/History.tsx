import React from 'react';
import { ClockIcon } from '../Icons';

const HistoryPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in p-8">
      <ClockIcon className="h-16 w-16 text-purple-400 mb-4" />
      <h1 className="text-3xl font-bold text-white">Simulation History</h1>
      <p className="mt-2 text-lg text-gray-400">
        This feature is coming soon!
      </p>
      <p className="mt-1 text-gray-500 max-w-md">
        Review your past credit report analyses and saved "what-if" simulation snapshots to see how far you've come.
      </p>
    </div>
  );
};

export default HistoryPage;
