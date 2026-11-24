import { DEFAULT_LOCALE, LOCALE_CONFIGS, type SupportedLocale } from './types.ts';
import { translations } from './translations.ts';
import { withBase } from '../utils/url.ts';

/**
 * Translates a key with fallback to English default.
 */
export function t(
  key: string,
  locale: SupportedLocale = DEFAULT_LOCALE,
  params?: Record<string, string | number>
): string {
  const entry = translations[key];
  let text = entry?.[locale] ?? entry?.[DEFAULT_LOCALE] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

/**
 * Extracts a localized value with strict fallback order:
 * Requested Locale -> English fallback -> French -> Arabic -> string representation.
 */
export function resolveLocalized(
  value: unknown,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object' && value !== null) {
    const loc = value as Record<string, unknown>;
    // 1. Requested locale
    if (locale in loc && typeof loc[locale] === 'string' && (loc[locale] as string).trim()) {
      return loc[locale] as string;
    }
    // 2. English fallback (primary fallback requirement)
    if ('en' in loc && typeof loc['en'] === 'string' && (loc['en'] as string).trim()) {
      return loc['en'] as string;
    }
    // 3. Secondary fallbacks
    if ('fr' in loc && typeof loc['fr'] === 'string' && (loc['fr'] as string).trim()) {
      return loc['fr'] as string;
    }
    if ('ar' in loc && typeof loc['ar'] === 'string' && (loc['ar'] as string).trim()) {
      return loc['ar'] as string;
    }
  }

  return String(value);
}

/**
 * Computes equivalent route across languages while preserving the current page.
 */
export function getEquivalentRoute(currentPath: string, targetLocale: SupportedLocale): string {
  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/mon-portfolio/';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  // Remove base from currentPath if present
  let path = currentPath;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }

  // Strip leading slash
  if (path.startsWith('/')) {
    path = path.slice(1);
  }

  // Detect and strip existing language prefix (fr/ or ar/ or en/)
  if (path.startsWith('fr/')) {
    path = path.slice(3);
  } else if (path === 'fr') {
    path = '';
  } else if (path.startsWith('ar/')) {
    path = path.slice(3);
  } else if (path === 'ar') {
    path = '';
  } else if (path.startsWith('en/')) {
    path = path.slice(3);
  } else if (path === 'en') {
    path = '';
  }

  // Normalize path
  if (path === '' || path === 'index.html') {
    return targetLocale === DEFAULT_LOCALE
      ? withBase('/index.html')
      : withBase(`/${targetLocale}/index.html`);
  }

  // Handle legacy URLs preservation
  const legacyPages = ['projects', 'skills', 'experiences', 'presentations', 'artworks'];
  for (const page of legacyPages) {
    if (path === `${page}.html` || path === `${page}/index.html` || path === page) {
      return targetLocale === DEFAULT_LOCALE
        ? withBase(`/${page}.html`)
        : withBase(`/${targetLocale}/${page}/index.html`);
    }
  }

  // General collection or detail paths (e.g. projects/index.html, research/slug.html)
  return targetLocale === DEFAULT_LOCALE
    ? withBase(`/${path}`)
    : withBase(`/${targetLocale}/${path}`);
}
