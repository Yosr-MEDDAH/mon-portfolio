import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type Firestore,
} from 'firebase/firestore';
import { db, getFirebaseStatus } from './config.ts';
import type {
  ContentTypeDefinition,
  ContentEntry,
  MediaItem,
  Revision,
  SiteSettings,
  ActivityLog,
  TemplateDefinition,
} from '../shared/types.ts';
import { validateContentType, validateEntry } from '../shared/validation.ts';
import { getNormalizedFieldNames } from '../shared/labels.ts';

/**
 * Strips all `undefined` values recursively from an object tree before writing to Firestore.
 * Cloud Firestore setDoc/updateDoc strictly disallows `undefined` values.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        cleaned[k] = cleanFirestoreData(v);
      }
    }
    return cleaned as T;
  }
  return obj;
}

function requireDb(): Firestore {
  if (!db) {
    throw new Error(
      getFirebaseStatus().initError || 'Cloud Firestore is not initialized.'
    );
  }
  return db;
}

// Normalizes a content type definition ensuring all field labels have clean, non-generic multilingual names
export function normalizeContentType(ct: ContentTypeDefinition): ContentTypeDefinition {
  if (!ct || !Array.isArray(ct.fields)) return ct;
  return {
    ...ct,
    fields: ct.fields.map((f) => ({
      ...f,
      name: getNormalizedFieldNames(f),
    })),
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: {
    en: 'Yosr Meddah — Portfolio',
    fr: 'Yosr Meddah — Portfolio',
    ar: 'يسر مداح — ملف الأعمال',
  },
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr', 'ar'],
  maintenanceMode: false,
  seoDefaults: {
    metaTitle: {
      en: 'Yosr Meddah | Software Engineering Student',
      fr: 'Yosr Meddah | Ingénieure informatique en formation',
      ar: 'يسر مداح | مهندسة برمجيات',
    },
    metaDescription: {
      en: 'Portfolio of Yosr Meddah specializing in accessibility, eco-design, and distributed systems.',
      fr: 'Portfolio de Yosr Meddah spécialisée en accessibilité, éco-conception et systèmes distribués.',
      ar: 'ملف أعمال يسر مداح في هندسة البرمجيات والأنظمة الموزعة وإمكانية الوصول.',
    },
  },
  profile: {
    name: 'Yosr Meddah',
    title: {
      fr: 'Ingénieure informatique en formation — Accessibilité · Éco-conception',
      en: 'Software Engineering Student — Accessibility · Eco-design',
      ar: 'مهندسة برمجيات في طور التكوين — إمكانية الوصول والتصميم الصديق للبيئة',
    },
    bio: {
      fr: "Ingénieure informatique en 2ᵉ année à l'ISAMM, passionnée par le développement frontend, l'accessibilité numérique (WCAG) et l'éco-conception web. Je conçois des solutions inclusives qui allient performance technique et responsabilité environnementale. Créatrice de contenu pédagogique sur YouTube autour de ces thématiques, avec un engagement fort pour la responsabilité numérique et le design durable.",
      en: '2nd-year software engineering student at ISAMM, passionate about frontend development, digital accessibility (WCAG) and eco-design. I build inclusive solutions combining technical performance with environmental responsibility. Also a YouTube educator on these topics.',
      ar: 'طالبة هندسة برمجيات في السنة الثانية بـ ISAMM، شغوفة بالتطوير الواجهة الأمامية وإمكانية الوصول الرقمي (WCAG) والتصميم البيئي. أصمم حلولاً شاملة تجمع بين الأداء التقني والمسؤولية البيئية. صانعة محتوى تعليمي على يوتيوب.',
    },
    cvUrl: {
      fr: 'cv.pdf',
      en: 'cv.pdf',
      ar: 'cv.pdf',
    },
    email: 'yosrmeddah@outlook.com',
    phone: '+216 50 231 459',
    location: 'Tunis / Bizerte, Tunisie',
    socials: {
      github: 'https://github.com/Yosr-MEDDAH',
      linkedin: 'https://www.linkedin.com/in/yosr-meddah/',
      behance: 'https://www.behance.net/yosr-meddah',
      youtube: 'https://www.youtube.com/@YosrMeddah',
    },
    contactLabels: {
      heading: {
        fr: 'Restons en contact',
        en: 'Get in Touch',
        ar: 'تواصل معي',
      },
      subheading: {
        fr: "Disponible pour stages, collaborations et projets autour de l'accessibilité et de l'éco-conception.",
        en: 'Available for internships, collaborations and projects around accessibility and eco-design.',
        ar: 'متاحة للتدريب والتعاون والمشاريع في مجالات إمكانية الوصول والتصميم المستدام.',
      },
    },
  },
};

export const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'template-card-standard',
    name: 'Standard Responsive Card',
    targetType: 'card',
    layout: 'grid',
    aspectRatio: '16/9',
    description: 'Used for collection listings in responsive grid layout with cover image header.',
  },
  {
    id: 'template-card-research',
    name: 'Research Publication Card',
    targetType: 'card',
    layout: 'grid',
    aspectRatio: '16/9',
    description: 'Preconfigured for Research items with date hidden and description summary visible.',
    visibilitySettings: {
      contextVisibility: {
        card: { date: false, description: true },
      },
    },
  },
  {
    id: 'template-detail-standard',
    name: 'Standard Comprehensive Detail',
    targetType: 'detail',
    layout: 'single',
    aspectRatio: '16/9',
    description: 'Full-page detail layout with breadcrumb, hero header, tags, and body sections.',
    visibilitySettings: {
      contextVisibility: {
        detail: { date: true, description: false },
      },
    },
  },
];

// ==================== ACTIVITY & REVISION HELPERS ====================

export async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  userEmail: string
): Promise<void> {
  const store = requireDb();
  const log: ActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    action,
    entityType,
    entityId,
    details,
    userEmail,
    timestamp: new Date().toISOString(),
  };

  await setDoc(doc(store, 'activityLogs', log.id), cleanFirestoreData(log));
}

export async function recordRevision(
  entityType: 'contentType' | 'entry' | 'media' | 'settings' | 'template',
  entityId: string,
  snapshot: Record<string, unknown>,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<Revision> {
  const store = requireDb();
  const revisions = await getRevisionsForEntity(entityType, entityId);
  const nextRevNumber = revisions.length + 1;

  const rev: Revision = {
    id: `rev-${entityType}-${entityId}-${nextRevNumber}`,
    entityType,
    entityId,
    revisionNumber: nextRevNumber,
    authorUid,
    authorEmail,
    timestamp: new Date().toISOString(),
    note,
    snapshot,
  };

  await setDoc(doc(store, 'revisions', rev.id), cleanFirestoreData(rev));
  return rev;
}

export async function getRevisionsForEntity(
  entityType: string,
  entityId: string
): Promise<Revision[]> {
  const store = requireDb();
  // Single equality filter on entityId avoids requiring a composite index on Firestore Spark
  const q = query(
    collection(store, 'revisions'),
    where('entityId', '==', entityId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Revision)
    .filter((r) => r.entityType === entityType)
    .sort((a, b) => b.revisionNumber - a.revisionNumber);
}

// ==================== CONTENT TYPES CRUD ====================

export async function fetchContentTypes(includeArchived = false): Promise<ContentTypeDefinition[]> {
  const store = requireDb();
  const snap = await getDocs(collection(store, 'contentTypes'));
  const items = snap.docs.map((d) => normalizeContentType(d.data() as ContentTypeDefinition));
  return includeArchived ? items : items.filter((i) => !i.isArchived);
}

export async function fetchContentTypeById(id: string): Promise<ContentTypeDefinition | null> {
  const store = requireDb();
  const docSnap = await getDoc(doc(store, 'contentTypes', id));
  return docSnap.exists() ? normalizeContentType(docSnap.data() as ContentTypeDefinition) : null;
}

export async function saveContentType(
  ct: ContentTypeDefinition,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<ContentTypeDefinition> {
  // Validate schema before saving
  validateContentType(ct);
  const store = requireDb();

  const payload: ContentTypeDefinition = {
    ...ct,
    updatedAt: new Date().toISOString(),
    createdAt: ct.createdAt || new Date().toISOString(),
  };

  await setDoc(doc(store, 'contentTypes', payload.id), cleanFirestoreData(payload));

  await recordRevision('contentType', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail, note);
  await logActivity('SAVE_CONTENT_TYPE', 'contentType', payload.id, `Saved content type "${payload.slug}"`, authorEmail);

  return payload;
}

export async function archiveContentType(
  id: string,
  authorUid: string,
  authorEmail: string
): Promise<void> {
  const ct = await fetchContentTypeById(id);
  if (!ct) throw new Error(`Content type ${id} not found`);

  ct.isArchived = true;
  await saveContentType(ct, authorUid, authorEmail, 'Archived content type');
  await logActivity('ARCHIVE_CONTENT_TYPE', 'contentType', id, `Archived content type "${ct.slug}"`, authorEmail);
}

export async function restoreContentType(
  id: string,
  authorUid: string,
  authorEmail: string
): Promise<void> {
  const ct = await fetchContentTypeById(id);
  if (!ct) throw new Error(`Content type ${id} not found`);

  ct.isArchived = false;
  await saveContentType(ct, authorUid, authorEmail, 'Restored content type');
  await logActivity('RESTORE_CONTENT_TYPE', 'contentType', id, `Restored content type "${ct.slug}"`, authorEmail);
}

// ==================== ENTRIES CRUD ====================

export async function fetchEntries(contentTypeId?: string, includeArchived = false): Promise<ContentEntry[]> {
  const store = requireDb();
  const q = contentTypeId
    ? query(collection(store, 'entries'), where('contentTypeId', '==', contentTypeId))
    : collection(store, 'entries');
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => d.data() as ContentEntry);
  return includeArchived ? items : items.filter((i) => i.status !== 'archived');
}

export async function fetchEntryById(id: string): Promise<ContentEntry | null> {
  const store = requireDb();
  const docSnap = await getDoc(doc(store, 'entries', id));
  return docSnap.exists() ? (docSnap.data() as ContentEntry) : null;
}

export async function saveEntry(
  entry: ContentEntry,
  contentType: ContentTypeDefinition,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<ContentEntry> {
  // Validate entry against content type schema before writing
  validateEntry(contentType, entry);
  const store = requireDb();

  const payload: ContentEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
    createdAt: entry.createdAt || new Date().toISOString(),
    authorUid,
  };

  await setDoc(doc(store, 'entries', payload.id), cleanFirestoreData(payload));

  await recordRevision('entry', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail, note);
  await logActivity('SAVE_ENTRY', 'entry', payload.id, `Saved entry "${payload.slug}" in ${payload.contentTypeId}`, authorEmail);

  return payload;
}

export async function archiveEntry(
  id: string,
  authorUid: string,
  authorEmail: string
): Promise<void> {
  const entry = await fetchEntryById(id);
  if (!entry) throw new Error(`Entry ${id} not found`);

  entry.status = 'archived';
  const ct = await fetchContentTypeById(entry.contentTypeId);
  if (!ct) throw new Error(`Content type ${entry.contentTypeId} not found`);

  await saveEntry(entry, ct, authorUid, authorEmail, 'Archived entry');
  await logActivity('ARCHIVE_ENTRY', 'entry', id, `Archived entry "${entry.slug}"`, authorEmail);
}

export async function restoreEntry(
  id: string,
  authorUid: string,
  authorEmail: string
): Promise<void> {
  const entry = await fetchEntryById(id);
  if (!entry) throw new Error(`Entry ${id} not found`);

  entry.status = 'published';
  const ct = await fetchContentTypeById(entry.contentTypeId);
  if (!ct) throw new Error(`Content type ${entry.contentTypeId} not found`);

  await saveEntry(entry, ct, authorUid, authorEmail, 'Restored entry from archive');
  await logActivity('RESTORE_ENTRY', 'entry', id, `Restored entry "${entry.slug}"`, authorEmail);
}

// ==================== MEDIA REGISTRY (SPARK PLAN - NO STORAGE) ====================

export async function fetchMediaItems(): Promise<MediaItem[]> {
  const store = requireDb();
  const snap = await getDocs(collection(store, 'media'));
  return snap.docs.map((d) => d.data() as MediaItem);
}

export async function saveMediaItem(
  item: MediaItem,
  authorUid: string,
  authorEmail: string
): Promise<MediaItem> {
  const store = requireDb();
  const payload: MediaItem = {
    ...item,
    updatedAt: new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };

  await setDoc(doc(store, 'media', payload.id), cleanFirestoreData(payload));

  await recordRevision('media', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail);
  await logActivity('SAVE_MEDIA', 'media', payload.id, `Saved media reference "${payload.title}"`, authorEmail);

  return payload;
}

export async function deleteMediaItem(id: string, authorEmail: string): Promise<void> {
  const store = requireDb();
  await deleteDoc(doc(store, 'media', id));
  await logActivity('DELETE_MEDIA', 'media', id, `Deleted media reference ${id}`, authorEmail);
}

// ==================== TEMPLATES & PRESETS CRUD ====================

export async function fetchTemplates(): Promise<TemplateDefinition[]> {
  const store = requireDb();
  const snap = await getDocs(collection(store, 'templates'));
  const items = snap.docs.map((d) => d.data() as TemplateDefinition);
  return items.length > 0 ? items : DEFAULT_TEMPLATES;
}

export async function fetchTemplateById(id: string): Promise<TemplateDefinition | null> {
  const store = requireDb();
  const docSnap = await getDoc(doc(store, 'templates', id));
  if (docSnap.exists()) {
    return docSnap.data() as TemplateDefinition;
  }
  return DEFAULT_TEMPLATES.find((tpl) => tpl.id === id) || null;
}

export async function saveTemplate(
  tpl: TemplateDefinition,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<TemplateDefinition> {
  const store = requireDb();
  const payload: TemplateDefinition = {
    ...tpl,
    updatedAt: new Date().toISOString(),
    createdAt: tpl.createdAt || new Date().toISOString(),
  };

  await setDoc(doc(store, 'templates', payload.id), cleanFirestoreData(payload));

  await recordRevision('template', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail, note);
  await logActivity('SAVE_TEMPLATE', 'template', payload.id, `Saved template "${payload.name}"`, authorEmail);

  return payload;
}

export async function deleteTemplate(id: string, authorEmail: string): Promise<void> {
  const store = requireDb();
  await deleteDoc(doc(store, 'templates', id));
  await logActivity('DELETE_TEMPLATE', 'template', id, `Deleted template ${id}`, authorEmail);
}

// ==================== SETTINGS & LOGS ====================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const store = requireDb();
  const docSnap = await getDoc(doc(store, 'siteSettings', 'global'));
  if (docSnap.exists()) {
    return docSnap.data() as SiteSettings;
  }
  // Connected to Firestore, but settings doc not created yet: return defaults
  return DEFAULT_SETTINGS;
}

export async function saveSiteSettings(
  settings: SiteSettings,
  authorUid: string,
  authorEmail: string
): Promise<SiteSettings> {
  const store = requireDb();
  await setDoc(doc(store, 'siteSettings', 'global'), cleanFirestoreData(settings));

  await recordRevision('settings', 'global', settings as unknown as Record<string, unknown>, authorUid, authorEmail, 'Updated site settings');
  await logActivity('SAVE_SETTINGS', 'settings', 'global', 'Updated site global settings', authorEmail);

  return settings;
}

export async function fetchRecentLogs(maxCount = 20): Promise<ActivityLog[]> {
  const store = requireDb();
  const q = query(collection(store, 'activityLogs'), orderBy('timestamp', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityLog);
}

export async function fetchAllRevisions(maxCount = 50): Promise<Revision[]> {
  const store = requireDb();
  const q = query(collection(store, 'revisions'), orderBy('timestamp', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Revision);
}
