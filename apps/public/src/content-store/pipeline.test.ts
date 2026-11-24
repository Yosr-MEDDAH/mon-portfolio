import { buildRegistryFromExport, getCollectionBySlug } from './index.ts';
import {
  exportCmsData,
  resolveCredentials,
  validateExportPayload,
  sanitizeContentType,
  sanitizeEntry,
  sanitizeTemplate,
  sanitizeSiteSettings,
  sanitizeFieldOptions,
  sanitizeDefaultVisible,
} from '../../scripts/export-cms-content.mjs';
import { existsSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPipelineTests() {
  console.log('=== Running Static Publication Pipeline & CMS Integration Tests ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`✓ ${message}`);
    passed++;
  }

  // --- 1. Credential Resolution & Thorough Validation (including GOOGLE_APPLICATION_CREDENTIALS) ---
  console.log('1. Testing credential resolution and deep secret validation...');
  const oldSecret = process.env.FIREBASE_SERVICE_ACCOUNT;
  const oldGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    assert(
      resolveCredentials() === undefined,
      'resolveCredentials returns undefined when no secrets provided'
    );

    // Test valid service account credentials
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      project_id: 'test-spark',
      client_email: 'firebase-adminsdk@test-spark.iam.gserviceaccount.com',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC\n-----END PRIVATE KEY-----\n',
    });
    const parsed = resolveCredentials();
    assert(
      parsed !== null && parsed?.project_id === 'test-spark',
      'resolveCredentials successfully validates complete service account'
    );

    // Test missing client_email
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      project_id: 'test-spark',
      private_key: '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----',
    });
    let clientEmailErr = false;
    try {
      resolveCredentials();
    } catch (e: any) {
      clientEmailErr = e.message.includes('client_email');
    }
    assert(clientEmailErr, 'Credentials rejected when client_email is missing');

    // Test missing private_key
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      project_id: 'test-spark',
      client_email: 'service@spark.iam.gserviceaccount.com',
    });
    let privateKeyErr = false;
    try {
      resolveCredentials();
    } catch (e: any) {
      privateKeyErr = e.message.includes('private_key');
    }
    assert(privateKeyErr, 'Credentials rejected when private_key is missing');

    // Test invalid format: must throw without leaking secret in error message
    const secretPayload = 'super-secret-token-value-12345';
    process.env.FIREBASE_SERVICE_ACCOUNT = `invalid-json-{${secretPayload}}`;
    let threw = false;
    let errorMsg = '';
    try {
      resolveCredentials();
    } catch (err: any) {
      threw = true;
      errorMsg = err.message;
    }
    assert(threw, 'Invalid credentials format throws error immediately');
    assert(
      !errorMsg.includes(secretPayload),
      'Error message strictly never leaks raw secret credentials'
    );

    // Test GOOGLE_APPLICATION_CREDENTIALS: non-existent file path throws safely
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    const fakePath = 'C:\\non-existent-path\\service-account-key.json';
    process.env.GOOGLE_APPLICATION_CREDENTIALS = fakePath;
    let gacNonExistentErr = false;
    try {
      resolveCredentials();
    } catch (e: any) {
      gacNonExistentErr = e.message.includes('does not exist');
    }
    assert(gacNonExistentErr, 'GOOGLE_APPLICATION_CREDENTIALS throws when file does not exist on disk');

    // Test GOOGLE_APPLICATION_CREDENTIALS: existing file path returns null (applicationDefault)
    const tempCredFile = resolve(__dirname, 'temp-valid-cred.json');
    writeFileSync(tempCredFile, '{}', 'utf-8');
    try {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredFile;
      const gacResolved = resolveCredentials();
      assert(
        gacResolved === null,
        'GOOGLE_APPLICATION_CREDENTIALS with existing file resolves to null for applicationDefault()'
      );
    } finally {
      if (existsSync(tempCredFile)) rmSync(tempCredFile);
    }
  } finally {
    if (oldSecret) process.env.FIREBASE_SERVICE_ACCOUNT = oldSecret;
    else delete process.env.FIREBASE_SERVICE_ACCOUNT;
    if (oldGac) process.env.GOOGLE_APPLICATION_CREDENTIALS = oldGac;
    else delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  // --- 2. sanitizeDefaultVisible Context Filtering ---
  console.log('\n2. Testing sanitizeDefaultVisible context filtering...');

  assert(sanitizeDefaultVisible(true) === true, 'defaultVisible boolean true preserved');
  assert(sanitizeDefaultVisible(false) === false, 'defaultVisible boolean false preserved');

  const dirtyCtxVis = {
    card: true,
    detail: false,
    section: true,
    forbiddenCtx: true, // Must be stripped
    invalidValue: 'string-instead-of-bool', // Must be stripped
  };
  const cleanedCtxVis = sanitizeDefaultVisible(dirtyCtxVis);
  assert(
    typeof cleanedCtxVis === 'object' &&
      cleanedCtxVis.card === true &&
      cleanedCtxVis.detail === false &&
      cleanedCtxVis.section === true,
    'Allowed contexts card, detail, section preserved with boolean values'
  );
  assert(
    !('forbiddenCtx' in cleanedCtxVis) && !('invalidValue' in cleanedCtxVis),
    'Unauthorized contexts and non-boolean values stripped from defaultVisible'
  );

  assert(
    sanitizeDefaultVisible({ unauthorized: true }) === true,
    'defaultVisible object with no valid contexts defaults to true'
  );
  assert(sanitizeDefaultVisible(null) === true, 'defaultVisible null defaults to true');

  // --- 3. Deep Sanitization of Schemas, Visibility & Options ---
  console.log('\n3. Testing deep sanitization of schemas, options, visibility & settings...');

  const dirtyOptions = {
    choices: [{ value: 'v1', label: { en: 'L1', fr: 'L1-fr', ar: 'L1-ar' } }],
    min: 1,
    max: 10,
    targetCollection: 'projects',
    acceptedTypes: ['image/png'],
    _internalBackendHook: 'rm -rf /',
    adminToken: 'secret',
  };
  const sanitizedOpts = sanitizeFieldOptions(dirtyOptions);
  assert(
    sanitizedOpts !== undefined &&
      sanitizedOpts.min === 1 &&
      sanitizedOpts.choices[0].label.ar === 'L1-ar',
    'Field options preserve valid choices with translations'
  );
  assert(
    !('_internalBackendHook' in sanitizedOpts!) && !('adminToken' in sanitizedOpts!),
    'Field options strip internal metadata and unapproved fields'
  );

  const dirtyContentType = {
    name: { en: 'Projects', fr: 'Projets', ar: 'المشاريع' },
    description: 'Active schema',
    slug: 'projects',
    fields: [
      {
        key: 'title',
        type: 'text',
        required: true,
        localized: true,
        defaultVisible: { card: true, detail: true, unauthContext: false },
      },
      { key: 'customTags', type: 'tags', options: dirtyOptions },
    ],
    defaultVisibility: {
      title: true,
      customTags: false,
      _unapprovedPrivateField: false,
    },
    contextDefaultVisibility: {
      card: { title: true, _unapprovedPrivateField: false },
      injectedDangerousContext: { title: true },
    },
    authorUid: 'admin-123',
  };
  const sanitizedCT = sanitizeContentType('projects', dirtyContentType);
  assert(
    sanitizedCT.defaultVisibility.title === true && sanitizedCT.defaultVisibility.customTags === false,
    'Valid field visibility settings preserved'
  );
  assert(
    !('_unapprovedPrivateField' in sanitizedCT.defaultVisibility),
    'Visibility settings for non-schema fields stripped'
  );
  assert(
    !('injectedDangerousContext' in sanitizedCT.contextDefaultVisibility),
    'Invalid rendering contexts stripped from visibility map'
  );
  assert(
    typeof sanitizedCT.fields[0].defaultVisible === 'object' &&
      !('unauthContext' in (sanitizedCT.fields[0].defaultVisible as any)),
    'Field-level defaultVisible cleaned of unauthorized contexts'
  );

  // Template deep sanitization
  const dirtyTemplate = {
    name: 'Custom Template',
    targetType: 'card',
    layout: 'grid',
    visibilitySettings: {
      visibility: { title: true, _secretField: false },
      contextVisibility: { card: { title: true } },
      _injectedAdminFlag: true,
    },
    authorUid: 'admin-99',
  };
  const sanitizedTmpl = sanitizeTemplate('tmpl-1', dirtyTemplate);
  assert(
    sanitizedTmpl.visibilitySettings.visibility.title === true,
    'Template visibility settings preserved'
  );
  assert(!('_injectedAdminFlag' in sanitizedTmpl.visibilitySettings), 'Template internal flags stripped');
  assert(!('authorUid' in sanitizedTmpl), 'Template authorUid stripped');

  // Site Settings deep sanitization
  const dirtySettings = {
    siteTitle: { en: 'Site', fr: 'Site', ar: 'الموقع' },
    defaultLocale: 'en',
    supportedLocales: ['en', 'fr', 'ar', 'invalid-locale'],
    maintenanceMode: true,
    secretApiKey: 'xyz',
    seoDefaults: {
      metaTitle: { en: 'SEO', fr: 'SEO', ar: 'سيو' },
      internalMeta: 'bad',
    },
  };
  const sanitizedSettings = sanitizeSiteSettings(dirtySettings);
  assert(
    sanitizedSettings !== null && sanitizedSettings.siteTitle.ar === 'الموقع',
    'Site settings translations preserved'
  );
  assert(!('maintenanceMode' in sanitizedSettings!) && !('secretApiKey' in sanitizedSettings!), 'Site settings secrets stripped');
  assert(!('internalMeta' in (sanitizedSettings?.seoDefaults || {})), 'SEO internal metadata stripped');

  // --- 4. Missing Schema Handling & Field Value Preservation ---
  console.log('\n4. Testing missing schema handling & preservation of field values...');

  const entryWithMissingSchema = sanitizeEntry(
    'e-orphan',
    {
      contentTypeId: 'non-existent-schema',
      slug: 'orphan',
      fields: { title: 'Orphan', secretData: 'Leak' },
    },
    undefined
  );
  assert(
    entryWithMissingSchema === null,
    'Entry with missing schema safely rejected/skipped; NEVER allows all fields by default'
  );

  const entryWithHiddenField = sanitizeEntry(
    'e-valid',
    {
      contentTypeId: 'projects',
      slug: 'valid-entry',
      fields: {
        title: { en: 'Project A', fr: 'Projet A', ar: 'مشروع أ' },
        customTags: ['tag1', 'tag2'],
        _privateLeak: 'Do not leak',
      },
      visibilityOverrides: {
        customTags: false,
      },
      contextVisibilityOverrides: {
        card: { customTags: false },
      },
    },
    sanitizedCT
  );
  assert(entryWithHiddenField !== null, 'Valid entry sanitized successfully');
  assert(
    Array.isArray(entryWithHiddenField?.fields.customTags) &&
      entryWithHiddenField?.fields.customTags.length === 2,
    'Field value preserved in entry.fields even when visibility is false (underlying data not removed)'
  );
  assert(
    entryWithHiddenField?.visibilityOverrides.customTags === false,
    'Visibility override false preserved'
  );
  assert(
    entryWithHiddenField?.contextVisibilityOverrides.card.customTags === false,
    'Context visibility override false preserved'
  );
  assert(
    !('_privateLeak' in entryWithHiddenField!.fields),
    'Unapproved field not in schema stripped from entry'
  );

  // --- 5. Media Publication Conditions (Strict isAwaitingPublication === false) ---
  console.log('\n5. Testing strict media publication conditions (isAwaitingPublication === false)...');

  const mockDb = {
    collection: (name: string) => {
      if (name === 'contentTypes') {
        return {
          get: async () => ({
            docs: [
              { id: 'projects', data: () => dirtyContentType },
              { id: 'archived-type', data: () => ({ name: 'Archived', isArchived: true }) },
            ],
          }),
        };
      }

      if (name === 'entries') {
        return {
          where: (field: string, op: string, val: any) => {
            if (field === 'status' && op === '==' && val === 'published') {
              return {
                get: async () => ({
                  docs: [
                    {
                      id: 'entry-published-1',
                      data: () => ({
                        contentTypeId: 'projects',
                        slug: 'published-item',
                        status: 'published',
                        fields: {
                          title: { en: 'Project', fr: 'Projet', ar: 'مشروع' },
                          customTags: ['A11y'],
                          _unapproved: 'Drop me',
                        },
                      }),
                    },
                    {
                      id: 'entry-schemaless',
                      data: () => ({
                        contentTypeId: 'missing-type',
                        slug: 'schemaless',
                        status: 'published',
                        fields: { title: 'Should Be Dropped' },
                      }),
                    },
                    {
                      id: 'entry-archived',
                      data: () => ({
                        contentTypeId: 'projects',
                        slug: 'archived',
                        status: 'published',
                        isArchived: true,
                        fields: { title: 'Archived' },
                      }),
                    },
                  ],
                }),
              };
            }
            throw new Error(`Unexpected query: ${field}`);
          },
        };
      }

      if (name === 'templates') {
        return {
          get: async () => ({
            docs: [{ id: 'tmpl-1', data: () => dirtyTemplate }],
          }),
        };
      }

      if (name === 'media') {
        return {
          get: async () => ({
            docs: [
              {
                id: 'media-valid-published',
                data: () => ({
                  title: 'Approved Media',
                  fileName: 'hero.png',
                  externalUrl: 'https://cdn.example.com/hero.png',
                  isAwaitingPublication: false, // Explicitly false -> MUST BE INCLUDED
                }),
              },
              {
                id: 'media-awaiting-true',
                data: () => ({
                  title: 'Awaiting Media',
                  externalUrl: 'https://cdn.example.com/draft.png',
                  isAwaitingPublication: true, // true -> MUST BE EXCLUDED
                }),
              },
              {
                id: 'media-awaiting-undefined',
                data: () => ({
                  title: 'Undefined Publication Media',
                  externalUrl: 'https://cdn.example.com/undefined.png',
                  // isAwaitingPublication undefined -> MUST BE EXCLUDED
                }),
              },
              {
                id: 'media-awaiting-null',
                data: () => ({
                  title: 'Null Publication Media',
                  externalUrl: 'https://cdn.example.com/null.png',
                  isAwaitingPublication: null, // null -> MUST BE EXCLUDED
                }),
              },
              {
                id: 'media-empty-url',
                data: () => ({
                  title: 'Empty URL Media',
                  externalUrl: '', // empty url -> MUST BE EXCLUDED
                  isAwaitingPublication: false,
                }),
              },
              {
                id: 'media-whitespace-url',
                data: () => ({
                  title: 'Whitespace URL Media',
                  externalUrl: '   ', // whitespace url -> MUST BE EXCLUDED
                  isAwaitingPublication: false,
                }),
              },
              {
                id: 'media-archived',
                data: () => ({
                  title: 'Archived Media',
                  externalUrl: 'https://cdn.example.com/archived.png',
                  isArchived: true, // archived -> MUST BE EXCLUDED
                  isAwaitingPublication: false,
                }),
              },
            ],
          }),
        };
      }

      if (name === 'siteSettings') {
        return {
          doc: (_id: string) => ({
            get: async () => ({
              exists: true,
              data: () => dirtySettings,
            }),
          }),
        };
      }

      if (['adminUsers', 'revisions', 'activityLogs'].includes(name)) {
        throw new Error(`SECURITY VIOLATION: Export script queried private collection '${name}'!` );
      }

      throw new Error(`Unknown collection: ${name}`);
    },
  };

  const testOutputPath = resolve(__dirname, 'test-export-output.json');
  try {
    const exported = await exportCmsData({ db: mockDb as any, outputPath: testOutputPath });

    assert(existsSync(testOutputPath), 'Exported JSON exists on disk');
    assert(exported.contentTypes.length === 1, 'Only active content types exported');
    assert(exported.entries.length === 1, 'Only valid published entry with existing schema exported');
    assert(exported.entries[0].id === 'entry-published-1', 'Correct published entry preserved');
    assert(
      !('_unapproved' in exported.entries[0].fields),
      'Unapproved field stripped from entry'
    );

    // Strict media publication check
    assert(
      exported.media.length === 1,
      'Media strictly filtered: exactly 1 media item with isAwaitingPublication === false and valid externalUrl exported'
    );
    assert(
      exported.media[0].id === 'media-valid-published',
      'media-valid-published is the only exported media item'
    );

    // Private collections check
    assert(!('adminUsers' in exported), 'adminUsers completely omitted');
    assert(!('revisions' in exported), 'revisions completely omitted');
    assert(!('activityLogs' in exported), 'activityLogs completely omitted');
  } finally {
    if (existsSync(testOutputPath)) {
      rmSync(testOutputPath);
    }
  }

  // --- 6. Atomic Output & Fail-Fast Rollback on Failure ---
  console.log('\n6. Testing atomic output replacement and fail-fast rollback on failure...');

  const sentinelData = JSON.stringify({ version: 'sentinel', safe: true });
  writeFileSync(testOutputPath, sentinelData, 'utf-8');

  const failingDb = {
    collection: (name: string) => {
      if (name === 'contentTypes') {
        return { get: async () => ({ docs: [] }) };
      }
      if (name === 'entries') {
        return { where: () => ({ get: async () => ({ docs: [] }) }) };
      }
      if (name === 'templates') {
        return {
          get: async () => {
            throw new Error('NETWORK_TIMEOUT: Firestore query failed');
          },
        };
      }
      throw new Error(`Collection ${name}`);
    },
  };

  let failFastTriggered = false;
  try {
    await exportCmsData({ db: failingDb as any, outputPath: testOutputPath });
  } catch (err: any) {
    failFastTriggered = err.message.includes('NETWORK_TIMEOUT');
  }
  assert(failFastTriggered, 'Fatal error thrown on read failure');

  const postFailureContent = readFileSync(testOutputPath, 'utf-8');
  assert(
    postFailureContent === sentinelData,
    'Existing valid JSON preserved intact after fatal failure (fail-fast atomic rollback)'
  );

  rmSync(testOutputPath);

  // --- 7. Astro Content Store Integration (Never Sample Data Fallback) ---
  console.log('\n7. Testing Astro content store integration & zero sample data fallback...');

  const emptyRegistry = buildRegistryFromExport({
    contentTypes: [],
    entries: [],
    templates: [],
    media: [],
    siteSettings: null,
  } as any);

  const projectsCol = getCollectionBySlug('projects', emptyRegistry);
  assert(projectsCol !== undefined, 'getCollectionBySlug(projects) safely resolves');
  assert(
    projectsCol.entries.length === 0,
    'Zero sample entries returned; strictly zero fallback on empty CMS export'
  );


  // --- 8. validateExportPayload: required localized field edge cases ---
  console.log('\n8. Testing validateExportPayload required localized field edge cases...');

  // Test: whitespace-only translations in all locales -> must REJECT
  let whitespaceRejected = false;
  try {
    validateExportPayload({
      exportedAt: new Date().toISOString(),
      contentTypes: [{ id: 'p', name: 'P', slug: 'p', fields: [{ key: 'title', type: 'text', required: true, localized: true }] }],
      entries: [{ id: 'e1', contentTypeId: 'p', slug: 'e1', status: 'published', fields: { title: { en: '   ', fr: '  ', ar: '' } } }],
      templates: [],
      media: [],
    });
  } catch { whitespaceRejected = true; }
  assert(whitespaceRejected, 'Required localized field with whitespace-only translations must be rejected');

  // Test: numeric value in a locale -> must REJECT
  let numericRejected = false;
  try {
    validateExportPayload({
      exportedAt: new Date().toISOString(),
      contentTypes: [{ id: 'p', name: 'P', slug: 'p', fields: [{ key: 'title', type: 'text', required: true, localized: true }] }],
      entries: [{ id: 'e1', contentTypeId: 'p', slug: 'e1', status: 'published', fields: { title: { en: 42 as any, fr: '', ar: '' } } }],
      templates: [],
      media: [],
    });
  } catch { numericRejected = true; }
  assert(numericRejected, 'Required localized field with numeric locale value must be rejected');

  // Test: valid non-empty string in one locale -> must PASS
  let validLocalePass = true;
  try {
    validateExportPayload({
      exportedAt: new Date().toISOString(),
      contentTypes: [{ id: 'p', name: 'P', slug: 'p', fields: [{ key: 'title', type: 'text', required: true, localized: true }] }],
      entries: [{ id: 'e1', contentTypeId: 'p', slug: 'e1', status: 'published', fields: { title: { en: 'Valid Title', fr: '', ar: '' } } }],
      templates: [],
      media: [],
    });
  } catch { validLocalePass = false; }
  assert(validLocalePass, 'Required localized field with valid English translation must pass');

  console.log(`\n=== All ${passed}/${total} Pipeline & Security Tests Passed Successfully ===`);
}

runPipelineTests().catch((err) => {
  console.error('\n❌ Pipeline test failure:', err);
  process.exit(1);
});
