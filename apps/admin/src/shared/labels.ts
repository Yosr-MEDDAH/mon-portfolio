import type {
  FieldDefinition,
  SupportedLocale,
  Localized,
} from './types.ts';

/**
 * Standard known field labels for domain entities (Projects, Research, etc.)
 * Strictly enforces EN / FR / AR translations per field key.
 */
export const KNOWN_FIELD_LABELS: Record<string, Localized<string>> = {
  title: {
    en: 'Title',
    fr: 'Titre',
    ar: 'العنوان',
  },
  slug: {
    en: 'URL Slug',
    fr: 'Identifiant URL',
    ar: 'معرّف الرابط',
  },
  shortDescription: {
    en: 'Short Description',
    fr: 'Description courte',
    ar: 'وصف مختصر',
  },
  description: {
    en: 'Description',
    fr: 'Description',
    ar: 'الوصف',
  },
  coverImage: {
    en: 'Cover Image',
    fr: 'Image de couverture',
    ar: 'صورة الغلاف',
  },
  technologies: {
    en: 'Technologies',
    fr: 'Technologies',
    ar: 'التقنيات',
  },
  liveUrl: {
    en: 'Live Demo URL',
    fr: 'Lien de démonstration',
    ar: 'رابط العرض',
  },
  githubUrl: {
    en: 'GitHub URL',
    fr: 'Lien GitHub',
    ar: 'رابط GitHub',
  },
  startDate: {
    en: 'Start Date',
    fr: 'Date de début',
    ar: 'تاريخ البداية',
  },
  endDate: {
    en: 'End Date',
    fr: 'Date de fin',
    ar: 'تاريخ النهاية',
  },
  featured: {
    en: 'Featured Project',
    fr: 'Projet mis en avant',
    ar: 'مشروع مميز',
  },
  date: {
    en: 'Date',
    fr: 'Date',
    ar: 'التاريخ',
  },
  tags: {
    en: 'Tags',
    fr: 'Mots-clés',
    ar: 'الوسوم',
  },
  externalLink: {
    en: 'External Link',
    fr: 'Lien externe',
    ar: 'الرابط الخارجي',
  },
};

/**
 * Known generic placeholder strings that indicate a field hasn't been properly named.
 */
const GENERIC_PLACEHOLDERS = new Set([
  'new field',
  'nouveau champ',
  'حقل جديد',
  'untitled field',
  'field',
  'undefined',
  'null',
]);

/**
 * Checks if a string value is empty or a generic placeholder.
 */
export function isGenericPlaceholder(val?: string | null): boolean {
  if (!val) return true;
  const normalized = val.trim().toLowerCase();
  return normalized === '' || GENERIC_PLACEHOLDERS.has(normalized);
}

/**
 * Converts a technical key (camelCase, snake_case, kebab-case) into a clean, human-readable Title.
 * e.g. "shortDescription" -> "Short Description", "githubUrl" -> "GitHub URL"
 */
export function formatKeyToLabel(key: string): string {
  if (!key) return '';

  // Acronym special cases
  const acronyms: Record<string, string> = {
    url: 'URL',
    id: 'ID',
    seo: 'SEO',
    api: 'API',
    ui: 'UI',
    github: 'GitHub',
    ai: 'AI',
    cv: 'CV',
    pdf: 'PDF',
  };

  // Split on camelCase boundaries, underscores, or hyphens
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/);

  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (acronyms[lower]) return acronyms[lower];
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Resolves the multilingual human-readable label for a field.
 * Priority:
 * 1. Explicit localized name in the requested language (if not a generic placeholder)
 * 2. Explicit localized name in English fallback (if not a generic placeholder)
 * 3. Any other non-placeholder locale from field.name
 * 4. Explicit string name (if not generic placeholder)
 * 5. Known domain label mapping (KNOWN_FIELD_LABELS) for the requested language
 * 6. Clean Title Case generated from the field's technical key
 */
export function getFieldLabel(
  field: FieldDefinition | { key: string; name?: Localized<string> | string },
  lang: SupportedLocale = 'en'
): string {
  if (!field) return '';

  const { key, name } = field;

  // 1. Check object-based localized name
  if (name && typeof name === 'object') {
    const localized = name as Localized<string>;
    const requestedVal = localized[lang];
    if (requestedVal && !isGenericPlaceholder(requestedVal)) {
      return requestedVal.trim();
    }

    const enVal = localized['en'];
    if (enVal && !isGenericPlaceholder(enVal)) {
      // If requested language is not EN, check if KNOWN_FIELD_LABELS has a better translated label
      if (lang !== 'en' && KNOWN_FIELD_LABELS[key]?.[lang]) {
        return KNOWN_FIELD_LABELS[key][lang];
      }
      return enVal.trim();
    }

    // Check if any other language has a valid non-placeholder value
    for (const l of ['fr', 'ar'] as SupportedLocale[]) {
      const otherVal = localized[l];
      if (otherVal && !isGenericPlaceholder(otherVal)) {
        if (KNOWN_FIELD_LABELS[key]?.[lang]) {
          return KNOWN_FIELD_LABELS[key][lang];
        }
        return otherVal.trim();
      }
    }
  }

  // 2. Check string-based name
  if (typeof name === 'string' && !isGenericPlaceholder(name)) {
    if (lang === 'en') {
      return name.trim();
    }
    // If not English, prefer domain translation if key is known
    if (KNOWN_FIELD_LABELS[key]?.[lang]) {
      return KNOWN_FIELD_LABELS[key][lang];
    }
    return name.trim();
  }

  // 3. Fallback to domain known labels
  if (KNOWN_FIELD_LABELS[key]) {
    return KNOWN_FIELD_LABELS[key][lang] || KNOWN_FIELD_LABELS[key]['en'];
  }

  // 4. Fallback to formatted key
  return formatKeyToLabel(key);
}

/**
 * Returns a normalized Localized<string> object for a field ensuring EN, FR, AR are fully populated.
 */
export function getNormalizedFieldNames(
  field: FieldDefinition | { key: string; name?: Localized<string> | string }
): Localized<string> {
  return {
    en: getFieldLabel(field, 'en'),
    fr: getFieldLabel(field, 'fr'),
    ar: getFieldLabel(field, 'ar'),
  };
}
