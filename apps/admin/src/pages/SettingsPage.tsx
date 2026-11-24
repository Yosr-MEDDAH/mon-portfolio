import React, { useState, useEffect } from 'react';
import type { SiteSettings } from '../shared/types.ts';
import { fetchSiteSettings, saveSiteSettings } from '../firebase/firestore.ts';
import { getFirebaseStatus } from '../firebase/config.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t } = useAdminLang();
  const fbStatus = getFirebaseStatus();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetchSiteSettings();
        setSettings(s);
      } catch (err) {
        notify('error', 'Failed to load site settings: ' + (err instanceof Error ? err.message : ''));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;

    try {
      await saveSiteSettings(settings, user.uid, user.email || 'admin@cms.dev');
      notify('success', 'Site settings saved successfully');
    } catch (err) {
      notify('error', 'Failed to save settings: ' + (err instanceof Error ? err.message : ''));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-serif text-2xl font-normal text-content">{t('nav.settings')}</h2>
        <p className="text-xs text-content-muted mt-0.5">
          Global site parameters, Firebase connection status, and administrator security configuration.
        </p>
      </div>

      {/* Firebase Spark Compliance Card */}
      <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-serif text-xl font-normal text-content">Firebase Spark Environment</h3>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-pill bg-mg-pale text-mg border border-mg-border font-medium">
            100% Free / No Billing Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-cream/50 rounded border border-border space-y-1">
            <div className="text-content-muted uppercase tracking-wider text-[10px]">Project ID</div>
            <div className="font-mono text-content font-medium">{fbStatus.projectId}</div>
          </div>

          <div className="p-3 bg-cream/50 rounded border border-border space-y-1">
            <div className="text-content-muted uppercase tracking-wider text-[10px]">Connection Mode</div>
            <div className="font-mono text-content font-medium">
              {fbStatus.isMockMode ? 'Simulated Local Storage (Offline)' : 'Live Cloud Firestore (Spark)'}
            </div>
          </div>
        </div>

        <div className="p-4 bg-cream/70 border border-border rounded text-xs space-y-1.5 font-mono text-content-secondary">
          <div className="text-mg font-medium"># Step-by-Step Manual Firebase Authorization Guide:</div>
          <div className="text-content-muted">1. Go to console.firebase.google.com and select project "portfolio-yosr-v2".</div>
          <div className="text-content-muted">2. Enable Authentication (Email/Password provider).</div>
          <div className="text-content-muted">3. Create Firestore Database in production mode with firestore.rules.</div>
          <div className="text-content-muted">4. Under /adminUsers/{'{UID}'}, create a document with isActive: true, role: "admin".</div>
          <div className="text-content-muted">5. Copy Web App config values to apps/admin/.env.local (see .env.example).</div>
        </div>
      </div>

      {/* Global Site Settings Form */}
      {settings && (
        <form onSubmit={handleSave} className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="font-serif text-xl font-normal text-content border-b border-border pb-3">
            Site Metadata & Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Site Title (English) *
              </label>
              <input
                type="text"
                required
                value={settings.siteTitle.en}
                onChange={(e) => setSettings({
                  ...settings,
                  siteTitle: { ...settings.siteTitle, en: e.target.value },
                })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Site Title (French)
              </label>
              <input
                type="text"
                value={settings.siteTitle.fr}
                onChange={(e) => setSettings({
                  ...settings,
                  siteTitle: { ...settings.siteTitle, fr: e.target.value },
                })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Site Title (Arabic)
              </label>
              <input
                type="text"
                dir="rtl"
                value={settings.siteTitle.ar}
                onChange={(e) => setSettings({
                  ...settings,
                  siteTitle: { ...settings.siteTitle, ar: e.target.value },
                })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors text-right"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded bg-mg hover:bg-mg-light text-xs font-medium text-white transition-colors cursor-pointer"
            >
              {t('action.save')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
