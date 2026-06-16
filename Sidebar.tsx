import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PlusCircle, History, Settings, LogOut, Bot } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Query', path: '/new', icon: PlusCircle },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-surface-900 border-r border-surface-800 flex flex-col h-full hidden md:flex shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-lg">
          <Bot size={24} className="text-white" />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-white">ResearchBot<span className="text-primary-400">Pro</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-surface-800 border-l-2 border-transparent'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary-400' : 'text-gray-400'} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-sm font-medium text-gray-200">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
