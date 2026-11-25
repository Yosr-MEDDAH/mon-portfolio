import test from 'node:test';
import assert from 'node:assert/strict';
import { transformGalleryEntries, resolveGalleryText } from '../data/gallery.ts';
import { withBase } from '../utils/url.ts';
import { t } from '../i18n/utils.ts';

test('getCmsGallery filters out empty entries and preserves image order & captions', () => {
  const entries = [
    {
      id: 'g-empty',
      slug: 'empty-gallery',
      fields: {
        title: { en: 'Empty', fr: 'Vide', ar: 'فارغ' },
        images: [],
      },
    },
    {
      id: 'g-valid',
      slug: 'valid-gallery',
      fields: {
        title: { en: 'Architecture', fr: 'Architecture', ar: 'العمارة' },
        description: { en: 'Shots', fr: 'Photos', ar: 'صور' },
        images: [
          {
            url: '/assets/img1.jpg',
            caption: { en: 'First', fr: 'Premier', ar: 'الأول' },
            alt: { en: 'Alt 1', fr: 'Alt 1 FR', ar: 'بديل 1' },
          },
          { url: '   ' }, // invalid empty url should be filtered out
          {
            url: 'https://example.com/img2.png',
            caption: 'Shared caption',
          },
        ],
      },
    },
  ];

  const result = transformGalleryEntries(entries);
  assert.equal(result.length, 1);
  assert.equal(result[0].slug, 'valid-gallery');
  assert.equal(result[0].images.length, 2);
  assert.equal(resolveGalleryText(result[0].title, 'ar'), 'العمارة');
  assert.equal(resolveGalleryText(result[0].images[0].caption, 'fr'), 'Premier');
  assert.equal(resolveGalleryText(result[0].images[1].caption, 'ar'), 'Shared caption');
});

test('withBase handles /mon-portfolio/ base path and external URLs for gallery images', () => {
  assert.equal(withBase('/assets/photo.jpg'), '/mon-portfolio/assets/photo.jpg');
  assert.equal(withBase('https://cdn.example.com/photo.jpg'), 'https://cdn.example.com/photo.jpg');
});

test('Gallery translations exist for EN, FR, and AR', () => {
  assert.equal(t('nav.gallery', 'en'), 'Gallery');
  assert.equal(t('nav.gallery', 'fr'), 'Galerie');
  assert.equal(t('nav.gallery', 'ar'), 'المعرض');
  assert.ok(t('gallery.empty', 'ar').length > 0);
  assert.ok(t('gallery.close', 'fr').length > 0);
});
