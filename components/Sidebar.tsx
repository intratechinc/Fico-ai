import React from 'react';
import { FicoIcon, XIcon } from './Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentRoute }) => {
  const navItems = [
    { name: 'Simulator', href: '#/', current: currentRoute === '#/' },
    { name: 'Dashboard', href: '#/dashboard', current: currentRoute === '#/dashboard' },
    { name: 'History', href: '#/history', current: currentRoute === '#/history' },
    { name: 'Settings', href: '#/settings', current: currentRoute === '#/settings' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <FicoIcon className="h-7 w-7 text-blue-400" />
              <span className="text-lg font-bold text-white">Menu</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close menu">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={onClose} // Close sidebar on navigation for better UX
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-blue-600/50 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
            <p>&copy; 2024 AI FICO Simulator</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
