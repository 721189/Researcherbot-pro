import React from 'react';
import { Clock, DollarSign, Activity } from 'lucide-react';
import { formatLatency, formatCost } from '../../utils/formatters';

interface MetricsBadgeProps {
  type: 'latency' | 'cost' | 'rate';
  value: number | undefined;
}

export const MetricsBadge: React.FC<MetricsBadgeProps> = ({ type, value }) => {
  if (value === undefined || value === null) return null;

  const getConfig = () => {
    switch (type) {
      case 'latency':
        return {
          icon: Clock,
          text: formatLatency(value),
          color: value < 5000 ? 'text-emerald-400' : value < 10000 ? 'text-amber-400' : 'text-red-400'
        };
      case 'cost':
        return {
          icon: DollarSign,
          text: formatCost(value),
          color: value < 0.05 ? 'text-emerald-400' : value < 0.10 ? 'text-amber-400' : 'text-red-400'
        };
      case 'rate':
        return {
          icon: Activity,
          text: `${value.toFixed(1)}%`,
          color: value > 90 ? 'text-emerald-400' : value > 70 ? 'text-amber-400' : 'text-red-400'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 bg-surface-800 px-2 py-1 rounded border border-surface-700 text-xs font-medium ${config.color}`} title={type}>
      <Icon size={12} />
      <span>{config.text}</span>
    </div>
  );
};
