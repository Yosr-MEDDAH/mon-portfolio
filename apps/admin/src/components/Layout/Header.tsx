import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useAdminLang } from '../../context/LanguageContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import type { SupportedLocale } from '../../shared/types.ts';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, title }) => {
  const { user, adminData, logout } = useAuth();
  const { locale, setLocale, t } = useAdminLang();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden w-9 h-9 flex items-center justify-center border border-border rounded text-content hover:border-mg hover:text-mg transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>
        <h1 className="font-serif text-2xl text-content font-normal tracking-wide">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language selector */}
        <div className="flex items-center border border-border rounded p-0.5 bg-cream text-xs">
          {(['en', 'fr', 'ar'] as SupportedLocale[]).map((lang) => {
            const active = locale === lang;
            return (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`px-2 py-1 rounded transition-colors ${
                  active
                    ? 'bg-surface text-content font-medium border border-border shadow-2xs'
                    : 'text-content-secondary hover:text-content'
                }`}
                aria-current={active ? 'true' : undefined}
              >
                {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'ع'}
              </button>
            );
          })}
        </div>

        {/* Theme Toggle Button (matching portfolio app.js ◑ button) */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center border border-border rounded text-content-secondary hover:border-mg hover:text-mg transition-colors text-base"
          aria-label={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          title={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
        >
          ◑
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 ps-2 sm:ps-3 border-s border-border">
          <div className="hidden md:block text-end">
            <div className="text-xs font-medium text-content truncate max-w-[140px]">
              {adminData?.displayName || user?.email || 'Admin'}
            </div>
            <div className="text-[11px] text-content-muted">
              {t('header.role')}
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="px-2.5 py-1 text-xs border border-border rounded text-content-secondary hover:border-mg hover:text-mg transition-colors bg-cream/40"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};
