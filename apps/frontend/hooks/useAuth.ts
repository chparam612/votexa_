import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if auth is properly initialized
    if (!auth) {
      console.error('❌ Firebase auth not initialized');
      setError('Firebase authentication not available');
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          setInitialized(true);
          setError(null);
        },
        (error) => {
          console.error('❌ Auth state listener error:', error);
          setError(error.message || 'Authentication error');
          setLoading(false);
          setInitialized(true);
        },
      );

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
