export type SupportedLocale = 'en' | 'fr' | 'ar';

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALES: SupportedLocale[] = ['en', 'fr', 'ar'];

export interface LocaleConfig {
  code: SupportedLocale;
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  lang: string;
}

export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    dir: 'ltr',
    lang: 'en',
  },
  fr: {
    code: 'fr',
    label: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    lang: 'fr',
  },
  ar: {
    code: 'ar',
    label: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    lang: 'ar',
  },
};
