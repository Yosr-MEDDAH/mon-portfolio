import type { ContentTypeDefinition } from '../types.ts';

export const ProjectsContentType: ContentTypeDefinition = {
  id: 'projects',
  name: {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  description: {
    en: 'Software engineering, digital accessibility, AI systems, and sustainable web development projects',
    fr: "Projets d'ingénierie logicielle, accessibilité numérique, systèmes IA et développement web durable",
    ar: 'مشاريع هندسة البرمجيات وإمكانية الوصول الرقمي وأنظمة الذكاء الاصطناعي والتطوير المستدام',
  },
  slug: 'projects',
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
        en: 'Date',
        fr: 'Date',
        ar: 'التاريخ',
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
      required: false,
      localized: false,
      defaultVisible: true,
    },
  ],
};
