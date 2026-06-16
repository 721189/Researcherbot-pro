import React, { useEffect, useState } from 'react';
import { AgentStep } from '../../types/agents';
import { Status } from '../../types/research';
import { Search, FileText, PenTool, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatLatency } from '../../utils/formatters';

interface QueryProgressProps {
  status: Status;
  steps: AgentStep[];
  queryId: string;
}

export const QueryProgress: React.FC<QueryProgressProps> = ({ status, steps }) => {
  const [elapsed, setElapsed] = useState(0);

  // Timer for active runs
  useEffect(() => {
    let interval: any;
    if (status !== 'completed' && status !== 'failed' && status !== 'partial_success') {
      interval = setInterval(() => {
        setElapsed(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Determine current active agent from steps
  const getActiveStageIndex = () => {
    if (status === 'completed' || status === 'partial_success') return 3;
    if (status === 'failed') {
      if (steps.some(s => s.agent_name === 'synthesizer')) return 2;
      if (steps.some(s => s.agent_name === 'extractor')) return 1;
      return 0;
    }
    
    // Look backwards through steps for the latest running/success event
    for (let i = steps.length - 1; i >= 0; i--) {
      const s = steps[i];
      if (s.agent_name === 'synthesizer') return 2;
      if (s.agent_name === 'extractor') return 1;
      if (s.agent_name === 'searcher') return 0;
    }
    return 0; // Default to searcher
  };

  const activeIndex = getActiveStageIndex();
  
  const stages = [
    { id: 'searcher', label: 'Searching Web', icon: Search },
    { id: 'extractor', label: 'Extracting Data', icon: FileText },
    { id: 'synthesizer', label: 'Synthesizing Report', icon: PenTool },
  ];

  // Get the most recent relevant message
  const currentMessage = steps.length > 0 ? steps[steps.length - 1].message : 'Initializing...';
  const isFailed = status === 'failed';

  return (
    <div className="glass rounded-xl p-8 border border-surface-800 animate-slide-up mb-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-semibold text-gray-100">Live Research Progress</h3>
        <div className="text-sm font-mono text-primary-400 bg-primary-500/10 px-3 py-1 rounded border border-primary-500/20 flex items-center gap-2">
          <Clock size={14} />
          {formatLatency(elapsed)}
        </div>
      </div>

      {/* Stepper */}
      <div className="relative flex justify-between mb-12 max-w-3xl mx-auto">
        {/* Connecting lines */}
        <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-surface-700 -z-10">
          <div 
            className={`h-full transition-all duration-1000 ease-in-out ${isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
            style={{ width: `${(activeIndex / 2) * 100}%` }}
          ></div>
        </div>

        {stages.map((stage, idx) => {
          const isCompleted = idx < activeIndex || (idx === 2 && (status === 'completed' || status === 'partial_success'));
          const isActive = idx === activeIndex && !isCompleted && !isFailed;
          const isError = isFailed && idx === activeIndex;
          
          let circleClasses = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ";
          let iconColor = "";

          if (isCompleted) {
            circleClasses += "bg-surface-900 border-emerald-500";
            iconColor = "text-emerald-400";
          } else if (isActive) {
            circleClasses += "bg-surface-900 border-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]";
            iconColor = "text-primary-400 animate-pulse";
          } else if (isError) {
            circleClasses += "bg-surface-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
            iconColor = "text-red-400";
          } else {
            circleClasses += "bg-surface-900 border-surface-700";
            iconColor = "text-gray-500";
          }

          return (
            <div key={stage.id} className="flex flex-col items-center relative z-10 w-1/3">
              <div className={circleClasses}>
                {isCompleted ? <CheckCircle2 size={24} className={iconColor} /> : <stage.icon size={24} className={iconColor} />}
              </div>
              <span className={`mt-3 text-sm font-medium transition-colors ${isActive ? 'text-primary-400' : isCompleted ? 'text-gray-300' : isError ? 'text-red-400' : 'text-gray-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Status Message Card */}
      <div className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${
        isFailed 
          ? 'bg-red-500/10 border-red-500/30' 
          : status === 'completed' 
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-surface-800 border-surface-700'
      }`}>
        {isFailed ? (
          <AlertCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
        ) : status === 'completed' ? (
          <CheckCircle2 size={20} className="text-emerald-400 mt-0.5 shrink-0" />
        ) : (
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mt-0.5 shrink-0"></div>
        )}
        <div className="flex-1">
          <p className={`font-medium ${isFailed ? 'text-red-400' : status === 'completed' ? 'text-emerald-400' : 'text-gray-200'}`}>
            {isFailed ? 'Research Failed' : status === 'completed' ? 'Research Complete' : 'Agent Activity'}
          </p>
          <p className="text-sm text-gray-400 mt-1">{currentMessage}</p>
        </div>
      </div>
    </div>
  );
};
