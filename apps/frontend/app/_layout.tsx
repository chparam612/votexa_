import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { auth } from '../config/firebase';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth().onAuthStateChanged((user) => {
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        // Redirect to dashboard if authenticated
        router.replace('/(app)/dashboard');
      }
    });

    return unsubscribe;
  }, [segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
