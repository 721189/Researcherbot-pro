import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, Server, Database, Key } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="animate-fade-in pb-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-400">Manage your ResearchBot Pro configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="glass rounded-xl border border-surface-800 overflow-hidden">
          <div className="bg-surface-900/50 border-b border-surface-800 p-4">
            <h3 className="font-semibold text-gray-100 flex items-center gap-2">
              <Settings size={18} className="text-primary-400" />
              Account Profile
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center text-2xl font-medium text-gray-200">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-100">{user?.email}</p>
                <p className="text-sm text-gray-400">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys Settings */}
        <div className="glass rounded-xl border border-surface-800 overflow-hidden">
          <div className="bg-surface-900/50 border-b border-surface-800 p-4">
            <h3 className="font-semibold text-gray-100 flex items-center gap-2">
              <Key size={18} className="text-accent-400" />
              API Configuration
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">OpenAI API Key</label>
                <input 
                  type="password" 
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="sk-..." 
                  defaultValue="sk-********************************"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Configured securely via backend environment variables.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Serper API Key</label>
                <input 
                  type="password" 
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg p-2.5 text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  placeholder="****************" 
                  defaultValue="****************"
                  disabled
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-xl border border-surface-800 p-6 flex items-start gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400 shrink-0">
              <Server size={24} />
            </div>
            <div>
              <h4 className="font-medium text-gray-100 mb-1">Backend Service</h4>
              <p className="text-sm text-gray-400">FastAPI running on localhost:8000. All agents operational.</p>
            </div>
          </div>
          
          <div className="glass rounded-xl border border-surface-800 p-6 flex items-start gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 shrink-0">
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-medium text-gray-100 mb-1">Database Connection</h4>
              <p className="text-sm text-gray-400">Supabase initialized. Immutable audit logs active.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
