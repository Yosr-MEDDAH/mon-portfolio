import type { SupportedLocale } from '../content-model/types.ts';
import { resolveLocalized } from '../i18n/utils.ts';

/**
 * Prepends the Astro base path (/mon-portfolio/) to relative paths.
 * Ignores full URLs (http://, https://, mailto:, etc.).
 */
export function withBase(path: string): string {
  if (!path) return '';

  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('#')) {
    return path;
  }

  const rawBase = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/mon-portfolio/';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${cleanPath}`;
}

/**
 * Extracts a display string from a potentially localized field value with English fallback.
 */
export function resolveLocalizedValue(value: unknown, locale: SupportedLocale = 'en'): string {
  return resolveLocalized(value, locale);
}
