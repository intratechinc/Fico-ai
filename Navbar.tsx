import React from 'react';
import { FicoIcon, HamburgerIcon } from './components/Icons';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              <HamburgerIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FicoIcon className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">
              AI FICO Simulator
            </span>
          </div>

          <div className="flex items-center">
            <div className="w-8"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;