import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { AdminUser } from '../shared/types.ts';
import {
  loginWithEmail,
  logoutUser,
  subscribeToAuthChanges,
  type AuthState,
} from '../firebase/auth.ts';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminData: null,
  isAdmin: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    adminData: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await loginWithEmail(email, pass);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({ ...prev, isLoading: false, error: msg }));
      throw err;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await logoutUser();
    setState({
      user: null,
      adminData: null,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
