import type { SupportedLocale } from './types.ts';

export const translations: Record<string, Partial<Record<SupportedLocale, string>>> = {
  // Navigation
  'nav.home': {
    en: 'Home',
    fr: 'Accueil',
    ar: 'الرئيسية',
  },
  'nav.skills': {
    en: 'Skills',
    fr: 'Compétences',
    ar: 'المهارات',
  },
  'nav.experience': {
    en: 'Experience',
    fr: 'Expérience',
    ar: 'الخبرة',
  },
  'nav.projects': {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  'nav.presentations': {
    en: 'Presentations',
    fr: 'Présentations',
    ar: 'العروض',
  },
  'nav.artworks': {
    en: 'Artworks',
    fr: 'Artworks',
    ar: 'الأعمال الفنية',
  },
  'nav.contact': {
    en: 'Contact',
    fr: 'Contact',
    ar: 'التواصل',
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

  // Hero section
  'hero.name': {
    en: 'Yosr Meddah',
    fr: 'Yosr Meddah',
    ar: 'يسر مداح',
  },
  'hero.label': {
    en: 'Portfolio · Open to internship',
    fr: 'Portfolio · Disponible pour un stage',
    ar: 'معرض أعمال · متاح للتدريب',
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

  // Sections & Headings
  'section.skills': {
    en: 'Skills',
    fr: 'Compétences',
    ar: 'المهارات',
  },
  'heading.skills': {
    en: 'What I work with',
    fr: 'Ce que je maîtrise',
    ar: 'ما أتقنه',
  },
  'section.experience': {
    en: 'Experience',
    fr: 'Expérience',
    ar: 'الخبرة',
  },
  'heading.experience': {
    en: 'Professional Experience',
    fr: 'Expérience professionnelle',
    ar: 'الخبرة المهنية',
  },
  'section.projects': {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  'heading.projects': {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  'section.presentations': {
    en: 'Presentations',
    fr: 'Présentations',
    ar: 'العروض التقديمية',
  },
  'heading.presentations': {
    en: 'Presentations & Talks',
    fr: 'Présentations & Talks',
    ar: 'العروض والمحاضرات',
  },
  'section.artworks': {
    en: 'Artworks',
    fr: 'Artworks',
    ar: 'الأعمال الفنية',
  },
  'heading.artworks': {
    en: 'Artworks',
    fr: 'Créations',
    ar: 'الأعمال الفنية',
  },
  'section.education': {
    en: 'Education',
    fr: 'Formation',
    ar: 'التعليم',
  },
  'heading.education': {
    en: 'Academic Background',
    fr: 'Parcours académique',
    ar: 'المسار الأكاديمي',
  },
  'section.contact': {
    en: 'Contact',
    fr: 'Contact',
    ar: 'التواصل',
  },
  'heading.contact': {
    en: "Let's work together",
    fr: 'Travaillons ensemble',
    ar: 'لنعمل معاً',
  },
  'contact.sub': {
    en: 'Available for internship. Feel free to reach out.',
    fr: "Disponible pour un stage. N'hésitez pas à me contacter.",
    ar: 'متاح للتدريب. لا تتردد في التواصل.',
  },

  // Buttons & Links
  'btn.cv': {
    en: 'Download CV',
    fr: 'Télécharger le CV',
    ar: 'تحميل السيرة الذاتية',
  },
  'btn.contact': {
    en: 'Contact me',
    fr: 'Me contacter',
    ar: 'تواصل معي',
  },
  'link.github': {
    en: 'GitHub',
    fr: 'GitHub',
    ar: 'GitHub',
  },
  'link.linkedin': {
    en: 'LinkedIn',
    fr: 'LinkedIn',
    ar: 'LinkedIn',
  },
  'footer.made': {
    en: 'Made with care',
    fr: 'Fait avec soin',
    ar: 'صُنع باهتمام',
  },
  'back': {
    en: 'Back',
    fr: 'Retour',
    ar: 'رجوع',
  },

  // See all links
  'see.skills': {
    en: 'See all skills',
    fr: 'Voir toutes les compétences',
    ar: 'عرض كل المهارات',
  },
  'see.experience': {
    en: 'See all experience',
    fr: "Voir toute l'expérience",
    ar: 'عرض كل الخبرات',
  },
  'see.projects': {
    en: 'See all projects',
    fr: 'Voir tous les projets',
    ar: 'عرض كل المشاريع',
  },
  'see.presentations': {
    en: 'See all presentations',
    fr: 'Voir toutes les présentations',
    ar: 'عرض كل العروض',
  },
  'see.artworks': {
    en: 'See all artworks',
    fr: 'Voir toutes les créations',
    ar: 'عرض كل الأعمال الفنية',
  },

  // Page titles
  'page.skills': {
    en: 'Technical Skills',
    fr: 'Compétences techniques',
    ar: 'المهارات التقنية',
  },
  'page.experience': {
    en: 'Professional Experience',
    fr: 'Expérience professionnelle',
    ar: 'الخبرة المهنية',
  },
  'page.projects': {
    en: 'Projects',
    fr: 'Projets',
    ar: 'المشاريع',
  },
  'page.presentations': {
    en: 'Presentations & Talks',
    fr: 'Présentations & Talks',
    ar: 'العروض والمحاضرات',
  },
  'page.artworks': {
    en: 'Artworks & Creations',
    fr: 'Créations & Artworks',
    ar: 'الأعمال الفنية',
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
};
