import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackLogin: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallbackLogin }) => {
  const { user, isAdmin, isLoading, error, logout } = useAuth();
  const { t } = useAdminLang();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream text-content font-sans">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-mg border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-xs font-medium text-content-secondary">
            {t('login.loading')}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <>{fallbackLogin}</>;
  }

  // Authenticated but unauthorized (not in adminUsers collection)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 font-sans text-content">
        <div className="max-w-md w-full bg-surface border border-border rounded p-6 sm:p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert size={20} strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-normal mb-2 text-content">403 — Access Denied</h2>
          <p className="text-xs text-content-secondary leading-relaxed mb-6">
            Authenticated as <strong className="text-content">{user.email}</strong>, but your UID (<code className="text-xs bg-cream px-1.5 py-0.5 rounded text-mg font-mono">{user.uid}</code>) is not registered with active administrator permissions in Firestore <code className="text-xs bg-cream px-1.5 py-0.5 rounded text-content font-mono">/adminUsers/{user.uid}</code>.
          </p>

          <div className="bg-cream/60 border border-border rounded p-4 text-xs text-start text-content-secondary mb-6 space-y-2 font-mono">
            <div className="font-sans font-semibold text-content">How to authorize this account:</div>
            <div>1. Open Firebase Console for project <strong className="text-mg">portfolio-yosr-v2</strong>.</div>
            <div>2. In Firestore, add a document in collection <code className="text-mg font-bold">adminUsers</code> with Document ID = <code className="text-content font-bold">{user.uid}</code>.</div>
            <div>3. Set fields: <code className="text-content">isActive: true</code>, <code className="text-content">role: "admin"</code>, <code className="text-content">email: "{user.email}"</code>.</div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs transition-colors cursor-pointer"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    );
  }

  // Authenticated & explicitly authorized
  return <>{children}</>;
};
