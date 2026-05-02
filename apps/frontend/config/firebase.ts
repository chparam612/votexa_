import auth from '@react-native-firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Web SDK is still needed for Firestore.
// Auth is handled natively via @react-native-firebase/auth
// which auto-initialises from google-services.json (Android).

const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const missingVars = requiredEnvVars.filter(
  (key) => !process.env[key]
);

if (missingVars.length > 0) {
  console.warn(
    `[Firebase] Missing environment variables: ${missingVars.join(', ')}. ` +
      'Ensure apps/frontend/.env exists with all required EXPO_PUBLIC_FIREBASE_* values.'
  );
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// The definite assignment assertion (!) is safe here: if initializeApp throws,
// the module itself throws and `db` is never exported in an undefined state.
let db!: Firestore;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  console.log('[Firebase] Web SDK initialized successfully');
} catch (error) {
  console.error('[Firebase] Web SDK initialization failed:', error);
  throw error;
}

export { auth, db };
