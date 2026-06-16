import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { QueryWithResult } from '../types/research';
import { AgentStep } from '../types/agents';
import { AgentLog } from '../types/logs';
import { QueryProgress } from '../components/query/QueryProgress';
import { ResultsView } from '../components/results/ResultsView';
import { AgentTimeline } from '../components/logs/AgentTimeline';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricsBadge } from '../components/common/MetricsBadge';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const QueryDetailsPage: React.FC = () => {
  const { queryId } = useParams<{ queryId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QueryWithResult | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to hold the latest data for SSE updates
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    if (!queryId) return;

    const loadData = async () => {
      try {
        const resultData = await api.getResearch(queryId);
        setData(resultData);
        
        if (resultData.result.id) {
          const logData = await api.getAgentLogs(resultData.result.id);
          setLogs(logData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load research details');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to SSE for live updates if not completed
    const unsubscribe = api.subscribeToProgress(queryId, (step) => {
      setSteps(prev => [...prev, step]);
      
      // If the step indicates completion or failure, reload the full data to get the final result
      if (step.overall_status === 'completed' || step.overall_status === 'failed' || step.overall_status === 'partial_success') {
        setTimeout(loadData, 1000); // slight delay to ensure DB is written
      }
      
      // If we are running, let's keep the local status updated so UI reflects it
      if (dataRef.current && dataRef.current.query.status !== step.overall_status) {
        setData(prev => prev ? {
          ...prev, 
          query: { ...prev.query, status: step.overall_status },
          result: { ...prev.result, status: step.overall_status }
        } : null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryId]);

  const handleExportLogs = () => {
    if (!logs.length) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_logs_${queryId?.substring(0,8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Loading research details...</div>;
  if (error) return <div className="p-12 text-center text-red-400">{error}</div>;
  if (!data) return <div className="p-12 text-center text-gray-400">Not found</div>;

  const isComplete = ['completed', 'failed', 'partial_success'].includes(data.query.status);

  return (
    <div className="pb-12 animate-fade-in">
      <button 
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to History
      </button>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-100">{data.query.title}</h1>
          <StatusBadge status={data.query.status} />
        </div>
        <div className="glass rounded-lg p-4 text-sm text-gray-300 border border-surface-800 flex flex-wrap gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Topic:</span>
            <span>{data.query.topic}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} />
            {formatDate(data.query.created_at)}
          </div>
          {data.result.latency_ms && <MetricsBadge type="latency" value={data.result.latency_ms} />}
          {data.result.cost_usd !== null && <MetricsBadge type="cost" value={data.result.cost_usd} />}
        </div>
      </div>

      {!isComplete && (
        <QueryProgress status={data.query.status} steps={steps} queryId={queryId!} />
      )}

      {isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ResultsView result={data.result} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AgentTimeline logs={logs} loading={false} onExport={handleExportLogs} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
