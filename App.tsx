import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './components/Sidebar';
import SimulatorPage from './components/pages/Simulator';
import DashboardPage from './components/pages/Dashboard';
import HistoryPage from './components/pages/History';
import SettingsPage from './components/pages/Settings';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial route correctly

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const currentRoute = route === '#' ? '#/' : route;

  const renderPage = () => {
    switch (currentRoute) {
      case '#/dashboard':
        return <DashboardPage />;
      case '#/history':
        return <HistoryPage />;
      case '#/settings':
        return <SettingsPage />;
      case '#/':
      default:
        return <SimulatorPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans antialiased">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentRoute={currentRoute} />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto h-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
