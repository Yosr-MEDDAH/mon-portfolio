import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isMockMode } from './config.ts';
import type { AdminUser } from '../shared/types.ts';

export interface AuthState {
  user: User | null;
  adminData: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

const MOCK_STORAGE_KEY_USER = 'cms_admin_mock_user';

export async function loginWithEmail(email: string, pass: string): Promise<User | { uid: string; email: string }> {
  if (!isMockMode && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  }

  // Simulated local offline mode
  if (email.trim().toLowerCase() === 'admin@yosr-meddah.dev' && pass === 'Admin1234!') {
    const mockUser = {
      uid: 'mock-admin-uid-yosr',
      email: 'admin@yosr-meddah.dev',
      displayName: 'Yosr Meddah (Admin)',
    };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser as unknown as User;
  }

  throw new Error('Invalid email or password. In offline mock mode, use admin@yosr-meddah.dev / Admin1234!');
}

export async function logoutUser(): Promise<void> {
  if (!isMockMode && auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem(MOCK_STORAGE_KEY_USER);
  }
}

export async function checkIsAdmin(uid: string): Promise<{ isAdmin: boolean; adminData: AdminUser | null }> {
  if (!isMockMode && db) {
    try {
      const userDoc = await getDoc(doc(db, 'adminUsers', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as AdminUser;
        if (data.isActive && (data.role === 'admin' || data.role === 'editor')) {
          return { isAdmin: true, adminData: data };
        }
      }
      return { isAdmin: false, adminData: null };
    } catch (err) {
      console.error('[Auth] Failed to verify admin user status:', err);
      return { isAdmin: false, adminData: null };
    }
  }

  // Simulated offline mode
  if (uid === 'mock-admin-uid-yosr') {
    return {
      isAdmin: true,
      adminData: {
        uid: 'mock-admin-uid-yosr',
        email: 'admin@yosr-meddah.dev',
        displayName: 'Yosr Meddah',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  }

  return { isAdmin: false, adminData: null };
}

export function subscribeToAuthChanges(callback: (state: AuthState) => void): () => void {
  if (!isMockMode && auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        callback({ user: null, adminData: null, isAdmin: false, isLoading: false, error: null });
        return;
      }

      callback({ user, adminData: null, isAdmin: false, isLoading: true, error: null });
      const { isAdmin, adminData } = await checkIsAdmin(user.uid);
      callback({
        user,
        adminData,
        isAdmin,
        isLoading: false,
        error: isAdmin ? null : 'Unauthorized: Your account does not have administrator privileges.',
      });
    });
  }

  // Simulated offline subscriber
  const stored = localStorage.getItem(MOCK_STORAGE_KEY_USER);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      callback({
        user: parsed,
        adminData: {
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        isAdmin: true,
        isLoading: false,
        error: null,
      });
    } catch {
      callback({ user: null, adminData: null, isAdmin: false, isLoading: false, error: null });
    }
  } else {
    callback({ user: null, adminData: null, isAdmin: false, isLoading: false, error: null });
  }

  return () => {};
}
