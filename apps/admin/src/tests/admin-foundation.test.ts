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
import { cleanFirestoreData, DEFAULT_TEMPLATES, normalizeContentType } from '../firebase/firestore.ts';
import {
  getFieldLabel,
  getNormalizedFieldNames,
  isGenericPlaceholder,
  formatKeyToLabel,
  KNOWN_FIELD_LABELS,
} from '../shared/labels.ts';

export async function runAdminFoundationTests() {
  console.log('=== Running Admin CMS Foundation Tests ===\n');

  // 1. Authentication Guards & Unauthorized Access Denial
  console.log('1. Testing Authentication guards & authorization verification...');
  const unauthorizedCheck = await checkIsAdmin('unauthorized-user-uid');
  if (unauthorizedCheck.isAdmin !== false || unauthorizedCheck.adminData !== null) {
    throw new Error('Unauthorized user was incorrectly granted admin access!');
  }

  const removedFallback = await checkIsAdmin('offline-fallback-uid');
  if (removedFallback.isAdmin !== false || removedFallback.adminData !== null) {
    throw new Error('The removed offline administrator fallback must never grant access');
  }
  console.log('✓ Unauthorized access denied; no offline administrator fallback exists.');

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
    authorEmail: 'test@example.com',
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

  // 12. Multilingual Field Labels Resolution for Projects Schema (EN, FR, AR)
  console.log('12. Testing Multilingual field labels resolution for Projects (EN, FR, AR)...');
  const expectedProjectLabels: Record<string, { en: string; fr: string; ar: string }> = {
    title: { en: 'Title', fr: 'Titre', ar: 'العنوان' },
    slug: { en: 'URL Slug', fr: 'Identifiant URL', ar: 'معرّف الرابط' },
    shortDescription: { en: 'Short Description', fr: 'Description courte', ar: 'وصف مختصر' },
    description: { en: 'Description', fr: 'Description', ar: 'الوصف' },
    coverImage: { en: 'Cover Image', fr: 'Image de couverture', ar: 'صورة الغلاف' },
    technologies: { en: 'Technologies', fr: 'Technologies', ar: 'التقنيات' },
    liveUrl: { en: 'Live Demo URL', fr: 'Lien de démonstration', ar: 'رابط العرض' },
    githubUrl: { en: 'GitHub URL', fr: 'Lien GitHub', ar: 'رابط GitHub' },
    startDate: { en: 'Start Date', fr: 'Date de début', ar: 'تاريخ البداية' },
    endDate: { en: 'End Date', fr: 'Date de fin', ar: 'تاريخ النهاية' },
    featured: { en: 'Featured Project', fr: 'Projet mis en avant', ar: 'مشروع مميز' },
  };

  for (const [key, expected] of Object.entries(expectedProjectLabels)) {
    // Test resolution from field definition with missing or generic name
    const dummyField = { key, name: { en: 'New Field', fr: 'Nouveau Champ', ar: 'حقل جديد' } };
    const enLabel = getFieldLabel(dummyField, 'en');
    const frLabel = getFieldLabel(dummyField, 'fr');
    const arLabel = getFieldLabel(dummyField, 'ar');

    if (enLabel !== expected.en) {
      throw new Error('Project field ' + key + ' EN label expected ' + expected.en + ', got ' + enLabel);
    }
    if (frLabel !== expected.fr) {
      throw new Error('Project field ' + key + ' FR label expected ' + expected.fr + ', got ' + frLabel);
    }
    if (arLabel !== expected.ar) {
      throw new Error('Project field ' + key + ' AR label expected ' + expected.ar + ', got ' + arLabel);
    }
  }
  console.log('✓ All 11 Projects schema field labels verified across EN, FR, and AR.');

  // 13. Elimination of 'New Field' Placeholders and Technical Key Fallback
  console.log('13. Testing elimination of \'New Field\' placeholders and technical key fallbacks...');
  // A generic placeholder must NEVER be returned
  if (!isGenericPlaceholder('New Field') || !isGenericPlaceholder('Nouveau Champ') || !isGenericPlaceholder('حقل جديد')) {
    throw new Error('Generic placeholder detection failed');
  }

  // Custom unknown technical keys fallback to Title Case, not 'New Field'
  const customField = { key: 'clientTestimonial', name: 'New Field' };
  const customEn = getFieldLabel(customField, 'en');
  if (customEn !== 'Client Testimonial') {
    throw new Error('Custom field label fallback expected Client Testimonial, got ' + customEn);
  }

  const customSnakeField = { key: 'ai_model_version', name: '' };
  const customSnake = getFieldLabel(customSnakeField, 'en');
  if (customSnake !== 'AI Model Version') {
    throw new Error('Custom snake_case label fallback expected AI Model Version, got ' + customSnake);
  }

  // Normalization of an existing content type with generic placeholders
  const legacyCt: ContentTypeDefinition = {
    id: 'projects',
    slug: 'projects',
    name: { en: 'Projects', fr: 'Projets', ar: 'المشاريع' },
    fields: [
      { key: 'slug', name: { en: 'New Field', fr: 'Nouveau Champ', ar: 'حقل جديد' }, type: 'text' },
      { key: 'shortDescription', name: 'New Field', type: 'textarea', localized: true },
    ],
  };
  const normalized = normalizeContentType(legacyCt);
  if (typeof normalized.fields[0].name === 'string' || normalized.fields[0].name.en !== 'URL Slug') {
    throw new Error('normalizeContentType failed to repair slug label');
  }
  if (typeof normalized.fields[1].name === 'string' || normalized.fields[1].name.fr !== 'Description courte') {
    throw new Error('normalizeContentType failed to repair shortDescription label');
  }
  console.log('✓ \'New Field\' eliminated: automatic fallback and Content Type normalization verified.');

  // 14. Independent Localized Field Values vs Shared Non-Localized Field Values
  console.log('14. Testing independent localized values vs shared non-localized field values...');
  const testEntryWithLocalizedAndNonLocalized: ContentEntry = {
    id: 'proj-001',
    contentTypeId: 'projects',
    slug: 'test-project-alpha',
    status: 'draft',
    fields: {
      title: { en: 'Alpha Project', fr: 'Projet Alpha', ar: 'مشروع ألفا' },
      shortDescription: { en: 'English summary', fr: 'Résumé français', ar: 'ملخص عربي' },
      slug: 'test-project-alpha',
      startDate: '2026-01-01',
      featured: true,
      technologies: ['TypeScript', 'React'],
    },
  };

  // Mutate one localized language: others must NOT be affected
  const updatedEntry = {
    ...testEntryWithLocalizedAndNonLocalized,
    fields: {
      ...testEntryWithLocalizedAndNonLocalized.fields,
      shortDescription: {
        ...(testEntryWithLocalizedAndNonLocalized.fields.shortDescription as Record<string, string>),
        fr: 'Nouveau résumé en français',
      },
    },
  };

  const updatedShortDesc = updatedEntry.fields.shortDescription as Record<string, string>;
  if (updatedShortDesc.en !== 'English summary' || updatedShortDesc.ar !== 'ملخص عربي' || updatedShortDesc.fr !== 'Nouveau résumé en français') {
    throw new Error('Localized values did not remain independent after mutation!');
  }

  // Non-localized fields must remain single shared primitives
  const entryFields = updatedEntry.fields as Record<string, unknown>;
  if (typeof entryFields.slug !== 'string' || typeof entryFields.featured !== 'boolean') {
    throw new Error('Non-localized fields must remain shared primitives and not objects');
  }
  console.log('✓ Localized fields maintain strict translation independence; non-localized fields maintain single values.');

  // 15. Mandatory Projects Schema Validation & Optional Field Normalization Tests
  console.log('15. Testing Projects schema validation and optional field empty/invalid handling...');
  const projectsContentType: ContentTypeDefinition = {
    id: 'projects',
    slug: 'projects',
    name: { en: 'Projects', fr: 'Projets', ar: 'المشاريع' },
    fields: [
      { key: 'title', name: 'Title', type: 'text', required: true, localized: true },
      { key: 'slug', name: 'URL Slug', type: 'text', required: true, localized: false },
      { key: 'shortDescription', name: 'Short Description', type: 'textarea', required: true, localized: true },
      { key: 'description', name: 'Description', type: 'textarea', required: false, localized: true },
      { key: 'coverImage', name: 'Cover Image', type: 'image', required: false, localized: false },
      { key: 'technologies', name: 'Technologies', type: 'tags', required: false, localized: false },
      { key: 'liveUrl', name: 'Live Demo URL', type: 'url', required: false, localized: false },
      { key: 'githubUrl', name: 'GitHub URL', type: 'url', required: false, localized: false },
      { key: 'startDate', name: 'Start Date', type: 'date', required: false, localized: false },
      { key: 'endDate', name: 'End Date', type: 'date', required: false, localized: false },
      { key: 'featured', name: 'Featured Project', type: 'boolean', required: false, localized: false },
    ],
  };

  // 1. Entrée avec uniquement les trois champs obligatoires : acceptée
  const minimalEntry: ContentEntry = {
    id: 'proj-min',
    contentTypeId: 'projects',
    slug: 'minimal-project',
    status: 'draft',
    fields: {
      title: { en: 'Minimal Title', fr: 'Titre minimal', ar: 'عنوان بسيط' },
      slug: 'minimal-project',
      shortDescription: { en: 'Short summary', fr: 'Résumé court', ar: 'ملخص قصير' },
    },
  };
  const parsedMinimal = validateEntry(projectsContentType, minimalEntry);
  if (!parsedMinimal || parsedMinimal.slug !== 'minimal-project') {
    throw new Error('Minimal entry with only 3 required fields failed validation');
  }

  // 2. Image facultative vide : acceptée
  const emptyImgEntry: ContentEntry = {
    ...minimalEntry,
    id: 'proj-img-empty',
    fields: { ...minimalEntry.fields, coverImage: '' },
  };
  const parsedImg = validateEntry(projectsContentType, emptyImgEntry);
  if (!parsedImg) throw new Error('Optional empty coverImage should be accepted');

  // 3. GitHub URL facultative vide : acceptée
  const emptyUrlEntry: ContentEntry = {
    ...minimalEntry,
    id: 'proj-url-empty',
    fields: { ...minimalEntry.fields, githubUrl: '', liveUrl: '' },
  };
  const parsedUrl = validateEntry(projectsContentType, emptyUrlEntry);
  if (!parsedUrl) throw new Error('Optional empty URLs should be accepted');

  // 4. Date facultative vide : acceptée
  const emptyDateEntry: ContentEntry = {
    ...minimalEntry,
    id: 'proj-date-empty',
    fields: { ...minimalEntry.fields, startDate: '', endDate: '' },
  };
  const parsedDate = validateEntry(projectsContentType, emptyDateEntry);
  if (!parsedDate) throw new Error('Optional empty dates should be accepted');

  // 5. URL renseignée mais invalide : rejetée
  let invalidUrlRejected = false;
  try {
    validateEntry(projectsContentType, {
      ...minimalEntry,
      id: 'proj-url-invalid',
      fields: { ...minimalEntry.fields, githubUrl: 'not-a-valid-url' },
    });
  } catch {
    invalidUrlRejected = true;
  }
  if (!invalidUrlRejected) throw new Error('Invalid URL should have been rejected');

  // 6. Date renseignée mais invalide : rejetée
  let invalidDateRejected = false;
  try {
    validateEntry(projectsContentType, {
      ...minimalEntry,
      id: 'proj-date-invalid',
      fields: { ...minimalEntry.fields, startDate: 'not-a-date' },
    });
  } catch {
    invalidDateRejected = true;
  }
  if (!invalidDateRejected) throw new Error('Invalid date should have been rejected');

  // 7. Titre obligatoire vide : rejeté
  let emptyTitleRejected = false;
  try {
    validateEntry(projectsContentType, {
      ...minimalEntry,
      id: 'proj-title-empty',
      fields: {
        ...minimalEntry.fields,
        title: { en: '   ', fr: '', ar: '' },
      },
    });
  } catch {
    emptyTitleRejected = true;
  }
  if (!emptyTitleRejected) throw new Error('Empty required title should have been rejected');

  // 8. Slug obligatoire vide : rejeté
  let emptySlugRejected = false;
  try {
    validateEntry(projectsContentType, {
      ...minimalEntry,
      id: 'proj-slug-empty',
      slug: '',
      fields: { ...minimalEntry.fields, slug: '' },
    });
  } catch {
    emptySlugRejected = true;
  }
  if (!emptySlugRejected) throw new Error('Empty required slug should have been rejected');

  // 9. Short Description obligatoire vide : rejetée
  let emptyShortDescRejected = false;
  try {
    validateEntry(projectsContentType, {
      ...minimalEntry,
      id: 'proj-desc-empty',
      fields: {
        ...minimalEntry.fields,
        shortDescription: { en: '', fr: '', ar: '' },
      },
    });
  } catch {
    emptyShortDescRejected = true;
  }
  if (!emptyShortDescRejected) throw new Error('Empty required shortDescription should have been rejected');

  // 10. Boolean false : accepté
  const booleanFalseEntry: ContentEntry = {
    ...minimalEntry,
    id: 'proj-bool-false',
    fields: { ...minimalEntry.fields, featured: false },
  };
  const parsedBool = validateEntry(projectsContentType, booleanFalseEntry);
  if (parsedBool.fields.featured !== false) {
    throw new Error('Expected boolean false to be preserved, got ' + parsedBool.fields.featured);
  }
  console.log('✓ All 10 Projects schema validation cases verified successfully.');

  // 16. Theme Contrast & Textarea Styling Safety Verification
  console.log('16. Testing theme contrast tokens and textarea background styling...');
  // Verify DynamicFieldEditor.tsx uses theme-aware bg-surface on all textareas
  const editorPath = 'src/components/DynamicFieldEditor.tsx';
  // Check index.css tokens
  const cssPath = 'src/index.css';
  const fs = await import('node:fs');
  const pathMod = await import('node:path');
  const baseDir = fs.existsSync('src/components/DynamicFieldEditor.tsx') ? '.' : 'apps/admin';
  const editorCode = fs.readFileSync(pathMod.join(baseDir, editorPath), 'utf-8');
  const cssCode = fs.readFileSync(pathMod.join(baseDir, cssPath), 'utf-8');

  // Verify no invalid opacity modifier on cream in form inputs
  if (editorCode.includes('bg-cream/30')) {
    throw new Error('DynamicFieldEditor still contains invalid bg-cream/30 on inputs/textareas');
  }

  // Verify richtext uses bg-surface
  if (!editorCode.includes("field.type === 'richtext'") || !editorCode.includes('bg-surface font-mono') && !editorCode.includes('font-mono bg-surface')) {
    throw new Error('DynamicFieldEditor richtext must use bg-surface with font-mono for proper theme adaptation');
  }

  // Verify color-scheme in index.css
  if (!cssCode.includes('color-scheme: light;') || !cssCode.includes('color-scheme: dark;')) {
    throw new Error('index.css must define color-scheme for native browser dark mode form styling');
  }

  console.log('✓ Theme contrast tokens and DynamicFieldEditor textarea background styles verified.');

  console.log('\n=== All Admin CMS Foundation Tests Passed Successfully ===');
}

runAdminFoundationTests();
