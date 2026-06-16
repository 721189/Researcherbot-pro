import React, { useState } from 'react';
import { AgentLog } from '../../types/logs';
import { formatDate } from '../../utils/formatters';
import { ChevronDown, ChevronRight, AlertTriangle, XCircle, Download, Bot, TerminalSquare } from 'lucide-react';

interface AgentTimelineProps {
  logs: AgentLog[];
  loading: boolean;
  onExport: () => void;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ logs, loading, onExport }) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getAgentColor = (name: string) => {
    if (name === 'searcher') return 'bg-indigo-500 shadow-indigo-500/50';
    if (name === 'extractor') return 'bg-emerald-500 shadow-emerald-500/50';
    if (name === 'synthesizer') return 'bg-violet-500 shadow-violet-500/50';
    return 'bg-gray-500 shadow-gray-500/50';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-surface-800">
        <div className="h-6 w-32 bg-surface-800 animate-shimmer rounded mb-6"></div>
        <div className="space-y-4 pl-4 border-l-2 border-surface-800">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-surface-800 animate-shimmer rounded-lg relative">
              <div className="absolute -left-[21px] top-4 w-4 h-4 rounded-full bg-surface-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-surface-800 overflow-hidden flex flex-col h-[600px]">
      <div className="bg-surface-900/50 border-b border-surface-800 p-4 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-gray-100 flex items-center gap-2">
          <TerminalSquare size={18} className="text-gray-400" />
          Agent Audit Trail
        </h3>
        <button 
          onClick={onExport}
          disabled={logs.length === 0}
          className="text-sm font-medium text-gray-400 hover:text-white bg-surface-800 hover:bg-surface-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={14} />
          Export JSON
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No logs available.</div>
        ) : (
          <div className="relative border-l-2 border-surface-800 ml-4 space-y-6 pb-4">
            {logs.map((log, index) => {
              const isError = log.action.includes('failed') || log.error;
              const isRetry = log.retry_count > 0;
              const isExpanded = expandedLogs.has(log.id);

              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface-900 shadow-md ${isError ? 'bg-red-500 shadow-red-500/50' : getAgentColor(log.agent_name)}`}></div>
                  
                  {/* Log Card */}
                  <div 
                    className={`rounded-lg border transition-colors cursor-pointer ${
                      isError 
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                        : isExpanded 
                          ? 'bg-surface-800 border-surface-600' 
                          : 'bg-surface-900/50 border-surface-800 hover:border-surface-600'
                    }`}
                    onClick={() => toggleExpand(log.id)}
                  >
                    <div className="p-3 flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-gray-300 uppercase px-1.5 py-0.5 rounded bg-surface-900 border border-surface-700 flex items-center gap-1">
                            <Bot size={10} />
                            {log.agent_name}
                          </span>
                          <span className={`text-sm font-medium truncate ${isError ? 'text-red-400' : 'text-gray-200'}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          {isRetry && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 rounded-sm">
                              <AlertTriangle size={10} />
                              Attempt {log.retry_count + 1}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                      <div className="shrink-0 text-gray-500 mt-1">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-surface-800/50 mt-1 space-y-3 cursor-text" onClick={e => e.stopPropagation()}>
                        {log.error && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-sm text-red-400 flex items-start gap-2 overflow-x-auto">
                            <XCircle size={16} className="mt-0.5 shrink-0" />
                            <pre className="font-mono text-[11px] whitespace-pre-wrap">{log.error}</pre>
                          </div>
                        )}
                        
                        {log.input && Object.keys(log.input).length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-gray-500 mb-1 block">Input Payload</span>
                            <pre className="bg-surface-900 p-2 rounded border border-surface-700 text-[11px] text-gray-300 font-mono overflow-x-auto">
                              {JSON.stringify(log.input, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.output && Object.keys(log.output).length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-gray-500 mb-1 block">Output Payload</span>
                            <pre className="bg-surface-900 p-2 rounded border border-surface-700 text-[11px] text-accent-300 font-mono overflow-x-auto max-h-48">
                              {JSON.stringify(log.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
