import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = auth().onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setInitialized(true);
        setError(null);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('❌ useAuth hook error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  return { user, loading, initialized, error };
};
