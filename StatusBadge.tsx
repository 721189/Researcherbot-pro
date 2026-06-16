import React from 'react';
import { Status } from '../../types/research';
import { Clock, PlayCircle, CheckCircle2, XCircle, AlertCircle, Search, FileText, PenTool } from 'lucide-react';

interface StatusBadgeProps {
  status: Status | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return { icon: Clock, className: 'status-pending', label: 'Pending' };
      case 'running':
        return { icon: PlayCircle, className: 'status-running', label: 'Running' };
      case 'searching':
        return { icon: Search, className: 'status-searching', label: 'Searching' };
      case 'extracting':
        return { icon: FileText, className: 'status-extracting', label: 'Extracting' };
      case 'synthesizing':
        return { icon: PenTool, className: 'status-synthesizing', label: 'Synthesizing' };
      case 'completed':
      case 'success':
        return { icon: CheckCircle2, className: 'status-completed', label: 'Completed' };
      case 'failed':
        return { icon: XCircle, className: 'status-failed', label: 'Failed' };
      case 'partial_success':
        return { icon: AlertCircle, className: 'status-partial', label: 'Partial Success' };
      default:
        return { icon: Clock, className: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: status };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </div>
  );
};
