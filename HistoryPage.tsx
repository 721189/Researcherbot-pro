import React from 'react';
import { QueryTable } from '../components/dashboard/QueryTable';
import { useResearch } from '../context/ResearchContext';

export const HistoryPage: React.FC = () => {
  const { queries, loading } = useResearch();

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Query History</h1>
        <p className="text-gray-400">Review all your past autonomous research runs.</p>
      </div>

      <QueryTable queries={queries} loading={loading} />
    </div>
  );
};
