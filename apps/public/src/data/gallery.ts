export interface GalleryLocalizedString {
  fr?: string;
  en?: string;
  ar?: string;
  [key: string]: string | undefined;
}

export interface GalleryImageItem {
  url: string;
  caption?: GalleryLocalizedString | string;
  alt?: GalleryLocalizedString | string;
}

export interface GalleryEntryItem {
  slug: string;
  title?: GalleryLocalizedString | string;
  description?: GalleryLocalizedString | string;
  images: GalleryImageItem[];
}

export function resolveGalleryText(v: unknown, locale = 'en'): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const obj = v as Record<string, string | undefined>;
    return obj[locale] || obj.en || obj.fr || obj.ar || '';
  }
  return '';
}

export function transformGalleryEntries(
  entries: Array<{ slug?: string; id?: string; fields?: Record<string, unknown> }>
): GalleryEntryItem[] {
  return entries
    .map((e) => {
      const f = (e.fields || {}) as Record<string, unknown>;
      const rawImages = Array.isArray(f.images) ? f.images : [];
      const images: GalleryImageItem[] = rawImages
        .filter((img): img is Record<string, unknown> => Boolean(img) && typeof img === 'object')
        .map((img) => ({
          url: typeof img.url === 'string' ? img.url.trim() : '',
          caption: img.caption as GalleryLocalizedString | string | undefined,
          alt: img.alt as GalleryLocalizedString | string | undefined,
        }))
        .filter((img) => img.url.length > 0)
        .slice(0, 20);

      return {
        slug: String(e.slug || e.id || ''),
        title: f.title as GalleryLocalizedString | string | undefined,
        description: f.description as GalleryLocalizedString | string | undefined,
        images,
      };
    })
    .filter((entry) => entry.images.length > 0);
}
