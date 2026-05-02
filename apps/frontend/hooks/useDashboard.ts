import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';

export interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  event: string;
}

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  score: number;
  maps_url: string;
  avg_wait_minutes: number;
  crowd_factor: number;
}

export interface DashboardData {
  fsmState: string;
  progress: number;
  riskScore: number;
  actions: Action[];
  pollingStations: PollingStation[];
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!auth().currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await auth().currentUser?.getIdToken();
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl}/api/dashboard`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch dashboard data');
      
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        fetchDashboard();
      } else {
        setData(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
};
