import React from 'react';

// Icons are now correctly passing the className prop to the SVG element
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const HistoryPage: React.FC = () => {
  // Mock data for demonstration
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
