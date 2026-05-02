import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';

export interface RiskData {
  score: number;
  level: string;
  breakdown: any;
  recommendations: any[];
}

export const useRisk = () => {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRisk = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/risk`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch risk data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  return { data, loading, error, refetch: fetchRisk };
};
