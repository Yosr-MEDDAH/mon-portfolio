import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONTENT_TYPES } from '../firebase/defaultContentTypes.ts';
import { validateContentType, validateEntry, normalizeEntryFields } from '../shared/validation.ts';

test('Gallery content type is defined as an independent default content type', () => {
  const galleryType = DEFAULT_CONTENT_TYPES.find((ct) => ct.id === 'gallery');
  assert.ok(galleryType, 'Gallery content type should exist in DEFAULT_CONTENT_TYPES');
  assert.equal(galleryType.slug, 'gallery');

  const validated = validateContentType(galleryType);
  assert.equal(validated.id, 'gallery');

  const fieldKeys = validated.fields.map((f) => f.key);
  assert.deepEqual(fieldKeys, ['title', 'description', 'images']);

  const titleField = validated.fields.find((f) => f.key === 'title');
  assert.equal(titleField?.required, false);
  assert.equal(titleField?.localized, true);

  const descField = validated.fields.find((f) => f.key === 'description');
  assert.equal(descField?.required, false);
  assert.equal(descField?.localized, true);

  const imagesField = validated.fields.find((f) => f.key === 'images');
  assert.equal(imagesField?.type, 'gallery');
  assert.equal(imagesField?.required, false);
  assert.equal(imagesField?.options?.max, 20);
});

test('Gallery entry validation supports 0 to 20 images, optional title/description/caption/alt, and draft/published states', () => {
  const galleryType = DEFAULT_CONTENT_TYPES.find((ct) => ct.id === 'gallery')!;

  // 1. Empty entry (0 images, no title, no description) as draft
  const emptyDraft = validateEntry(galleryType, {
    id: 'gallery-1',
    contentTypeId: 'gallery',
    slug: 'empty-gallery',
    status: 'draft',
    fields: {
      title: { en: '', fr: '', ar: '' },
      description: { en: '', fr: '', ar: '' },
      images: [],
    },
  });
  assert.equal(emptyDraft.status, 'draft');
  assert.deepEqual(emptyDraft.fields.images, []);

  // 2. Entry with 20 images and multilingual captions/alt text
  const twentyImages = Array.from({ length: 20 }, (_, i) => ({
    url: `/assets/photo-${i + 1}.jpg`,
    caption: { en: `Caption ${i + 1}`, fr: `Légende ${i + 1}`, ar: `تسمية ${i + 1}` },
    alt: { en: `Alt ${i + 1}`, fr: `Alt FR ${i + 1}`, ar: `نص بديل ${i + 1}` },
  }));

  const fullPublished = validateEntry(galleryType, {
    id: 'gallery-2',
    contentTypeId: 'gallery',
    slug: 'conference-photos',
    status: 'published',
    fields: {
      title: { en: 'Conference', fr: 'Conférence', ar: 'المؤتمر' },
      description: { en: 'Highlights', fr: 'Temps forts', ar: 'أبرز اللحظات' },
      images: twentyImages,
    },
  });
  assert.equal(fullPublished.status, 'published');
  assert.equal((fullPublished.fields.images as unknown[]).length, 20);

  // 3. Reject > 20 images
  const twentyOneImages = [
    ...twentyImages,
    { url: '/assets/photo-21.jpg' },
  ];
  assert.throws(() => {
    validateEntry(galleryType, {
      id: 'gallery-3',
      contentTypeId: 'gallery',
      slug: 'too-many',
      status: 'published',
      fields: { images: twentyOneImages },
    });
  }, /at most 20 images/i);
});

test('normalizeEntryFields strips invalid gallery items without URL', () => {
  const galleryType = DEFAULT_CONTENT_TYPES.find((ct) => ct.id === 'gallery')!;
  const normalized = normalizeEntryFields(galleryType, {
    images: [
      { url: '  /assets/valid.png  ', caption: { en: 'Valid' } },
      { url: '   ', caption: { en: 'Invalid' } },
      null,
    ],
  });
  assert.deepEqual(normalized.images, [
    { url: '/assets/valid.png', caption: { en: 'Valid' } },
  ]);
});
