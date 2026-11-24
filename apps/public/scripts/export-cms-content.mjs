#!/usr/bin/env node
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Standard destination for Astro production content store
export const DEFAULT_OUTPUT_PATH = resolve(
  __dirname,
  '../src/content-store/data/published-content.json'
);

/**
 * Resolves Firebase Admin credentials from environment variables safely.
 * Never logs or exposes credentials.
 */
export function resolveCredentials() {
  const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawSecret && rawSecret.trim().length > 0) {
    const trimmed = rawSecret.trim();
    try {
      if (trimmed.startsWith('{')) {
        return JSON.parse(trimmed);
      }
      // Attempt base64 decoding if not direct JSON
      const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (err) {
      throw new Error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null; // Will trigger applicationDefault() in Firebase Admin
  }

  return undefined;
}

/**
 * Strips internal metadata and sanitizes content types to approved public fields only.
 */
export function sanitizeContentType(id, data) {
  return {
    id: String(id),
    name: data.name,
    description: data.description || '',
    slug: data.slug ? String(data.slug) : String(id),
    fields: Array.isArray(data.fields)
      ? data.fields.map((f) => ({
          key: String(f.key),
          name: f.name,
          description: f.description || '',
          type: f.type,
          required: Boolean(f.required),
          localized: Boolean(f.localized),
          defaultVisible: f.defaultVisible !== undefined ? f.defaultVisible : true,
          ...(f.options ? { options: f.options } : {}),
        }))
      : [],
    defaultVisibility:
      data.defaultVisibility && typeof data.defaultVisibility === 'object'
        ? data.defaultVisibility
        : {},
    contextDefaultVisibility:
      data.contextDefaultVisibility && typeof data.contextDefaultVisibility === 'object'
        ? data.contextDefaultVisibility
        : {},
  };
}

/**
 * Strips internal metadata and sanitizes entries to approved public fields only.
 */
export function sanitizeEntry(id, data) {
  return {
    id: String(id),
    contentTypeId: String(data.contentTypeId),
    slug: data.slug ? String(data.slug) : String(id),
    status: 'published',
    fields: data.fields && typeof data.fields === 'object' ? data.fields : {},
    visibilityOverrides:
      data.visibilityOverrides && typeof data.visibilityOverrides === 'object'
        ? data.visibilityOverrides
        : {},
    contextVisibilityOverrides:
      data.contextVisibilityOverrides && typeof data.contextVisibilityOverrides === 'object'
        ? data.contextVisibilityOverrides
        : {},
    publishedAt: data.publishedAt || data.createdAt || new Date().toISOString(),
  };
}

/**
 * Strips internal metadata and sanitizes templates to approved public fields only.
 */
export function sanitizeTemplate(id, data) {
  return {
    id: String(id),
    name: data.name ? String(data.name) : String(id),
    targetType: data.targetType || 'card',
    layout: data.layout || 'grid',
    aspectRatio: data.aspectRatio || '16/9',
    description: data.description || '',
    visibilitySettings:
      data.visibilitySettings && typeof data.visibilitySettings === 'object'
        ? data.visibilitySettings
        : {},
  };
}

/**
 * Strips internal metadata and sanitizes media items to approved public fields only.
 */
export function sanitizeMediaItem(id, data) {
  return {
    id: String(id),
    title: data.title ? String(data.title) : '',
    fileName: data.fileName ? String(data.fileName) : '',
    mimeType: data.mimeType ? String(data.mimeType) : '',
    externalUrl: data.externalUrl ? String(data.externalUrl) : '',
    mediaType: data.mediaType || 'image',
    altText:
      data.altText && typeof data.altText === 'object'
        ? data.altText
        : { en: String(data.altText || ''), fr: '', ar: '' },
    captions:
      data.captions && typeof data.captions === 'object'
        ? data.captions
        : { en: String(data.captions || ''), fr: '', ar: '' },
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  };
}

/**
 * Strips internal metadata and sanitizes site settings to approved public fields only.
 */
export function sanitizeSiteSettings(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    siteTitle: data.siteTitle || { en: 'Portfolio', fr: 'Portfolio', ar: 'المعرض' },
    defaultLocale: data.defaultLocale || 'en',
    supportedLocales: Array.isArray(data.supportedLocales)
      ? data.supportedLocales
      : ['en', 'fr', 'ar'],
    seoDefaults:
      data.seoDefaults && typeof data.seoDefaults === 'object' ? data.seoDefaults : {},
  };
}

/**
 * Validates the complete export payload before writing to disk.
 * Ensures data integrity, localized translations, and required structure.
 */
export function validateExportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Export validation failed: Payload must be a non-null object.');
  }

  if (!payload.exportedAt || typeof payload.exportedAt !== 'string') {
    throw new Error('Export validation failed: exportedAt timestamp string is required.');
  }

  if (!Array.isArray(payload.contentTypes)) {
    throw new Error('Export validation failed: contentTypes must be an array.');
  }

  for (const ct of payload.contentTypes) {
    if (!ct.id || typeof ct.id !== 'string') {
      throw new Error('Export validation failed: Content type missing string id.');
    }
    if (!ct.name || (typeof ct.name !== 'string' && typeof ct.name !== 'object')) {
      throw new Error(`Export validation failed: Content type '${ct.id}' missing valid name.`);
    }
    if (!ct.slug || typeof ct.slug !== 'string') {
      throw new Error(`Export validation failed: Content type '${ct.id}' missing valid slug.`);
    }
    if (!Array.isArray(ct.fields)) {
      throw new Error(`Export validation failed: Content type '${ct.id}' fields must be an array.`);
    }
  }

  if (!Array.isArray(payload.entries)) {
    throw new Error('Export validation failed: entries must be an array.');
  }

  for (const entry of payload.entries) {
    if (!entry.id || typeof entry.id !== 'string') {
      throw new Error('Export validation failed: Entry missing valid string id.');
    }
    if (!entry.contentTypeId || typeof entry.contentTypeId !== 'string') {
      throw new Error(`Export validation failed: Entry '${entry.id}' missing contentTypeId.`);
    }
    if (!entry.slug || typeof entry.slug !== 'string') {
      throw new Error(`Export validation failed: Entry '${entry.id}' missing valid slug.`);
    }
    if (entry.status !== 'published') {
      throw new Error(
        `Export validation failed: Entry '${entry.id}' has status '${entry.status}'. Only 'published' entries can be exported.`
      );
    }
    if (!entry.fields || typeof entry.fields !== 'object') {
      throw new Error(`Export validation failed: Entry '${entry.id}' fields must be an object.`);
    }

    // Validate that multilingual fields do not have empty translations across all locales
    for (const [key, val] of Object.entries(entry.fields)) {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const hasLangKeys = ['en', 'fr', 'ar'].some((lang) => lang in val);
        if (hasLangKeys) {
          const localized = val;
          if (!localized.en && !localized.fr && !localized.ar) {
            throw new Error(
              `Export validation failed: Localized field '${key}' in entry '${entry.id}' has empty translations.`
            );
          }
        }
      }
    }
  }

  if (!Array.isArray(payload.templates)) {
    throw new Error('Export validation failed: templates must be an array.');
  }
  for (const tmpl of payload.templates) {
    if (!tmpl.id || typeof tmpl.id !== 'string') {
      throw new Error('Export validation failed: Template missing valid id.');
    }
    if (!tmpl.name || typeof tmpl.name !== 'string') {
      throw new Error(`Export validation failed: Template '${tmpl.id}' missing valid name.`);
    }
  }

  if (!Array.isArray(payload.media)) {
    throw new Error('Export validation failed: media must be an array.');
  }
  for (const item of payload.media) {
    if (!item.id || typeof item.id !== 'string') {
      throw new Error('Export validation failed: Media item missing valid id.');
    }
  }

  return true;
}

/**
 * Core export logic: extracts published CMS data and filters out all non-public content.
 * Read failures are FATAL — network/permission errors reject and abort immediately.
 * Empty collections are valid.
 *
 * @param {object} options
 * @param {import('firebase-admin/firestore').Firestore} options.db - Firestore instance
 * @param {string} [options.outputPath] - Output JSON destination
 * @returns {Promise<object>} Exported payload
 */
export async function exportCmsData({ db, outputPath = DEFAULT_OUTPUT_PATH }) {
  console.log('[CMS Export] Connecting to Firestore...');

  // 1. Export Content Types (excluding archived schemas). Read failures are fatal.
  console.log('[CMS Export] Querying contentTypes collection...');
  const contentTypesSnap = await db.collection('contentTypes').get();
  const contentTypes = [];
  for (const doc of contentTypesSnap.docs) {
    const data = doc.data();
    if (data.isArchived) continue;
    contentTypes.push(sanitizeContentType(doc.id, data));
  }
  console.log(`[CMS Export] Exported ${contentTypes.length} active content types.`);

  // 2. Export Entries: STRICTLY status === 'published'. Read failures are fatal.
  console.log('[CMS Export] Querying entries collection for status === "published"...');
  const entriesSnap = await db
    .collection('entries')
    .where('status', '==', 'published')
    .get();

  const entries = [];
  for (const doc of entriesSnap.docs) {
    const data = doc.data();

    // Defense in depth: enforce status === 'published' and not archived
    if (data.status !== 'published') continue;
    if (data.isArchived === true) continue;

    entries.push(sanitizeEntry(doc.id, data));
  }
  console.log(
    `[CMS Export] Exported ${entries.length} published entries (drafts and archived entries excluded).`
  );

  // 3. Export Templates. Read failures are fatal. Empty collection is valid.
  console.log('[CMS Export] Querying templates collection...');
  const templatesSnap = await db.collection('templates').get();
  const templates = templatesSnap.docs.map((doc) => sanitizeTemplate(doc.id, doc.data()));
  console.log(`[CMS Export] Exported ${templates.length} layout templates.`);

  // 4. Export Media References. Read failures are fatal. Empty collection is valid.
  console.log('[CMS Export] Querying media collection...');
  const mediaSnap = await db.collection('media').get();
  const media = mediaSnap.docs.map((doc) => sanitizeMediaItem(doc.id, doc.data()));
  console.log(`[CMS Export] Exported ${media.length} media metadata records.`);

  // 5. Export Site Settings. Read failures are fatal. Non-existent doc is valid (null).
  console.log('[CMS Export] Checking siteSettings/global...');
  const settingsDoc = await db.collection('siteSettings').doc('global').get();
  const siteSettings = settingsDoc.exists ? sanitizeSiteSettings(settingsDoc.data()) : null;
  if (siteSettings) {
    console.log('[CMS Export] Exported site settings.');
  } else {
    console.log('[CMS Export] Site settings document not found; defaulting to null.');
  }

  // EXCLUSIONS AUDIT (verified omitted from export):
  // - drafts: omitted by query + filter
  // - archived entries: omitted by filter
  // - adminUsers: NEVER queried
  // - revisions: NEVER queried
  // - activityLogs: NEVER queried
  // - internal metadata: stripped by sanitize functions

  const payload = {
    exportedAt: new Date().toISOString(),
    contentTypes,
    entries,
    templates,
    media,
    siteSettings,
  };

  // Validate complete export before writing
  validateExportPayload(payload);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`[CMS Export] Wrote production content payload to: ${outputPath}`);

  return payload;
}

/**
 * CLI execution entry point
 */
async function main() {
  const credentials = resolveCredentials();

  if (credentials === undefined) {
    console.error(
      '================================================================================'
    );
    console.error('[CMS Export Error] Missing Firebase Service Account credentials.');
    console.error(
      'Please configure the FIREBASE_SERVICE_ACCOUNT secret in GitHub repository settings,'
    );
    console.error(
      'or set FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS in your environment.'
    );
    console.error(
      '================================================================================'
    );
    process.exit(1);
  }

  // Initialize Firebase Admin SDK
  if (getApps().length === 0) {
    if (credentials === null) {
      initializeApp();
    } else {
      initializeApp({
        credential: cert(credentials),
      });
    }
  }

  const db = getFirestore();
  await exportCmsData({ db });
  console.log('[CMS Export] Export completed successfully.');
}

// Run main if called directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('[CMS Export Fatal Error]:', err.message);
    process.exit(1);
  });
}
