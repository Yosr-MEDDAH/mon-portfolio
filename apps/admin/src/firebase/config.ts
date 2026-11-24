import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const FIREBASE_PROJECT_ID = 'portfolio-yosr-v2';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  projectId: string;
  missingKeys: string[];
  initError: string | null;
}

type ViteEnv = Record<string, string | boolean | undefined>;

const env: ViteEnv =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: ViteEnv }).env) ||
  {};

function readEnv(key: string): string | undefined {
  const value = env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Public Firebase Web App configuration.
 *
 * These identifiers are shipped to every browser by design (Firebase Web API keys
 * are not secrets). Environment variables always take precedence so that a
 * different web app can be configured without editing this file. The values
 * below keep production builds working even when `.env.local` is absent, which
 * is the case in GitHub Actions because local env files are intentionally ignored.
 */
const DEFAULT_FIREBASE_CONFIG: Required<
  Pick<
    FirebaseOptions,
    'apiKey' | 'authDomain' | 'projectId' | 'storageBucket' | 'messagingSenderId' | 'appId'
  >
> = {
  apiKey: 'AIzaSyAVi1cQXWnzdXwmUkEs9e0xQ54dDSrSTn8',
  authDomain: 'portfolio-yosr-v2.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: 'portfolio-yosr-v2.appspot.com',
  messagingSenderId: '190568254577',
  appId: '1:190568254577:web:b66a94c3ccc01bca729fd0',
};

const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY') || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN') || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID') || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET') || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: readEnv('VITE_FIREBASE_APP_ID') || DEFAULT_FIREBASE_CONFIG.appId,
};

const requiredKeys: Array<keyof FirebaseOptions> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredKeys
  .filter((key) => !firebaseConfig[key])
  .map((key) => String(key));

export const isFirebaseConfigured = missingKeys.length === 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initError: string | null = null;

if (!isFirebaseConfigured) {
  initError = `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}.`;
} else if (firebaseConfig.projectId !== FIREBASE_PROJECT_ID) {
  initError = `Unexpected Firebase project "${firebaseConfig.projectId}". Expected "${FIREBASE_PROJECT_ID}".`;
} else {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.info(`[Firebase] Initialized project: ${FIREBASE_PROJECT_ID}`);
  } catch (err) {
    initError = err instanceof Error ? err.message : 'Firebase initialization failed.';
    console.error('[Firebase] Initialization failed:', err);
  }
}

export { app, auth, db };

export function getFirebaseStatus(): FirebaseConfigStatus {
  return {
    isConfigured: isFirebaseConfigured && !initError,
    projectId: firebaseConfig.projectId || FIREBASE_PROJECT_ID,
    missingKeys,
    initError,
  };
}
