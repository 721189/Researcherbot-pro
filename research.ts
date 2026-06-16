export type Status = 'pending' | 'running' | 'searching' | 'extracting' | 'synthesizing' | 'completed' | 'partial_success' | 'failed';

export interface ResearchQueryCreate {
  topic: string;
  title?: string;
}

export interface ResearchQuery {
  id: string;
  user_id?: string;
  title: string;
  topic: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: int;
}

export interface ExtractedData {
  key_facts: string[];
  statistics: string[];
  quotes: Array<{text: string; source: string}>;
  entities: string[];
}

export interface Citation {
  index: number;
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchResult {
  id: string;
  query_id: string;
  search_results?: SearchResult[];
  extracted_data?: ExtractedData;
  synthesized_report?: string;
  citations?: Citation[];
  status: Status;
  latency_ms?: number;
  cost_usd?: number;
  created_at: string;
}

export interface QueryWithResult {
  query: ResearchQuery;
  result: ResearchResult;
}
