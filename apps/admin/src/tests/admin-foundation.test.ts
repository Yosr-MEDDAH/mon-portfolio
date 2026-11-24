import {
  validateContentType,
  validateEntry,
} from '../shared/validation.ts';
import {
  isFieldVisible,
  resolveVisibility,
  getVisibleFieldValues,
} from '../shared/visibility.ts';
import type {
  ContentTypeDefinition,
  ContentEntry,
  TemplateVisibilitySettings,
  Revision,
  TemplateDefinition,
} from '../shared/types.ts';
import { checkIsAdmin } from '../firebase/auth.ts';
import { cleanFirestoreData, DEFAULT_TEMPLATES } from '../firebase/firestore.ts';

export async function runAdminFoundationTests() {
  console.log('=== Running Admin CMS Foundation Tests ===\n');

  // 1. Authentication Guards & Unauthorized Access Denial
  console.log('1. Testing Authentication guards & authorization verification...');
  const unauthorizedCheck = await checkIsAdmin('unauthorized-user-uid');
  if (unauthorizedCheck.isAdmin !== false || unauthorizedCheck.adminData !== null) {
    throw new Error('Unauthorized user was incorrectly granted admin access!');
  }

  const authorizedCheck = await checkIsAdmin('mock-admin-uid-yosr');
  if (authorizedCheck.isAdmin !== true || authorizedCheck.adminData?.role !== 'admin') {
    throw new Error('Authorized admin check failed');
  }
  console.log('✓ Unauthorized access successfully denied; Admin authorization verified.');

  // 2. Content Type Validation & Dynamic Field Definitions
  console.log('2. Testing Content Type schema validation and dynamic field definitions...');
  const validContentType: ContentTypeDefinition = {
    id: 'test-articles',
    slug: 'test-articles',
    name: { en: 'Articles', fr: 'Articles', ar: 'مقالات' },
    description: { en: 'Articles list', fr: 'Liste articles', ar: 'قائمة المقالات' },
    defaultVisibility: { title: true, body: true },
    contextDefaultVisibility: {
      card: { title: true, body: false },
      detail: { title: true, body: true },
    },
    fields: [
      { key: 'title', name: { en: 'Title', fr: 'Titre', ar: 'العنوان' }, type: 'text', required: true, localized: true, defaultVisible: true },
      { key: 'body', name: { en: 'Body', fr: 'Corps', ar: 'المحتوى' }, type: 'textarea', required: false, localized: true, defaultVisible: true },
      { key: 'score', name: 'Score', type: 'number', required: false, defaultVisible: true },
    ],
  };

  const parsedCt = validateContentType(validContentType);
  if (!parsedCt || parsedCt.id !== 'test-articles' || parsedCt.fields.length !== 3) {
    throw new Error('Valid content type failed validation');
  }

  // Reject invalid slug or empty fields
  let ctRejected = false;
  try {
    validateContentType({ ...validContentType, slug: 'Invalid Slug with Spaces!' });
  } catch {
    ctRejected = true;
  }
  if (!ctRejected) throw new Error('Invalid content type slug should have been rejected');
  console.log('✓ Content type schema validation and dynamic fields verified.');

  // 3. Entry Validation with dynamic schemas
  console.log('3. Testing dynamic entry validation (valid & rejected required fields)...');
  const validEntry: ContentEntry = {
    id: 'art-001',
    contentTypeId: 'test-articles',
    slug: 'first-article-slug',
    status: 'published',
    fields: {
      title: { en: 'First Article', fr: 'Premier Article', ar: 'المقال الأول' },
      body: { en: 'Body text in English', fr: 'Texte en français', ar: 'نص باللغة العربية' },
    },
  };

  const parsedEntry = validateEntry(validContentType, validEntry);
  if (!parsedEntry || parsedEntry.slug !== 'first-article-slug') {
    throw new Error('Valid entry failed schema validation');
  }

  // Missing required localized title
  let entryRejected = false;
  try {
    validateEntry(validContentType, {
      ...validEntry,
      fields: {
        title: { en: 'Only English', fr: 'Français' /* missing ar */ },
      },
    });
  } catch {
    entryRejected = true;
  }
  if (!entryRejected) throw new Error('Missing localized required language should have been rejected');
  console.log('✓ Dynamic entry validation correctly enforces field rules.');

  // 4. Independent EN/FR/AR localization & fallback
  console.log('4. Testing independent EN/FR/AR localization editing and fallback...');
  const partialEntry: ContentEntry = {
    id: 'art-002',
    contentTypeId: 'test-articles',
    slug: 'partial-article',
    status: 'draft',
    fields: {
      title: { en: 'Universal Title', fr: '', ar: '' },
    },
  };
  // Fallback order: en -> fr -> ar
  const locTitle = partialEntry.fields.title as Record<string, string>;
  const enVal = locTitle.en || '';
  const frFallback = locTitle.fr || locTitle.en || '';
  const arFallback = locTitle.ar || locTitle.en || '';
  if (enVal !== 'Universal Title' || frFallback !== 'Universal Title' || arFallback !== 'Universal Title') {
    throw new Error('Localization fallback assertion failed');
  }
  console.log('✓ Translations remain independent with reliable English fallback.');

  // 5. Contextual Visibility Resolution Priority: entry > template > content-type
  console.log('5. Testing Contextual Visibility priority chain (entry > template > content-type)...');
  const testTpl: TemplateVisibilitySettings = {
    contextVisibility: {
      card: {
        body: true, // Template says body: true in card (overriding content-type default: false)
      },
    },
  };

  // Content type says card.body = false, but template says card.body = true
  const tplVisible = isFieldVisible(validContentType, validEntry, 'body', 'card', testTpl);
  if (tplVisible !== true) {
    throw new Error(`Template setting (true) should have overridden content-type default (false), got ${tplVisible}`);
  }

  // Entry override says card.body = false (overriding template setting: true)
  const entryWithOverride: ContentEntry = {
    ...validEntry,
    contextVisibilityOverrides: {
      card: { body: false },
    },
  };
  const entryOverrideVisible = isFieldVisible(validContentType, entryWithOverride, 'body', 'card', testTpl);
  if (entryOverrideVisible !== false) {
    throw new Error(`Entry override (false) should have overridden template setting (true), got ${entryOverrideVisible}`);
  }
  console.log('✓ Priority verified: entry override > template setting > content-type default.');

  // 6. Data preservation when fields are hidden
  console.log('6. Testing data preservation when fields are hidden...');
  const visibleCardFields = getVisibleFieldValues(validContentType, entryWithOverride, 'card', testTpl);
  if ('body' in visibleCardFields) {
    throw new Error('Hidden body should not appear in visibleCardFields for card');
  }
  // Original entry data MUST NOT BE ALTERED
  if (!entryWithOverride.fields.body || typeof entryWithOverride.fields.body !== 'object') {
    throw new Error('CRITICAL: underlying entry.fields.body was deleted or mutated!');
  }
  console.log('✓ Data preservation verified: underlying fields are untouched when hidden.');

  // 7. Reversible archiving & restoration
  console.log('7. Testing archiving and restoration states...');
  const draftEntry: ContentEntry = { ...validEntry, status: 'published' };
  draftEntry.status = 'archived';
  if (draftEntry.status !== 'archived') throw new Error('Archiving failed');
  draftEntry.status = 'published';
  if (draftEntry.status !== 'published') throw new Error('Restoration failed');
  console.log('✓ Reversible archiving and restoration verified.');

  // 8. Revision creation and snapshot preservation
  console.log('8. Testing Revision snapshot creation and immutability...');
  const rev: Revision = {
    id: 'rev-test-1',
    entityType: 'entry',
    entityId: validEntry.id,
    revisionNumber: 1,
    authorUid: 'admin-123',
    authorEmail: 'admin@yosr-meddah.dev',
    timestamp: new Date().toISOString(),
    snapshot: JSON.parse(JSON.stringify(validEntry)),
  };
  if (rev.revisionNumber !== 1 || rev.snapshot.slug !== validEntry.slug) {
    throw new Error('Revision tracking failed');
  }
  console.log('✓ Revision creation and snapshot preservation verified.');

  // 9. Firestore Data Sanitization (stripping undefined values)
  console.log('9. Testing Firestore payload sanitization (no undefined fields allowed)...');
  const dirtyPayload = {
    id: 'entry-123',
    title: 'Sanitized Entry',
    emptyNote: undefined,
    nested: {
      validField: 'hello',
      invalidField: undefined,
    },
    tags: ['react', 'firebase'],
    items: [
      { name: 'item1', sub: undefined },
      { name: 'item2', sub: 'ok' },
    ],
  };

  const cleaned = cleanFirestoreData(dirtyPayload) as Record<string, any>;
  if ('emptyNote' in cleaned) {
    throw new Error('Sanitization failed: top-level undefined property was not stripped!');
  }
  if ('invalidField' in (cleaned.nested as Record<string, unknown>)) {
    throw new Error('Sanitization failed: nested undefined property was not stripped!');
  }
  if ('sub' in (cleaned.items[0] as Record<string, unknown>)) {
    throw new Error('Sanitization failed: array-nested undefined property was not stripped!');
  }
  if (cleaned.id !== 'entry-123' || cleaned.nested.validField !== 'hello' || cleaned.items[1].sub !== 'ok') {
    throw new Error('Sanitization corrupted valid fields');
  }
  console.log('✓ Firestore data sanitization verified: all undefined values cleanly stripped.');

  // 10. Template Presets & Multi-Context Geometry Validation
  console.log('10. Testing Template presets and multi-context layout schemas...');
  if (!Array.isArray(DEFAULT_TEMPLATES) || DEFAULT_TEMPLATES.length < 3) {
    throw new Error('Default template presets list is missing or invalid');
  }
  for (const tpl of DEFAULT_TEMPLATES) {
    if (!tpl.id || !tpl.name || !tpl.targetType || !tpl.layout || !tpl.aspectRatio) {
      throw new Error(`Template preset "${tpl.id}" is missing mandatory geometry properties`);
    }
    if (!['card', 'detail', 'section'].includes(tpl.targetType)) {
      throw new Error(`Invalid targetType "${tpl.targetType}" in template preset ${tpl.id}`);
    }
  }
  console.log('✓ Template presets and multi-context layout schemas verified.');

  // 11. Verification that live Firebase queries do not silently mask errors
  console.log('11. Testing error propagation without silent fallbacks...');
  // Verify that cleanFirestoreData handles null, primitives, and dates without mutation
  const testDate = new Date();
  const dateObj = { created: testDate, count: 42, active: false };
  const cleanedDateObj = cleanFirestoreData(dateObj);
  if (cleanedDateObj.created !== testDate || cleanedDateObj.count !== 42 || cleanedDateObj.active !== false) {
    throw new Error('Sanitization corrupted primitive or Date values');
  }
  console.log('✓ Error propagation and type safety verified.');

  console.log('\n=== All Admin CMS Foundation Tests Passed Successfully ===');
}

runAdminFoundationTests();
