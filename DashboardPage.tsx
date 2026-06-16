import React, { useEffect, useState } from 'react';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { QueryTable } from '../components/dashboard/QueryTable';
import { useResearch } from '../context/ResearchContext';
import { api } from '../services/api';
import { MetricsSnapshot } from '../types/logs';

export const DashboardPage: React.FC = () => {
  const { queries, loading } = useResearch();
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();
  }, [queries]); // Refresh metrics when queries change

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Overview</h1>
        <p className="text-gray-400">Monitor your AI research agents and system performance.</p>
      </div>

      <DashboardCards metrics={metrics} loading={metricsLoading} />
      
      <div className="mt-8">
        <QueryTable queries={queries} loading={loading} limit={5} />
      </div>
    </div>
  );
};
