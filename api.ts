import { ResearchQueryCreate, ResearchQuery, QueryWithResult } from '../types/research';
import { AgentLog, MetricsSnapshot } from '../types/logs';
import { AgentStep } from '../types/agents';
import { supabase } from './supabase';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  }
  
  headers.set('Content-Type', 'application/json');
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(response.status, errorData?.detail || response.statusText);
  }
  
  return response.json();
}

export const api = {
  // Research
  createResearch: (data: ResearchQueryCreate): Promise<{id: string, status: string}> => 
    fetchWithAuth('/research', { method: 'POST', body: JSON.stringify(data) }),
    
  listResearch: (limit = 50, offset = 0): Promise<ResearchQuery[]> =>
    fetchWithAuth(`/research?limit=${limit}&offset=${offset}`),
    
  getResearch: (queryId: string): Promise<QueryWithResult> =>
    fetchWithAuth(`/research/${queryId}`),
    
  deleteResearch: (queryId: string): Promise<{status: string}> =>
    fetchWithAuth(`/research/${queryId}`, { method: 'DELETE' }),
    
  // Logs
  getAgentLogs: (resultId: string): Promise<AgentLog[]> =>
    fetchWithAuth(`/logs/${resultId}`),
    
  // Metrics
  getMetrics: (): Promise<MetricsSnapshot> =>
    fetchWithAuth('/metrics'),
    
  getHealth: (): Promise<{status: string}> =>
    fetchWithAuth('/metrics/health'),
    
  // SSE Streaming
  subscribeToProgress: (queryId: string, onStep: (step: AgentStep) => void): (() => void) => {
    const eventSource = new EventSource(`${API_BASE}/research/${queryId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const step = JSON.parse(event.data);
        onStep(step);
      } catch (e) {
        console.error('Failed to parse SSE message', e);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE Error', error);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }
};
