import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { validateTopic } from '../../utils/validators';

export const NewQueryForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(new Event('submit') as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topic, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateTopic(topic);
    if (!validation.valid) {
      setError(validation.error || 'Invalid topic');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createResearch({ topic, title: title.trim() || undefined });
      navigate(`/query/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start research query');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in mt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-3">Start New Research</h1>
        <p className="text-gray-400">Enter a topic and our AI agents will search, extract, and synthesize a comprehensive report.</p>
      </div>

      <div className="glass rounded-2xl p-8 border border-surface-800 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl"></div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
              Research Topic <span className="text-red-400">*</span>
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={`w-full bg-surface-900 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-surface-700 focus:border-primary-500'} rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none`}
              placeholder="e.g., Impact of quantum computing on modern cryptography protocols by 2030..."
              rows={4}
              disabled={loading}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className={error ? 'text-red-400' : 'text-gray-500'}>{error || ''}</span>
              <span className={`${topic.length > 500 ? 'text-red-400' : 'text-gray-500'}`}>{topic.length}/500</span>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Report Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-xl p-3 text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
              placeholder="Leave blank to auto-generate"
              disabled={loading}
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500 hidden sm:block">
              Press <kbd className="bg-surface-800 px-2 py-1 rounded border border-surface-700 font-mono text-xs text-gray-400">Ctrl</kbd> + <kbd className="bg-surface-800 px-2 py-1 rounded border border-surface-700 font-mono text-xs text-gray-400">Enter</kbd> to submit
            </div>
            <button
              type="submit"
              disabled={loading || !topic.trim() || topic.length > 500}
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 disabled:from-surface-700 disabled:to-surface-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/25"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Initializing Agents...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Start Research</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
