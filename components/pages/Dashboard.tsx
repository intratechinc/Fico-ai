import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in p-8">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-lg text-gray-400">
        This feature is coming soon!
      </p>
      <p className="mt-1 text-gray-500 max-w-md">
        Here you'll find visual charts tracking your score over time, summaries of your credit health, and historical trends from your simulations.
      </p>
    </div>
  );
};

export default DashboardPage;