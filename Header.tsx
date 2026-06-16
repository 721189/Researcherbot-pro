import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Command } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/new') return 'New Research Query';
    if (location.pathname === '/history') return 'Query History';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname.startsWith('/query/')) return 'Research Details';
    return '';
  };

  return (
    <header className="h-16 border-b border-surface-800 glass-subtle flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-100">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-surface-900 border border-surface-700 rounded-md px-3 py-1.5 text-sm text-gray-400">
          <Command size={14} />
          <span>+</span>
          <span>N</span>
          <span className="ml-2">New Query</span>
        </div>
        
        <button className="p-2 text-gray-400 hover:text-gray-100 rounded-full hover:bg-surface-800 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
