import type { ContentTypeDefinition } from '../types.ts';

export const ResearchContentType: ContentTypeDefinition = {
  id: 'research',
  name: {
    en: 'Research',
    fr: 'Recherche',
    ar: 'البحث العلمي',
  },
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
    {
      key: 'title',
      name: {
        en: 'Title',
        fr: 'Titre',
        ar: 'العنوان',
      },
      type: 'text',
      required: true,
      localized: true,
      defaultVisible: true,
    },
    {
      key: 'description',
      name: {
        en: 'Description',
        fr: 'Description',
        ar: 'الوصف',
      },
      type: 'textarea',
      required: true,
      localized: true,
      defaultVisible: true,
    },
    {
      key: 'date',
      name: {
        en: 'Publication Date',
        fr: 'Date de publication',
        ar: 'تاريخ النشر',
      },
      type: 'date',
      required: true,
      localized: false,
      defaultVisible: true,
    },
    {
      key: 'coverImage',
      name: {
        en: 'Cover Image',
        fr: 'Image de couverture',
        ar: 'صورة الغلاف',
      },
      type: 'image',
      required: true,
      localized: false,
      defaultVisible: true,
    },
    {
      key: 'tags',
      name: {
        en: 'Tags',
        fr: 'Mots-clés',
        ar: 'الوسوم',
      },
      type: 'tags',
      required: true,
      localized: false,
      defaultVisible: true,
    },
    {
      key: 'externalLink',
      name: {
        en: 'External Link',
        fr: 'Lien externe',
        ar: 'الرابط الخارجي',
      },
      type: 'url',
      required: true,
      localized: false,
      defaultVisible: true,
    },
  ],
};
