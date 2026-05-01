import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  distance: string;
  score: number;
  crowd_factor: number;
  avg_wait_minutes: number;
  location: { lat: number; lng: number };
}

export const usePolling = () => {
  const [stations, setStations] = useState<PollingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/polling-stations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch polling stations');
      const json = await res.json();
      setStations(json.stations || []);
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
