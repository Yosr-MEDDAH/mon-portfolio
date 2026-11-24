import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLocale } from '../shared/types.ts';
import { getAdminText } from '../i18n/translations.ts';

interface LanguageContextType {
  locale: SupportedLocale;
  dir: 'ltr' | 'rtl';
  setLocale: (loc: SupportedLocale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  dir: 'ltr',
  setLocale: () => {},
  t: (k) => k,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr';

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    localStorage.setItem('admin_cms_locale', loc);
  };

  useEffect(() => {
    const saved = localStorage.getItem('admin_cms_locale') as SupportedLocale;
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'ar')) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = (key: string) => getAdminText(key, locale);

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useAdminLang = () => useContext(LanguageContext);
