import type { SupportedLocale } from './types.ts';

export const translations: Record<string, Partial<Record<SupportedLocale, string>>> = {
  // Navigation
  'nav.home': {
    en: 'Home',
    fr: 'Accueil',
    ar: 'الرئيسية',
  },
  'nav.projects': {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  'nav.research': {
    en: 'Research',
    fr: 'Recherche',
    ar: 'البحث العلمي',
  },
  'nav.skipToContent': {
    en: 'Skip to main content',
    fr: 'Aller au contenu principal',
    ar: 'الانتقال إلى المحتوى الرئيسي',
  },

  // UI elements
  'ui.learnMore': {
    en: 'Learn more',
    fr: 'En savoir plus',
    ar: 'المزيد',
  },
  'ui.backTo': {
    en: 'Back to {name}',
    fr: 'Retour à {name}',
    ar: 'العودة إلى {name}',
  },
  'ui.publishedOn': {
    en: 'Published on:',
    fr: 'Publié le :',
    ar: 'تاريخ النشر:',
  },
  'ui.emptyCollection': {
    en: 'No items available',
    fr: 'Aucun élément disponible',
    ar: 'لا توجد عناصر متاحة',
  },
  'ui.emptyCollectionDesc': {
    en: 'This collection currently has no published items.',
    fr: 'Cette collection ne contient aucun élément publié pour le moment.',
    ar: 'لا يحتوي هذا القسم على أي عناصر منشورة حالياً.',
  },
  'ui.language': {
    en: 'Language',
    fr: 'Langue',
    ar: 'اللغة',
  },
  'ui.collections': {
    en: 'Content Collections',
    fr: 'Collections de contenu',
    ar: 'أقسام المحتوى',
  },
  'ui.itemsCount': {
    en: '{count} published item(s)',
    fr: '{count} élément(s) publié(s)',
    ar: '{count} عنصر/عناصر منشورة',
  },
  'ui.footerCopyright': {
    en: '© 2026 Yosr Meddah — All rights reserved.',
    fr: '© 2026 Yosr Meddah — Tous droits réservés.',
    ar: '© 2026 يسر مداح — جميع الحقوق محفوظة.',
  },

  // Hero section
  'hero.name': {
    en: 'Yosr Meddah',
    fr: 'Yosr Meddah',
    ar: 'يسر مداح',
  },
  'hero.tagline': {
    en: 'Software Engineering Student — Accessibility · Eco-design · Distributed Systems',
    fr: 'Ingénieure informatique en formation — Accessibilité · Éco-conception · Systèmes distribués',
    ar: 'مهندسة برمجيات في طور التكوين — إمكانية الوصول والتصميم الصديق للبيئة والنظم الموزعة',
  },
  'hero.bio': {
    en: 'Passionate about frontend development, digital accessibility (WCAG), and sustainable web design. I build inclusive, resilient solutions combining high technical performance with environmental and social responsibility.',
    fr: "Passionnée par le développement frontend, l'accessibilité numérique (WCAG) et l'éco-conception web. Je conçois des solutions inclusives et résilientes alliant haute performance technique et responsabilité environnementale.",
    ar: 'شغوفة بتطوير الواجهات الأمامية وإمكانية الوصول الرقمي (WCAG) والتصميم المستدام للويب. أصمم حلولاً شاملة ومرنة تجمع بين الأداء التقني العالي والمسؤولية البيئية والاجتماعية.',
  },
};
