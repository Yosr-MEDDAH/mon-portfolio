#!/usr/bin/env node
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFileSync, mkdirSync, renameSync, unlinkSync, existsSync } from 'node:fs';
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
 * Validates required service account fields beyond project_id.
 * Safely verifies GOOGLE_APPLICATION_CREDENTIALS existence without exposing secrets.
 */
export function resolveCredentials() {
  const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (rawSecret && rawSecret.trim().length > 0) {
    const trimmed = rawSecret.trim();
    try {
      let parsed;
      if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
        parsed = JSON.parse(decoded);
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Service account must be a valid JSON object.');
      }
      if (!parsed.project_id || typeof parsed.project_id !== 'string') {
        throw new Error('Service account missing valid project_id.');
      }
      if (
        !parsed.client_email ||
        typeof parsed.client_email !== 'string' ||
        !parsed.client_email.includes('@')
      ) {
        throw new Error('Service account missing valid client_email.');
      }
      if (
        !parsed.private_key ||
        typeof parsed.private_key !== 'string' ||
        !parsed.private_key.includes('PRIVATE KEY')
      ) {
        throw new Error('Service account missing valid private_key.');
      }

      return parsed;
    } catch (err) {
      const isKnownCheck =
        err instanceof Error &&
        (err.message.includes('project_id') ||
          err.message.includes('client_email') ||
          err.message.includes('private_key'));
      throw new Error(
        `Failed to parse FIREBASE_SERVICE_ACCOUNT: ${
          isKnownCheck ? err.message : 'Invalid JSON or base64 structure.'
        }`
      );
    }
  }

  const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gacPath && typeof gacPath === 'string' && gacPath.trim().length > 0) {
    const trimmedPath = gacPath.trim();
    if (!existsSync(trimmedPath)) {
      throw new Error(
        'GOOGLE_APPLICATION_CREDENTIALS file path does not exist on disk.'
      );
    }
    return null; // Will trigger applicationDefault() in Firebase Admin
  }

  return undefined;
}

/**
 * Sanitizes a localized string object or string, preserving EN/FR/AR translations.
 */
export function sanitizeLocalizedString(val, fallback = '') {
  if (typeof val === 'string') {
    return { en: val, fr: val, ar: val };
  }
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return {
      en: typeof val.en === 'string' ? val.en : fallback,
      fr: typeof val.fr === 'string' ? val.fr : '',
      ar: typeof val.ar === 'string' ? val.ar : '',
    };
  }
  return { en: fallback, fr: '', ar: '' };
}

/**
 * Sanitizes defaultVisible settings: accepts boolean, or object limited to allowed contexts.
 */
export function sanitizeDefaultVisible(rawDefaultVisible) {
  if (typeof rawDefaultVisible === 'boolean') {
    return rawDefaultVisible;
  }
  if (
    rawDefaultVisible &&
    typeof rawDefaultVisible === 'object' &&
    !Array.isArray(rawDefaultVisible)
  ) {
    const allowedContexts = ['card', 'detail', 'section'];
    const sanitized = {};
    for (const ctx of allowedContexts) {
      if (typeof rawDefaultVisible[ctx] === 'boolean') {
        sanitized[ctx] = rawDefaultVisible[ctx];
      }
    }
    if (Object.keys(sanitized).length > 0) {
      return sanitized;
    }
  }
  return true;
}

/**
 * Deep-sanitizes field options using an explicit allowlist.
 */
export function sanitizeFieldOptions(options) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return undefined;
  const allowed = {};

  if (Array.isArray(options.choices)) {
    allowed.choices = options.choices
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({
        value: String(c.value ?? ''),
        label:
          typeof c.label === 'object' && c.label !== null
            ? sanitizeLocalizedString(c.label, String(c.value ?? ''))
            : String(c.label ?? c.value ?? ''),
      }));
  }

  if (typeof options.min === 'number') allowed.min = options.min;
  if (typeof options.max === 'number') allowed.max = options.max;
  if (typeof options.targetCollection === 'string') allowed.targetCollection = options.targetCollection;
  if (Array.isArray(options.acceptedTypes)) {
    allowed.acceptedTypes = options.acceptedTypes.map(String);
  }

  return Object.keys(allowed).length > 0 ? allowed : undefined;
}

/**
 * Deep-sanitizes visibility settings using explicit allowlists and schema field keys.
 */
export function sanitizeVisibilitySettings(rawVisibility, rawContextVisibility, allowedFieldKeys) {
  const allowedContexts = new Set(['card', 'detail', 'section']);
  const defaultVisibility = {};

  if (rawVisibility && typeof rawVisibility === 'object' && !Array.isArray(rawVisibility)) {
    for (const [k, v] of Object.entries(rawVisibility)) {
      if (allowedFieldKeys.has(k) && typeof v === 'boolean' && !k.startsWith('_')) {
        defaultVisibility[k] = v;
      }
    }
  }

  const contextDefaultVisibility = {};
  if (
    rawContextVisibility &&
    typeof rawContextVisibility === 'object' &&
    !Array.isArray(rawContextVisibility)
  ) {
    for (const [ctx, fieldMap] of Object.entries(rawContextVisibility)) {
      if (
        allowedContexts.has(ctx) &&
        fieldMap &&
        typeof fieldMap === 'object' &&
        !Array.isArray(fieldMap)
      ) {
        const map = {};
        for (const [k, v] of Object.entries(fieldMap)) {
          if (allowedFieldKeys.has(k) && typeof v === 'boolean' && !k.startsWith('_')) {
            map[k] = v;
          }
        }
        if (Object.keys(map).length > 0) {
          contextDefaultVisibility[ctx] = map;
        }
      }
    }
  }

  return { defaultVisibility, contextDefaultVisibility };
}

/**
 * Deep-sanitizes content types to approved public fields only.
 */
export function sanitizeContentType(id, data) {
  const fields = Array.isArray(data.fields) ? data.fields : [];
  const sanitizedFields = fields
    .filter((f) => f && typeof f === 'object' && f.key)
    .map((f) => {
      const fieldDef = {
        key: String(f.key),
        name:
          typeof f.name === 'object' && f.name !== null
            ? sanitizeLocalizedString(f.name, String(f.key))
            : String(f.name || f.key),
        description: f.description
          ? typeof f.description === 'object'
            ? sanitizeLocalizedString(f.description, '')
            : String(f.description)
          : '',
        type: String(f.type || 'text'),
        required: Boolean(f.required),
        localized: Boolean(f.localized),
        defaultVisible: sanitizeDefaultVisible(f.defaultVisible),
      };
      const opts = sanitizeFieldOptions(f.options);
      if (opts) fieldDef.options = opts;
      return fieldDef;
    });

  const fieldKeys = new Set(sanitizedFields.map((f) => f.key));
  const { defaultVisibility, contextDefaultVisibility } = sanitizeVisibilitySettings(
    data.defaultVisibility,
    data.contextDefaultVisibility,
    fieldKeys
  );

  return {
    id: String(id),
    name:
      typeof data.name === 'object' && data.name !== null
        ? sanitizeLocalizedString(data.name, String(id))
        : String(data.name || id),
    description: data.description
      ? typeof data.description === 'object'
        ? sanitizeLocalizedString(data.description, '')
        : String(data.description)
      : '',
    slug: data.slug ? String(data.slug) : String(id),
    fields: sanitizedFields,
    defaultVisibility,
    contextDefaultVisibility,
  };
}

/**
 * Sanitizes entries using an explicit public-field allowlist based on the content type schema.
 * Rejects or safely skips published entries whose content type schema is missing.
 * Never allows all fields by default.
 * Preserves all underlying field values and context-specific visibility overrides.
 */
export function sanitizeEntry(id, data, contentType) {
  if (!contentType || !Array.isArray(contentType.fields)) {
    return null; // Safely skip entry when schema is missing
  }

  const allowedKeys = new Set(contentType.fields.map((f) => f.key));
  const rawFields =
    data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)
      ? data.fields
      : {};
  const sanitizedFields = {};

  for (const [key, val] of Object.entries(rawFields)) {
    if (allowedKeys.has(key)) {
      sanitizedFields[key] = val; // Preserves EN/FR/AR and custom field values intact
    }
  }

  // Deep-sanitize visibility overrides to schema-defined fields only
  const {
    defaultVisibility: visibilityOverrides,
    contextDefaultVisibility: contextVisibilityOverrides,
  } = sanitizeVisibilitySettings(
    data.visibilityOverrides,
    data.contextVisibilityOverrides,
    allowedKeys
  );

  return {
    id: String(id),
    contentTypeId: String(data.contentTypeId),
    slug: data.slug ? String(data.slug) : String(id),
    status: 'published',
    fields: sanitizedFields,
    visibilityOverrides,
    contextVisibilityOverrides,
    publishedAt: data.publishedAt || data.createdAt || new Date().toISOString(),
  };
}

/**
 * Deep-sanitizes templates using explicit allowlists.
 */
export function sanitizeTemplate(id, data) {
  const allowedTargets = new Set(['card', 'detail', 'section']);
  const allowedLayouts = new Set(['grid', 'list', 'single']);

  let visibilitySettings = {};
  if (
    data.visibilitySettings &&
    typeof data.visibilitySettings === 'object' &&
    !Array.isArray(data.visibilitySettings)
  ) {
    const raw = data.visibilitySettings;
    const sanitized = {};

    if (raw.visibility && typeof raw.visibility === 'object' && !Array.isArray(raw.visibility)) {
      const vis = {};
      for (const [k, v] of Object.entries(raw.visibility)) {
        if (typeof v === 'boolean' && !k.startsWith('_')) vis[k] = v;
      }
      sanitized.visibility = vis;
    }

    if (
      raw.contextVisibility &&
      typeof raw.contextVisibility === 'object' &&
      !Array.isArray(raw.contextVisibility)
    ) {
      const ctxVis = {};
      for (const [ctx, fMap] of Object.entries(raw.contextVisibility)) {
        if (allowedTargets.has(ctx) && fMap && typeof fMap === 'object' && !Array.isArray(fMap)) {
          const map = {};
          for (const [k, v] of Object.entries(fMap)) {
            if (typeof v === 'boolean' && !k.startsWith('_')) map[k] = v;
          }
          ctxVis[ctx] = map;
        }
      }
      sanitized.contextVisibility = ctxVis;
    }

    for (const [k, v] of Object.entries(raw)) {
      if (k !== 'visibility' && k !== 'contextVisibility' && typeof v === 'boolean' && !k.startsWith('_')) {
        sanitized[k] = v;
      }
    }
    visibilitySettings = sanitized;
  }

  return {
    id: String(id),
    name: String(data.name || id),
    targetType: allowedTargets.has(data.targetType) ? data.targetType : 'card',
    layout: allowedLayouts.has(data.layout) ? data.layout : 'grid',
    aspectRatio: String(data.aspectRatio || '16/9'),
    description: String(data.description || ''),
    visibilitySettings,
  };
}

/**
 * Deep-sanitizes media items to approved public fields only.
 */
export function sanitizeMediaItem(id, data) {
  const allowedMediaTypes = new Set([
    'image',
    'video',
    'audio',
    'pdf',
    'notebook',
    'linkedin',
    'external',
    'other',
  ]);

  return {
    id: String(id),
    title: String(data.title || ''),
    fileName: String(data.fileName || ''),
    mimeType: String(data.mimeType || ''),
    externalUrl: String(data.externalUrl || ''),
    mediaType: allowedMediaTypes.has(data.mediaType) ? data.mediaType : 'image',
    altText: sanitizeLocalizedString(data.altText, ''),
    captions: sanitizeLocalizedString(data.captions, ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  };
}

/**
 * Deep-sanitizes site settings using explicit allowlists.
 */
export function sanitizeSiteSettings(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;

  const validLocales = ['en', 'fr', 'ar'];
  const defaultLocale = validLocales.includes(data.defaultLocale) ? data.defaultLocale : 'en';
  const supportedLocales = Array.isArray(data.supportedLocales)
    ? data.supportedLocales.filter((l) => validLocales.includes(l))
    : ['en', 'fr', 'ar'];

  const siteTitle = sanitizeLocalizedString(data.siteTitle, 'Portfolio');

  let seoDefaults = {};
  if (data.seoDefaults && typeof data.seoDefaults === 'object' && !Array.isArray(data.seoDefaults)) {
    const rawSeo = data.seoDefaults;
    seoDefaults = {
      metaTitle: sanitizeLocalizedString(rawSeo.metaTitle, ''),
      metaDescription: sanitizeLocalizedString(rawSeo.metaDescription, ''),
    };
  }

  return {
    siteTitle,
    defaultLocale,
    supportedLocales: supportedLocales.length > 0 ? supportedLocales : ['en', 'fr', 'ar'],
    seoDefaults,
  };
}

/**
 * Validates the complete export payload before writing to disk.
 * Preserves EN/FR/AR translations and English fallback, allowing empty optional translations.
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

  const ctMap = new Map();
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
    ctMap.set(ct.id, ct);
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

    // Verify required fields according to schema (if schema is available)
    const ct = ctMap.get(entry.contentTypeId);
    if (ct && Array.isArray(ct.fields)) {
      for (const fieldDef of ct.fields) {
        if (fieldDef.required) {
          const val = entry.fields[fieldDef.key];
          if (val === undefined || val === null) {
            throw new Error(
              `Export validation failed: Required field '${fieldDef.key}' is missing in entry '${entry.id}'.`
            );
          }

          if (fieldDef.localized) {
            // Required localized field: must be a plain object (not array, not primitive)
            if (typeof val !== 'object' || Array.isArray(val) || val === null) {
              throw new Error(
                `Export validation failed: Required localized field '${fieldDef.key}' in entry '${entry.id}' must be a plain object with language keys.`
              );
            }
            // Each present language value must be a non-empty string (reject numbers, booleans, etc.)
            const supportedLangs = ['en', 'fr', 'ar'];
            let hasNonEmptyString = false;
            for (const lang of supportedLangs) {
              const translation = val[lang];
              if (translation !== undefined && translation !== null && translation !== '') {
                if (typeof translation !== 'string') {
                  throw new Error(
                    `Export validation failed: Required localized field '${fieldDef.key}' in entry '${entry.id}' has invalid non-string value for locale '${lang}'.`
                  );
                }
                if (translation.trim().length > 0) {
                  hasNonEmptyString = true;
                }
              }
            }
            if (!hasNonEmptyString) {
              throw new Error(
                `Export validation failed: Required localized field '${fieldDef.key}' in entry '${entry.id}' must have a non-empty string (after trim) in at least one of: en, fr, ar.`
              );
            }
          } else {
            // Non-localized required field: reject empty strings
            if (typeof val === 'string' && val.trim().length === 0) {
              throw new Error(
                `Export validation failed: Required field '${fieldDef.key}' in entry '${entry.id}' cannot be blank.`
              );
            }
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
 * Fail-fast: Firestore or validation errors never overwrite or corrupt the last valid JSON.
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
  const contentTypesMap = new Map();
  for (const doc of contentTypesSnap.docs) {
    const data = doc.data();
    if (data.isArchived) continue;
    const sanitized = sanitizeContentType(doc.id, data);
    contentTypes.push(sanitized);
    contentTypesMap.set(sanitized.id, sanitized);
  }
  console.log(`[CMS Export] Exported ${contentTypes.length} active content types.`);

  // 2. Export Entries: STRICTLY status === 'published' and non-archived. Read failures are fatal.
  console.log('[CMS Export] Querying entries collection for status === "published"...');
  const entriesSnap = await db
    .collection('entries')
    .where('status', '==', 'published')
    .get();

  const entries = [];
  for (const doc of entriesSnap.docs) {
    const data = doc.data();

    if (data.status !== 'published') continue;
    if (data.isArchived === true) continue;

    const ct = contentTypesMap.get(data.contentTypeId);
    if (!ct) {
      console.warn(
        `[CMS Export] Warning: Skipping published entry '${doc.id}'; content type schema '${data.contentTypeId}' is missing.`
      );
      continue; // Safely skip entries with missing schemas; never allow all fields by default
    }

    const sanitized = sanitizeEntry(doc.id, data, ct);
    if (sanitized) {
      entries.push(sanitized);
    }
  }
  console.log(
    `[CMS Export] Exported ${entries.length} published entries (drafts, archived entries, and schemaless entries excluded).`
  );

  // 3. Export Templates. Read failures are fatal. Empty collection is valid.
  console.log('[CMS Export] Querying templates collection...');
  const templatesSnap = await db.collection('templates').get();
  const templates = templatesSnap.docs.map((doc) => sanitizeTemplate(doc.id, doc.data()));
  console.log(`[CMS Export] Exported ${templates.length} layout templates.`);

  // 4. Export Media: ONLY items where isAwaitingPublication === false and externalUrl is valid.
  // Exclude true, undefined, null, or invalid values. Do not use isPublic.
  console.log('[CMS Export] Querying media collection...');
  const mediaSnap = await db.collection('media').get();
  const media = [];
  for (const doc of mediaSnap.docs) {
    const data = doc.data();
    // Strict publication approval: ONLY isAwaitingPublication === false
    if (data.isAwaitingPublication !== false) continue;
    if (data.isArchived === true) continue;
    if (!data.externalUrl || typeof data.externalUrl !== 'string' || !data.externalUrl.trim()) {
      continue;
    }
    media.push(sanitizeMediaItem(doc.id, data));
  }
  console.log(`[CMS Export] Exported ${media.length} public media metadata records.`);

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
  // - unapproved fields: stripped via explicit schema allowlist
  // - unapproved media: omitted by strict isAwaitingPublication === false check
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

  // Atomic write: write to temp file first, then replace existing file atomically
  const outDir = dirname(outputPath);
  mkdirSync(outDir, { recursive: true });
  const tempPath = resolve(outDir, `.published-content.tmp.${Date.now()}`);
  try {
    writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
    renameSync(tempPath, outputPath);
    console.log(`[CMS Export] Wrote production content payload to: ${outputPath}`);
  } catch (writeErr) {
    if (existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch {}
    }
    throw writeErr;
  }

  return payload;
}

/**
 * CLI execution entry point
 */
async function main() {
  let credentials;
  try {
    credentials = resolveCredentials();
  } catch (err) {
    console.error(`[CMS Export Error] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  if (credentials === undefined) {
    console.error('[CMS Export Error] Missing Firebase Service Account credentials.');
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
    console.error('[CMS Export Fatal Error]:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
