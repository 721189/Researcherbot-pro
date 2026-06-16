import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { MetricsSnapshot } from '../../types/logs';
import { formatLatency, formatCost } from '../../utils/formatters';

interface DashboardCardsProps {
  metrics: MetricsSnapshot | null;
  loading: boolean;
}

const AnimatedCounter: React.FC<{ value: number; formatFn?: (v: number) => string }> = ({ value, formatFn = (v) => v.toString() }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = Math.abs(Math.floor(totalDuration / end)) || 10;
    if (incrementTime > 50) incrementTime = 50;

    const timer = setInterval(() => {
      start += end > 100 ? Math.ceil(end / 20) : 1;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatFn(count)}</span>;
};

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass rounded-xl p-6 h-32 animate-pulse bg-surface-800"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Queries',
      value: metrics.total_queries,
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      format: (v: number) => v.toString()
    },
    {
      title: 'Success Rate',
      value: metrics.success_rate,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      format: (v: number) => `${v.toFixed(1)}%`
    },
    {
      title: 'Avg Latency (p50)',
      value: metrics.p50_latency_ms,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      format: (v: number) => formatLatency(v)
    },
    {
      title: 'Avg Cost/Query',
      value: metrics.avg_cost_usd,
      icon: DollarSign,
      color: 'from-fuchsia-500 to-purple-500',
      format: (v: number) => formatCost(v)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="glass glass-hover rounded-xl p-6 relative overflow-hidden group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <card.icon size={100} />
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
            <card.icon size={24} className="text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-100">
              <AnimatedCounter value={card.value} formatFn={card.format} />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
