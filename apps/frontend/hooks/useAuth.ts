import { useState, useEffect } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = auth().onAuthStateChanged(
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          setInitialized(true);
        },
        (authError) => {
          console.error('[useAuth] Auth listener error:', authError);
          setError(authError.message);
          setLoading(false);
          setInitialized(true);
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Auth initialization failed';
      console.error('[useAuth] Failed to set up auth listener:', message);
      setError(message);
      setLoading(false);
      setInitialized(true);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user, loading, initialized, error };
};
