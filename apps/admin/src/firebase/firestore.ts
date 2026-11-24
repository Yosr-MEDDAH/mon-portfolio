import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isMockMode } from './config.ts';
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

// Local storage keys for offline mock mode
const STORAGE_PREFIX = 'cms_admin_';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Local storage write error:', err);
  }
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

// Initial seed data for offline mode
const DEFAULT_CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    id: 'research',
    name: { en: 'Research', fr: 'Recherche', ar: 'البحث العلمي' },
    description: {
      en: 'Academic and applied research papers, publications, and studies',
      fr: 'Articles, publications et études de recherche académique et appliquée',
      ar: 'أوراق بحثية ودراسات أكاديمية وتطبيقية',
    },
    slug: 'research',
    defaultVisibility: {
      title: true,
      description: true,
      date: true,
      coverImage: true,
      tags: true,
      externalLink: true,
    },
    fields: [
      { key: 'title', name: { en: 'Title', fr: 'Titre', ar: 'العنوان' }, type: 'text', required: true, localized: true, defaultVisible: true },
      { key: 'description', name: { en: 'Description', fr: 'Description', ar: 'الوصف' }, type: 'textarea', required: true, localized: true, defaultVisible: true },
      { key: 'date', name: { en: 'Publication Date', fr: 'Date de publication', ar: 'تاريخ النشر' }, type: 'date', required: true, localized: false, defaultVisible: true },
      { key: 'coverImage', name: { en: 'Cover Image', fr: 'Image de couverture', ar: 'صورة الغلاف' }, type: 'image', required: true, localized: false, defaultVisible: true },
      { key: 'tags', name: { en: 'Tags', fr: 'Mots-clés', ar: 'الوسوم' }, type: 'tags', required: true, localized: false, defaultVisible: true },
      { key: 'externalLink', name: { en: 'External Link', fr: 'Lien externe', ar: 'الرابط الخارجي' }, type: 'url', required: true, localized: false, defaultVisible: true },
    ],
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'projects',
    name: { en: 'Projects', fr: 'Projets', ar: 'المشاريع' },
    description: {
      en: 'Software engineering, digital accessibility, and AI projects',
      fr: 'Projets d\'ingénierie logicielle, accessibilité numérique et IA',
      ar: 'مشاريع هندسة البرمجيات وإمكانية الوصول والذكاء الاصطناعي',
    },
    slug: 'projects',
    defaultVisibility: {
      title: true,
      slug: true,
      shortDescription: true,
      description: true,
      coverImage: true,
      technologies: true,
      liveUrl: true,
      githubUrl: true,
      startDate: true,
      endDate: true,
      featured: true,
    },
    fields: [
      { key: 'title', name: { en: 'Title', fr: 'Titre', ar: 'العنوان' }, type: 'text', required: true, localized: true, defaultVisible: true },
      { key: 'slug', name: { en: 'URL Slug', fr: 'Identifiant URL', ar: 'معرّف الرابط' }, type: 'text', required: true, localized: false, defaultVisible: true },
      { key: 'shortDescription', name: { en: 'Short Description', fr: 'Description courte', ar: 'وصف مختصر' }, type: 'textarea', required: true, localized: true, defaultVisible: true },
      { key: 'description', name: { en: 'Description', fr: 'Description', ar: 'الوصف' }, type: 'textarea', required: false, localized: true, defaultVisible: true },
      { key: 'coverImage', name: { en: 'Cover Image', fr: 'Image de couverture', ar: 'صورة الغلاف' }, type: 'image', required: false, localized: false, defaultVisible: true },
      { key: 'technologies', name: { en: 'Technologies', fr: 'Technologies', ar: 'التقنيات' }, type: 'tags', required: false, localized: false, defaultVisible: true },
      { key: 'liveUrl', name: { en: 'Live Demo URL', fr: 'Lien de démonstration', ar: 'رابط العرض' }, type: 'url', required: false, localized: false, defaultVisible: true },
      { key: 'githubUrl', name: { en: 'GitHub URL', fr: 'Lien GitHub', ar: 'رابط GitHub' }, type: 'url', required: false, localized: false, defaultVisible: true },
      { key: 'startDate', name: { en: 'Start Date', fr: 'Date de début', ar: 'تاريخ البداية' }, type: 'date', required: false, localized: false, defaultVisible: true },
      { key: 'endDate', name: { en: 'End Date', fr: 'Date de fin', ar: 'تاريخ النهاية' }, type: 'date', required: false, localized: false, defaultVisible: true },
      { key: 'featured', name: { en: 'Featured Project', fr: 'Projet mis en avant', ar: 'مشروع مميز' }, type: 'boolean', required: false, localized: false, defaultVisible: true },
    ],
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
  },
];

const DEFAULT_ENTRIES: ContentEntry[] = [
  {
    id: 'research-quantum-safe-crypto-2026',
    contentTypeId: 'research',
    slug: 'quantum-safe-cryptography-ai-infrastructure',
    status: 'published',
    fields: {
      title: {
        en: 'Post-Quantum Cryptography in Distributed AI Infrastructure',
        fr: 'Cryptographie post-quantique dans les infrastructures IA distribuées',
        ar: 'التشفير ما بعد الكمي في البنى التحتية الموزعة للذكاء الاصطناعي',
      },
      description: {
        en: 'An in-depth investigation into lattice-based cryptographic algorithms applied to secure multi-agent communication networks.',
        fr: 'Une étude approfondie des algorithmes cryptographiques basés sur les réseaux euclidiens appliqués à la sécurisation des communications multi-agents.',
        ar: 'دراسة متعمقة لخوارزميات التشفير المستندة إلى الشبيكات المطبقة لتأمين شبكات اتصالات الوكلاء المتعددين.',
      },
      date: '2026-04-15',
      coverImage: '/mon-portfolio/assets/images/research/quantum-crypto.webp',
      tags: ['Cryptographie', 'Post-Quantum', 'Artificial Intelligence', 'Security'],
      externalLink: 'https://arxiv.org/abs/2604.12345',
    },
    visibilityOverrides: {
      externalLink: false,
    },
    contextVisibilityOverrides: {
      card: { date: false, description: true },
      detail: { date: true, description: false },
    },
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
  },
];

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'media-green-a11y-cover',
    title: 'Green-A11y Agent Architecture',
    fileName: 'home.png',
    mimeType: 'image/png',
    externalUrl: 'https://github.com/Yosr-MEDDAH/mon-portfolio/blob/main/assets/green-a11y-agent-screenshots/home.png',
    mediaType: 'image',
    altText: {
      en: 'Green-A11y Agent Platform Dashboard',
      fr: 'Tableau de bord de la plateforme Green-A11y Agent',
      ar: 'لوحة تحكم منصة Green-A11y Agent',
    },
    captions: {
      en: 'Dual accessibility and carbon audit interface',
      fr: 'Interface de double audit accessibilité et empreinte carbone',
      ar: 'واجهة التدقيق المزدوج لإمكانية الوصول وبصمة الكربون',
    },
    tags: ['A11y', 'WCAG', 'Eco-design'],
    createdAt: '2026-04-01T12:00:00Z',
    updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'media-cv-document',
    title: 'Yosr Meddah CV PDF',
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    externalUrl: 'https://yosr-meddah.github.io/mon-portfolio/cv.pdf',
    mediaType: 'pdf',
    altText: { en: 'CV Document', fr: 'Document CV', ar: 'ملف السيرة الذاتية' },
    captions: { en: 'Curriculum Vitae', fr: 'Curriculum Vitae', ar: 'السيرة الذاتية' },
    tags: ['CV', 'Resume'],
    createdAt: '2026-04-01T12:00:00Z',
    updatedAt: '2026-04-01T12:00:00Z',
  },
];

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
      en: "2nd-year software engineering student at ISAMM, passionate about frontend development, digital accessibility (WCAG) and eco-design. I build inclusive solutions combining technical performance with environmental responsibility. Also a YouTube educator on these topics.",
      ar: "طالبة هندسة برمجيات في السنة الثانية بـ ISAMM، شغوفة بالتطوير الواجهة الأمامية وإمكانية الوصول الرقمي (WCAG) والتصميم البيئي. أصمم حلولاً شاملة تجمع بين الأداء التقني والمسؤولية البيئية. صانعة محتوى تعليمي على يوتيوب.",
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
  const log: ActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    action,
    entityType,
    entityId,
    details,
    userEmail,
    timestamp: new Date().toISOString(),
  };

  if (!isMockMode && db) {
    await setDoc(doc(db, 'activityLogs', log.id), cleanFirestoreData(log));
    return;
  }

  const logs = getLocal<ActivityLog[]>('logs', []);
  logs.unshift(log);
  setLocal('logs', logs.slice(0, 100)); // Keep last 100
}

export async function recordRevision(
  entityType: 'contentType' | 'entry' | 'media' | 'settings' | 'template',
  entityId: string,
  snapshot: Record<string, unknown>,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<Revision> {
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

  if (!isMockMode && db) {
    await setDoc(doc(db, 'revisions', rev.id), cleanFirestoreData(rev));
    return rev;
  }

  const allRevs = getLocal<Revision[]>('revisions', []);
  allRevs.unshift(rev);
  setLocal('revisions', allRevs);
  return rev;
}

export async function getRevisionsForEntity(
  entityType: string,
  entityId: string
): Promise<Revision[]> {
  if (!isMockMode && db) {
    // Single equality filter on entityId avoids requiring a composite index on Firestore Spark
    const q = query(
      collection(db, 'revisions'),
      where('entityId', '==', entityId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => d.data() as Revision)
      .filter((r) => r.entityType === entityType)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  }

  const allRevs = getLocal<Revision[]>('revisions', []);
  return allRevs
    .filter((r) => r.entityType === entityType && r.entityId === entityId)
    .sort((a, b) => b.revisionNumber - a.revisionNumber);
}

// ==================== CONTENT TYPES CRUD ====================

export async function fetchContentTypes(includeArchived = false): Promise<ContentTypeDefinition[]> {
  if (!isMockMode && db) {
    const snap = await getDocs(collection(db, 'contentTypes'));
    const items = snap.docs.map((d) => normalizeContentType(d.data() as ContentTypeDefinition));
    return includeArchived ? items : items.filter((i) => !i.isArchived);
  }

  const items = getLocal<ContentTypeDefinition[]>('contentTypes', DEFAULT_CONTENT_TYPES).map(normalizeContentType);
  return includeArchived ? items : items.filter((i) => !i.isArchived);
}

export async function fetchContentTypeById(id: string): Promise<ContentTypeDefinition | null> {
  if (!isMockMode && db) {
    const docSnap = await getDoc(doc(db, 'contentTypes', id));
    return docSnap.exists() ? normalizeContentType(docSnap.data() as ContentTypeDefinition) : null;
  }
  const all = await fetchContentTypes(true);
  return all.find((item) => item.id === id) || null;
}

export async function saveContentType(
  ct: ContentTypeDefinition,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<ContentTypeDefinition> {
  // Validate schema before saving
  validateContentType(ct);

  const payload: ContentTypeDefinition = {
    ...ct,
    updatedAt: new Date().toISOString(),
    createdAt: ct.createdAt || new Date().toISOString(),
  };

  if (!isMockMode && db) {
    await setDoc(doc(db, 'contentTypes', payload.id), cleanFirestoreData(payload));
  } else {
    const list = getLocal<ContentTypeDefinition[]>('contentTypes', DEFAULT_CONTENT_TYPES);
    const idx = list.findIndex((x) => x.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    setLocal('contentTypes', list);
  }

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
  if (!isMockMode && db) {
    const q = contentTypeId
      ? query(collection(db, 'entries'), where('contentTypeId', '==', contentTypeId))
      : collection(db, 'entries');
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => d.data() as ContentEntry);
    return includeArchived ? items : items.filter((i) => i.status !== 'archived');
  }

  let items = getLocal<ContentEntry[]>('entries', DEFAULT_ENTRIES);
  if (contentTypeId) {
    items = items.filter((i) => i.contentTypeId === contentTypeId);
  }
  return includeArchived ? items : items.filter((i) => i.status !== 'archived');
}

export async function fetchEntryById(id: string): Promise<ContentEntry | null> {
  if (!isMockMode && db) {
    const docSnap = await getDoc(doc(db, 'entries', id));
    return docSnap.exists() ? (docSnap.data() as ContentEntry) : null;
  }
  const all = await fetchEntries(undefined, true);
  return all.find((e) => e.id === id) || null;
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

  const payload: ContentEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
    createdAt: entry.createdAt || new Date().toISOString(),
    authorUid,
  };

  if (!isMockMode && db) {
    await setDoc(doc(db, 'entries', payload.id), cleanFirestoreData(payload));
  } else {
    const list = getLocal<ContentEntry[]>('entries', DEFAULT_ENTRIES);
    const idx = list.findIndex((x) => x.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    setLocal('entries', list);
  }

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
  if (!isMockMode && db) {
    const snap = await getDocs(collection(db, 'media'));
    return snap.docs.map((d) => d.data() as MediaItem);
  }

  return getLocal<MediaItem[]>('media', DEFAULT_MEDIA);
}

export async function saveMediaItem(
  item: MediaItem,
  authorUid: string,
  authorEmail: string
): Promise<MediaItem> {
  const payload: MediaItem = {
    ...item,
    updatedAt: new Date().toISOString(),
    createdAt: item.createdAt || new Date().toISOString(),
  };

  if (!isMockMode && db) {
    await setDoc(doc(db, 'media', payload.id), cleanFirestoreData(payload));
  } else {
    const list = getLocal<MediaItem[]>('media', DEFAULT_MEDIA);
    const idx = list.findIndex((x) => x.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    setLocal('media', list);
  }

  await recordRevision('media', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail);
  await logActivity('SAVE_MEDIA', 'media', payload.id, `Saved media reference "${payload.title}"`, authorEmail);

  return payload;
}

export async function deleteMediaItem(id: string, authorEmail: string): Promise<void> {
  if (!isMockMode && db) {
    await deleteDoc(doc(db, 'media', id));
  } else {
    const list = getLocal<MediaItem[]>('media', DEFAULT_MEDIA);
    setLocal('media', list.filter((x) => x.id !== id));
  }
  await logActivity('DELETE_MEDIA', 'media', id, `Deleted media reference ${id}`, authorEmail);
}

// ==================== TEMPLATES & PRESETS CRUD ====================

export async function fetchTemplates(): Promise<TemplateDefinition[]> {
  if (!isMockMode && db) {
    const snap = await getDocs(collection(db, 'templates'));
    const items = snap.docs.map((d) => d.data() as TemplateDefinition);
    return items.length > 0 ? items : DEFAULT_TEMPLATES;
  }

  return getLocal<TemplateDefinition[]>('templates', DEFAULT_TEMPLATES);
}

export async function fetchTemplateById(id: string): Promise<TemplateDefinition | null> {
  if (!isMockMode && db) {
    const docSnap = await getDoc(doc(db, 'templates', id));
    return docSnap.exists() ? (docSnap.data() as TemplateDefinition) : null;
  }
  const all = await fetchTemplates();
  return all.find((t) => t.id === id) || null;
}

export async function saveTemplate(
  tpl: TemplateDefinition,
  authorUid: string,
  authorEmail: string,
  note?: string
): Promise<TemplateDefinition> {
  const payload: TemplateDefinition = {
    ...tpl,
    updatedAt: new Date().toISOString(),
    createdAt: tpl.createdAt || new Date().toISOString(),
  };

  if (!isMockMode && db) {
    await setDoc(doc(db, 'templates', payload.id), cleanFirestoreData(payload));
  } else {
    const list = getLocal<TemplateDefinition[]>('templates', DEFAULT_TEMPLATES);
    const idx = list.findIndex((x) => x.id === payload.id);
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    setLocal('templates', list);
  }

  await recordRevision('template', payload.id, payload as unknown as Record<string, unknown>, authorUid, authorEmail, note);
  await logActivity('SAVE_TEMPLATE', 'template', payload.id, `Saved template "${payload.name}"`, authorEmail);

  return payload;
}

export async function deleteTemplate(id: string, authorEmail: string): Promise<void> {
  if (!isMockMode && db) {
    await deleteDoc(doc(db, 'templates', id));
  } else {
    const list = getLocal<TemplateDefinition[]>('templates', DEFAULT_TEMPLATES);
    setLocal('templates', list.filter((x) => x.id !== id));
  }
  await logActivity('DELETE_TEMPLATE', 'template', id, `Deleted template ${id}`, authorEmail);
}

// ==================== SETTINGS & LOGS ====================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isMockMode && db) {
    const docSnap = await getDoc(doc(db, 'siteSettings', 'global'));
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    // Connected to Firestore, but settings doc not created yet: return defaults
    return DEFAULT_SETTINGS;
  }

  return getLocal<SiteSettings>('settings', DEFAULT_SETTINGS);
}

export async function saveSiteSettings(
  settings: SiteSettings,
  authorUid: string,
  authorEmail: string
): Promise<SiteSettings> {
  if (!isMockMode && db) {
    await setDoc(doc(db, 'siteSettings', 'global'), cleanFirestoreData(settings));
  } else {
    setLocal('settings', settings);
  }

  await recordRevision('settings', 'global', settings as unknown as Record<string, unknown>, authorUid, authorEmail, 'Updated site settings');
  await logActivity('SAVE_SETTINGS', 'settings', 'global', 'Updated site global settings', authorEmail);

  return settings;
}

export async function fetchRecentLogs(maxCount = 20): Promise<ActivityLog[]> {
  if (!isMockMode && db) {
    const q = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ActivityLog);
  }

  const logs = getLocal<ActivityLog[]>('logs', []);
  return logs.slice(0, maxCount);
}

export async function fetchAllRevisions(maxCount = 50): Promise<Revision[]> {
  if (!isMockMode && db) {
    const q = query(collection(db, 'revisions'), orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Revision);
  }

  const revs = getLocal<Revision[]>('revisions', []);
  return revs.slice(0, maxCount);
}
