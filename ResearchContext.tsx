import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ResearchQuery } from '../types/research';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ResearchContextType {
  queries: ResearchQuery[];
  loading: boolean;
  error: string | null;
  refreshQueries: () => Promise<void>;
  deleteQuery: (id: string) => Promise<void>;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queries, setQueries] = useState<ResearchQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshQueries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listResearch();
      setQueries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshQueries();
    } else {
      setQueries([]);
      setLoading(false);
    }
  }, [user, refreshQueries]);

  const deleteQuery = async (id: string) => {
    try {
      await api.deleteResearch(id);
      setQueries(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      console.error('Delete failed:', err);
      throw err;
    }
  };

  return (
    <ResearchContext.Provider value={{ queries, loading, error, refreshQueries, deleteQuery }}>
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
