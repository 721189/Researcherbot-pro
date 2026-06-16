-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Research queries table
CREATE TABLE IF NOT EXISTS research_queries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research results table
CREATE TABLE IF NOT EXISTS research_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query_id UUID REFERENCES research_queries(id) ON DELETE CASCADE,
  search_results JSONB,
  extracted_data JSONB,
  synthesized_report TEXT,
  citations JSONB,
  status TEXT DEFAULT 'pending',
  latency_ms INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent logs table (immutable audit trail)
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  result_id UUID REFERENCES research_results(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_queries_user_id ON research_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_research_results_query_id ON research_results(query_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_result_id ON agent_logs(result_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_research_queries_updated_at
BEFORE UPDATE ON research_queries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only see their own data)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own queries" ON research_queries
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own queries" ON research_queries
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own queries" ON research_queries
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own queries" ON research_queries
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own results" ON research_results
  FOR SELECT USING (
    query_id IN (SELECT id FROM research_queries WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can insert their own results" ON research_results
  FOR INSERT WITH CHECK (
    query_id IN (SELECT id FROM research_queries WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can update their own results" ON research_results
  FOR UPDATE USING (
    query_id IN (SELECT id FROM research_queries WHERE user_id = auth.uid() OR user_id IS NULL)
  );

CREATE POLICY "Users can view their own agent logs" ON agent_logs
  FOR SELECT USING (
    result_id IN (
      SELECT r.id FROM research_results r
      JOIN research_queries q ON r.query_id = q.id
      WHERE q.user_id = auth.uid() OR q.user_id IS NULL
    )
  );

CREATE POLICY "Users can insert their own agent logs" ON agent_logs
  FOR INSERT WITH CHECK (
    result_id IN (
      SELECT r.id FROM research_results r
      JOIN research_queries q ON r.query_id = q.id
      WHERE q.user_id = auth.uid() OR q.user_id IS NULL
    )
  );
