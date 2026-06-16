export interface AgentLog {
  id: string;
  result_id: string;
  agent_name: string;
  action: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  retry_count: number;
  timestamp: string;
}

export interface MetricsSnapshot {
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  avg_cost_usd: number;
  total_queries: number;
  success_rate: number;
}
