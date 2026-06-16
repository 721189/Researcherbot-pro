import { Status } from './research';

export interface AgentStep {
  agent_name: string;
  status: 'running' | 'success' | 'failed' | 'warning' | 'error' | 'completed';
  message: string;
  timestamp: string;
  progress: number;
}

export interface WorkflowStatus {
  query_id: string;
  current_agent: string;
  steps: AgentStep[];
  overall_status: Status;
  progress: number;
}
