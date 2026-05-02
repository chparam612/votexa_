import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  distance_km: number;
  avg_wait_minutes: number;
  score: number;
  crowd_factor: number;
  maps_url: string;
}

export const usePolling = () => {
  const [stations, setStations] = useState<PollingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl}/api/polling-stations`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch polling stations');
      
      setStations(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, refetch: fetchStations };
};
