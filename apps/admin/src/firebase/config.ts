import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  projectId: string;
  isMockMode: boolean;
  missingKeys: string[];
}

const env: Record<string, string | undefined> = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string | undefined> }).env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'portfolio-yosr-v2.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'portfolio-yosr-v2',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'portfolio-yosr-v2.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([k, v]) => !v && k !== 'storageBucket')
  .map(([k]) => k);

export const isFirebaseConfigured = missingKeys.length === 0;
export const isMockMode = env.VITE_USE_LOCAL_MOCK_STORAGE === 'true' || !isFirebaseConfigured;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured && !isMockMode) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.info('[Firebase] Initialized connection to project: portfolio-yosr-v2');
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to offline mode:', err);
  }
}

export { app, auth, db };

export function getFirebaseStatus(): FirebaseConfigStatus {
  return {
    isConfigured: isFirebaseConfigured,
    projectId: 'portfolio-yosr-v2',
    isMockMode,
    missingKeys,
  };
}
