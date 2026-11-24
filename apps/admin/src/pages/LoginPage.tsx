import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { getFirebaseStatus } from '../firebase/config.ts';
import type { SupportedLocale } from '../shared/types.ts';

export const LoginPage: React.FC = () => {
  const { login, error: authError } = useAuth();
  const { locale, setLocale, t } = useAdminLang();
  const { theme, toggleTheme } = useTheme();
  const fbStatus = getFirebaseStatus();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4 py-12 text-content transition-colors duration-200">
      {/* Top right language & theme bar */}
      <div className="absolute top-4 end-4 flex items-center gap-2">
        <div className="flex items-center border border-border rounded p-0.5 bg-surface text-xs">
          {(['en', 'fr', 'ar'] as SupportedLocale[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`px-2 py-0.5 rounded transition-colors ${
                locale === lang
                  ? 'bg-cream text-content font-medium border border-border'
                  : 'text-content-secondary hover:text-content'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'ع'}
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center border border-border rounded bg-surface text-content-secondary hover:border-mg hover:text-mg transition-colors text-sm"
          aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
        >
          ◑
        </button>
      </div>

      <div className="max-w-md w-full bg-surface border border-border rounded p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-serif text-3xl font-normal text-content tracking-wide mb-1">
            Yosr Meddah
          </div>
          <h2 className="font-sans text-xs uppercase tracking-widest text-mg font-semibold mb-2">
            {t('login.title')}
          </h2>
          <p className="text-xs text-content-secondary leading-relaxed">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Firebase Spark Status */}
        <div className="mb-5 p-2.5 rounded bg-cream/70 border border-border text-xs flex items-center justify-between">
          <span className="text-content-muted">Target Project:</span>
          <span className="font-mono text-content font-medium">{fbStatus.projectId}</span>
        </div>

        {fbStatus.initError && (
          <div className="mb-5 p-3 rounded bg-red-500/10 border border-red-700/30 text-red-700 dark:text-red-400 text-xs font-medium leading-relaxed flex items-center gap-2">
            <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
            <span>{fbStatus.initError}</span>
          </div>
        )}

        {/* Error banner */}
        {(error || authError) && (
          <div className="mb-5 p-3 rounded bg-red-500/10 border border-red-700/30 text-red-700 dark:text-red-400 text-xs font-medium leading-relaxed flex items-center gap-2">
            <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
            <span>{error || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium text-content mb-1">
              {t('login.email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-content mb-1">
              {t('login.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-surface border border-border rounded text-sm text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded bg-mg hover:bg-mg-light text-white font-medium text-sm transition-colors disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isSubmitting ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        {/* First admin setup documentation */}
        <div className="mt-8 pt-6 border-t border-border text-[11px] text-content-muted leading-relaxed">
          <div className="font-semibold text-content mb-1">First-time Administrator Access:</div>
          <p>
            Public registration is disabled. To grant access, create an authentication account in Firebase Authentication, then insert an authorization record into Firestore at <code className="text-mg font-mono">/adminUsers/{'{uid}'}</code> with <code className="text-content font-mono">isActive: true</code> and <code className="text-content font-mono">role: "admin"</code>.
          </p>

        </div>
      </div>
    </div>
  );
};
