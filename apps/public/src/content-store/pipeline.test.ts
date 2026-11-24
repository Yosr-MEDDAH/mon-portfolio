import { buildRegistryFromExport, getCollectionBySlug } from './index.ts';
import {
  exportCmsData,
  resolveCredentials,
  validateExportPayload,
} from '../../scripts/export-cms-content.mjs';
import { existsSync, rmSync } from 'node:fs';
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

  // --- 1. Credential Resolution & Safety ---
  console.log('1. Testing credential resolution and secret safety...');
  const oldSecret = process.env.FIREBASE_SERVICE_ACCOUNT;
  const oldGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    assert(
      resolveCredentials() === undefined,
      'resolveCredentials returns undefined when no secrets provided'
    );

    // Test JSON parsing
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      project_id: 'test-spark',
      client_email: 'test@spark.iam.gserviceaccount.com',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASC\n-----END PRIVATE KEY-----\n',
    });
    const parsed = resolveCredentials();
    assert(
      parsed !== null && parsed?.project_id === 'test-spark',
      'resolveCredentials successfully parses raw JSON service account'
    );

    // Test base64 parsing
    const b64 = Buffer.from(
      JSON.stringify({ project_id: 'test-base64', client_email: 'b64@spark.com' })
    ).toString('base64');
    process.env.FIREBASE_SERVICE_ACCOUNT = b64;
    const parsedB64 = resolveCredentials();
    assert(
      parsedB64 !== null && parsedB64?.project_id === 'test-base64',
      'resolveCredentials successfully parses base64-encoded service account'
    );
  } finally {
    if (oldSecret) process.env.FIREBASE_SERVICE_ACCOUNT = oldSecret;
    else delete process.env.FIREBASE_SERVICE_ACCOUNT;
    if (oldGac) process.env.GOOGLE_APPLICATION_CREDENTIALS = oldGac;
    else delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  // --- 2. Firestore Export Sanitization, Exclusions & Fatal Reads ---
  console.log(
    '\n2. Testing export sanitization, exclusions & fatal reads on Firestore errors...'
  );

  const mockDb = {
    collection: (name: string) => {
      if (name === 'contentTypes') {
        return {
          get: async () => ({
            docs: [
              {
                id: 'projects',
                data: () => ({
                  name: { en: 'Projects', fr: 'Projets', ar: 'المشاريع' },
                  description: 'Active project schema',
                  slug: 'projects',
                  fields: [{ key: 'title', type: 'text' }],
                  isArchived: false,
                  authorUid: 'admin-secret-uid', // Internal metadata to strip
                  internalNote: 'Top secret', // Internal metadata to strip
                }),
              },
              {
                id: 'deprecated-type',
                data: () => ({
                  name: 'Deprecated',
                  isArchived: true, // Should be excluded
                }),
              },
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
                          title: {
                            en: 'Live Project',
                            fr: 'Projet En Ligne',
                            ar: 'مشروع منشور',
                          },
                        },
                        visibilityOverrides: { secretField: false },
                        publishedAt: '2026-11-24T00:00:00Z',
                        authorUid: 'user-admin-123', // Internal metadata to strip
                        authorEmail: 'admin@portfolio.internal', // Internal metadata to strip
                        revisionsCount: 5, // Internal metadata to strip
                      }),
                    },
                    {
                      id: 'entry-archived-tampered',
                      data: () => ({
                        contentTypeId: 'projects',
                        slug: 'archived-item',
                        status: 'published', // Claimed published but archived flag set
                        isArchived: true,
                        fields: { title: 'Archived' },
                      }),
                    },
                  ],
                }),
              };
            }
            throw new Error(`Unexpected query on entries: ${field} ${op} ${val}`);
          },
        };
      }

      if (name === 'templates') {
        return {
          get: async () => ({
            docs: [
              {
                id: 'projects-card',
                data: () => ({
                  name: 'Projects Card',
                  targetType: 'card',
                  layout: 'grid',
                  aspectRatio: '16/9',
                  authorUid: 'admin-secret',
                }),
              },
            ],
          }),
        };
      }

      if (name === 'media') {
        return {
          get: async () => ({
            docs: [
              {
                id: 'media-1',
                data: () => ({
                  fileName: 'logo.png',
                  mimeType: 'image/png',
                  externalUrl: 'https://storage.example.com/logo.png',
                  internalBucketPath: 'gs://private/bucket/logo.png',
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
              data: () => ({
                siteTitle: { en: 'Portfolio', fr: 'Portfolio', ar: 'المعرض' },
                secretApiKey: 'super-secret', // Internal field to strip
              }),
            }),
          }),
        };
      }

      // If any forbidden collection is queried, fail immediately
      if (['adminUsers', 'revisions', 'activityLogs'].includes(name)) {
        throw new Error(
          `SECURITY VIOLATION: Export script queried private collection '${name}'!`
        );
      }

      throw new Error(`Unknown collection: ${name}`);
    },
  };

  const testOutputPath = resolve(__dirname, 'test-export-output.json');
  try {
    const exported = await exportCmsData({ db: mockDb as any, outputPath: testOutputPath });

    assert(existsSync(testOutputPath), 'Exported JSON file exists on disk');
    assert(
      exported.contentTypes.length === 1,
      'Archived content types excluded (only 1 active exported)'
    );
    assert(exported.contentTypes[0].id === 'projects', 'Active content type projects preserved');
    assert(
      !('authorUid' in exported.contentTypes[0]) && !('internalNote' in exported.contentTypes[0]),
      'Internal metadata stripped from exported content types'
    );
    assert(
      exported.entries.length === 1,
      'Tampered/archived entry excluded; exactly 1 published entry exported'
    );
    assert(exported.entries[0].id === 'entry-published-1', 'Correct published entry preserved');
    assert(
      exported.entries[0].fields.title.ar === 'مشروع منشور',
      'Arabic translation preserved'
    );
    assert(
      exported.entries[0].visibilityOverrides.secretField === false,
      'Visibility override preserved'
    );
    assert(
      !('authorUid' in exported.entries[0]) && !('authorEmail' in exported.entries[0]),
      'Internal metadata stripped from exported entries'
    );
    assert(exported.templates.length === 1, 'Templates exported');
    assert(!('authorUid' in exported.templates[0]), 'Internal metadata stripped from templates');
    assert(exported.media.length === 1, 'Media metadata exported');
    assert(
      !('internalBucketPath' in exported.media[0]),
      'Internal bucket paths stripped from media'
    );
    assert(exported.siteSettings !== null, 'Site settings exported');
    assert(
      !('secretApiKey' in (exported.siteSettings || {})),
      'Secret settings stripped from site settings'
    );
    assert(!('adminUsers' in exported), 'adminUsers collection completely absent');
    assert(!('revisions' in exported), 'revisions collection completely absent');
    assert(!('activityLogs' in exported), 'activityLogs collection completely absent');
  } finally {
    if (existsSync(testOutputPath)) {
      rmSync(testOutputPath);
    }
  }

  // --- Fatal Read Failures Verification ---
  console.log('\nTesting that Firestore read errors are fatal (not silently swallowed)...');
  const failingDb = {
    collection: (name: string) => {
      if (name === 'contentTypes') {
        return {
          get: async () => ({ docs: [] }),
        };
      }
      if (name === 'entries') {
        return {
          where: () => ({ get: async () => ({ docs: [] }) }),
        };
      }
      if (name === 'templates') {
        return {
          get: async () => {
            throw new Error('PERMISSION_DENIED: Templates read failed');
          },
        };
      }
      throw new Error(`Collection ${name}`);
    },
  };

  let fatalErrorCaught = false;
  try {
    await exportCmsData({ db: failingDb as any, outputPath: testOutputPath });
  } catch (err: any) {
    fatalErrorCaught = true;
    assert(
      err.message.includes('PERMISSION_DENIED'),
      'Fatal error correctly thrown on Firestore template read failure'
    );
  }
  assert(fatalErrorCaught, 'Firestore read failure aborted export fatally without writing data');

  // --- 3. Export Validation Verification ---
  console.log('\n3. Testing export payload validation before write...');

  // Invalid payload (missing id in content type)
  let valError1 = false;
  try {
    validateExportPayload({
      exportedAt: new Date().toISOString(),
      contentTypes: [{ name: 'No ID' }],
      entries: [],
      templates: [],
      media: [],
    });
  } catch {
    valError1 = true;
  }
  assert(valError1, 'Validation rejects content type without id');

  // Invalid payload (entry with status !== 'published')
  let valError2 = false;
  try {
    validateExportPayload({
      exportedAt: new Date().toISOString(),
      contentTypes: [],
      entries: [{ id: '1', contentTypeId: 'p', slug: 's', status: 'draft', fields: {} }],
      templates: [],
      media: [],
    });
  } catch {
    valError2 = true;
  }
  assert(valError2, 'Validation rejects entry with status draft');

  // Valid payload passes
  const validPayload = {
    exportedAt: new Date().toISOString(),
    contentTypes: [
      {
        id: 'p',
        name: { en: 'P', fr: 'P', ar: 'ب' },
        slug: 'p',
        fields: [],
      },
    ],
    entries: [
      {
        id: 'e1',
        contentTypeId: 'p',
        slug: 'e1',
        status: 'published',
        fields: { title: { en: 'T', fr: 'T', ar: 'ت' } },
      },
    ],
    templates: [],
    media: [],
    siteSettings: null,
  };
  assert(validateExportPayload(validPayload) === true, 'Valid payload passes validation');

  // --- 4. Astro Content Store Integration (Never Sample Data Fallback) ---
  console.log('\n4. Testing Astro Content Store integration & strict sample data exclusion...');

  const liveExportPayload = {
    exportedAt: '2026-11-24T00:00:00Z',
    contentTypes: [
      {
        id: 'projects',
        name: { en: 'Live CMS Projects', fr: 'Projets CMS', ar: 'مشاريع حيّة' },
        slug: 'projects',
        fields: [{ key: 'title', type: 'text' as const }],
      },
    ],
    entries: [
      {
        id: 'live-cms-project-1',
        contentTypeId: 'projects',
        slug: 'live-cms-project-1',
        status: 'published' as const,
        fields: {
          title: { en: 'Actual CMS Entry', fr: 'Entrée CMS', ar: 'مدخل حي' },
        },
      },
    ],
    templates: [],
    media: [],
    siteSettings: null,
  };

  const registry = buildRegistryFromExport(liveExportPayload as any);
  assert(Boolean(registry.projects), 'Projects collection registered from export');
  assert(registry.projects.entries.length === 1, 'Contains exactly 1 published entry');
  assert(registry.projects.entries[0].id === 'live-cms-project-1', 'Uses CMS entry from export');

  // Verify that an entry with status === 'draft' is NEVER included even if somehow present in payload
  const payloadWithDraft = {
    contentTypes: [{ id: 'projects', name: 'Projects', slug: 'projects', fields: [] }],
    entries: [
      {
        id: 'draft-1',
        contentTypeId: 'projects',
        slug: 'draft-1',
        status: 'draft',
        fields: {},
      },
    ],
  };
  const registryDraft = buildRegistryFromExport(payloadWithDraft as any);
  assert(
    registryDraft.projects.entries.length === 0,
    'Draft entry filtered out; entries array is empty'
  );

  // --- 5. Empty Export Resilience ---
  console.log('\n5. Testing empty export resilience (0 content types / 0 entries)...');

  const emptyPayload = {
    exportedAt: '2026-11-24T00:00:00Z',
    contentTypes: [],
    entries: [],
    templates: [],
    media: [],
    siteSettings: null,
  };

  const emptyRegistry = buildRegistryFromExport(emptyPayload as any);
  assert(
    Object.keys(emptyRegistry).length === 0,
    'Empty export produces 0 registered collections in registry'
  );

  // getCollectionBySlug('projects', emptyRegistry) should safely provide fallback collection structure with EMPTY entries []
  const emptyProjectsCol = getCollectionBySlug('projects', emptyRegistry);
  assert(
    emptyProjectsCol !== undefined,
    'getCollectionBySlug(projects) safely resolves without throwing'
  );
  assert(Array.isArray(emptyProjectsCol.entries), 'projects collection entries is an array');
  // CRITICAL REQUIREMENT: "Never use sample data as a production fallback"
  // When empty, it must have 0 entries, NOT fall back to sampleProjectEntries!
  assert(
    emptyProjectsCol.entries.length === 0,
    'Strictly zero entries — never falls back to sample data!'
  );

  console.log(`\n=== All ${passed}/${total} Publication Pipeline Tests Passed Successfully ===`);
}

runPipelineTests().catch((err) => {
  console.error('\n❌ Publication pipeline test suite failed:', err);
  process.exit(1);
});
