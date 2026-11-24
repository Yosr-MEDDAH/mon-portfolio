import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, getFirebaseStatus } from './config.ts';
import type { AdminUser } from '../shared/types.ts';

export interface AuthState {
  user: User | null;
  adminData: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

function missingFirebaseError(): Error {
  return new Error(
    getFirebaseStatus().initError ||
      'Firebase Authentication is unavailable. Check the Firebase configuration.'
  );
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw missingFirebaseError();
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export async function checkIsAdmin(
  uid: string
): Promise<{ isAdmin: boolean; adminData: AdminUser | null }> {
  if (!db) {
    return { isAdmin: false, adminData: null };
  }

  try {
    const userDoc = await getDoc(doc(db, 'adminUsers', uid));
    if (!userDoc.exists()) {
      return { isAdmin: false, adminData: null };
    }

    const data = userDoc.data() as AdminUser;
    const hasValidRole = data.role === 'admin' || data.role === 'editor';
    if (data.isActive === true && hasValidRole) {
      return { isAdmin: true, adminData: data };
    }

    return { isAdmin: false, adminData: null };
  } catch (err) {
    console.error('[Auth] Failed to verify admin user status:', err);
    return { isAdmin: false, adminData: null };
  }
}

export function subscribeToAuthChanges(callback: (state: AuthState) => void): () => void {
  if (!auth) {
    callback({
      user: null,
      adminData: null,
      isAdmin: false,
      isLoading: false,
      error: missingFirebaseError().message,
    });
    return () => {};
  }

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
      error: isAdmin
        ? null
        : 'Unauthorized: your account is not registered as an active administrator in Firestore /adminUsers/{uid}.',
    });
  });
}
