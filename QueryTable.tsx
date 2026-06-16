import React from 'react';
import { ResearchQuery } from '../../types/research';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Trash2 } from 'lucide-react';
import { useResearch } from '../../context/ResearchContext';

interface QueryTableProps {
  queries: ResearchQuery[];
  loading: boolean;
  limit?: number;
}

export const QueryTable: React.FC<QueryTableProps> = ({ queries, loading, limit }) => {
  const navigate = useNavigate();
  const { deleteQuery } = useResearch();

  const displayQueries = limit ? queries.slice(0, limit) : queries;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this query?')) {
      await deleteQuery(id);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl overflow-hidden border border-surface-800">
        <div className="p-6 border-b border-surface-800">
          <h3 className="text-lg font-semibold text-gray-100">Recent Queries</h3>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 w-full bg-surface-800 animate-shimmer rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center border border-surface-800">
        <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
          <Search size={32} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">No research queries yet</h3>
        <p className="text-gray-400 mb-6 max-w-md">Start your first autonomous research query to see the agents in action.</p>
        <button 
          onClick={() => navigate('/new')}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20"
        >
          New Query
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden border border-surface-800">
      <div className="p-6 border-b border-surface-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-100">Recent Queries</h3>
        {limit && queries.length > limit && (
          <button onClick={() => navigate('/history')} className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            View All
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium border-b border-surface-800">Topic</th>
              <th className="px-6 py-4 font-medium border-b border-surface-800">Status</th>
              <th className="px-6 py-4 font-medium border-b border-surface-800">Date</th>
              <th className="px-6 py-4 font-medium border-b border-surface-800 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {displayQueries.map((query) => (
              <tr 
                key={query.id} 
                onClick={() => navigate(`/query/${query.id}`)}
                className="hover:bg-surface-800/50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-100 mb-1 line-clamp-1">{query.title}</div>
                  <div className="text-sm text-gray-400 line-clamp-1">{query.topic}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={query.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {formatDate(query.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, query.id)}
                      className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete query"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={20} className="text-gray-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
