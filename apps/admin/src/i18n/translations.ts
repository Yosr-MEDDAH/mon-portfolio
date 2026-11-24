import type { SupportedLocale } from '../shared/types.ts';

export const adminTranslations: Record<string, Record<SupportedLocale, string>> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', fr: 'Tableau de bord', ar: 'لوحة التحكم' },
  'nav.profile': { en: 'Profile & Homepage', fr: 'Profil & Accueil', ar: 'الملف التعريفي والصفحة الرئيسية' },
  'nav.contentTypes': { en: 'Content Types', fr: 'Types de contenu', ar: 'أنواع المحتوى' },
  'nav.entries': { en: 'Content Entries', fr: 'Entrées de contenu', ar: 'عناصر المحتوى' },
  'nav.media': { en: 'Media Library', fr: 'Médiathèque', ar: 'مكتبة الوسائط' },
  'nav.pages': { en: 'Pages & Templates', fr: 'Pages et modèles', ar: 'الصفحات والقوالب' },
  'nav.revisions': { en: 'Revision History', fr: 'Historique des révisions', ar: 'سجل التعديلات' },
  'nav.settings': { en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },
  'nav.logout': { en: 'Sign Out', fr: 'Déconnexion', ar: 'تسجيل الخروج' },

  // Header & Status
  'header.portal': { en: 'Portfolio CMS Admin', fr: 'Admin CMS Portfolio', ar: 'إدارة الموقع' },
  'header.role': { en: 'Administrator', fr: 'Administrateur', ar: 'مسؤول النظام' },
  'header.themeToggle': { en: 'Toggle theme', fr: 'Basculer le thème', ar: 'تبديل المظهر' },
  'header.lightMode': { en: 'Switch to light mode', fr: 'Activer le mode clair', ar: 'تفعيل الوضع النهاري' },
  'header.darkMode': { en: 'Switch to dark mode', fr: 'Activer le mode sombre', ar: 'تفعيل الوضع الليلي' },
  'status.connected': { en: 'Firestore Spark Connected', fr: 'Connecté Firestore Spark', ar: 'متصل بـ Firestore' },
  'status.mock': { en: 'Simulated Local Storage', fr: 'Stockage local simulé', ar: 'وضع التخزين المحلي التجريبي' },

  // Auth & Login
  'login.title': { en: 'Admin CMS Login', fr: 'Connexion Admin CMS', ar: 'تسجيل دخول المسؤول' },
  'login.subtitle': { en: 'Authenticate with your authorized administrator credentials', fr: 'Authentifiez-vous avec vos identifiants administrateur autorisés', ar: 'سجّل الدخول بحساب المسؤول المصرح له' },
  'login.email': { en: 'Email address', fr: 'Adresse email', ar: 'البريد الإلكتروني' },
  'login.password': { en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور' },
  'login.submit': { en: 'Sign In', fr: 'Se connecter', ar: 'دخول' },
  'login.loading': { en: 'Verifying credentials...', fr: 'Vérification...', ar: 'جاري التحقق...' },
  'login.unauthorized': { en: 'Access Denied: Your account is not authorized as an administrator.', fr: 'Accès refusé : Votre compte n\'est pas autorisé comme administrateur.', ar: 'تم رفض الوصول: حسابك غير مصرح له كمسؤول.' },

  // Common actions
  'action.create': { en: 'Create New', fr: 'Créer', ar: 'إنشاء جديد' },
  'action.edit': { en: 'Edit', fr: 'Modifier', ar: 'تعديل' },
  'action.save': { en: 'Save Changes', fr: 'Enregistrer', ar: 'حفظ التغييرات' },
  'action.delete': { en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
  'action.archive': { en: 'Archive', fr: 'Archiver', ar: 'أرشفة' },
  'action.restore': { en: 'Restore', fr: 'Restaurer', ar: 'استعادة' },
  'action.preview': { en: 'Preview', fr: 'Aperçu', ar: 'معاينة' },
  'action.cancel': { en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
  'action.back': { en: 'Back', fr: 'Retour', ar: 'رجوع' },
  'action.search': { en: 'Search...', fr: 'Rechercher...', ar: 'بحث...' },

  // Visibility
  'vis.title': { en: 'Contextual Visibility Controls', fr: 'Contrôles de visibilité contextuelle', ar: 'إعدادات الظهور السياقي' },
  'vis.explanation': { en: 'Visibility settings hide fields without deleting or altering their underlying data.', fr: 'Les paramètres de visibilité masquent les champs sans altérer leurs données sous-jacentes.', ar: 'إعدادات الظهور تخفي الحقول دون حذف بياناتها أو تعديلها.' },
  'vis.card': { en: 'Card Context', fr: 'Contexte Carte', ar: 'سياق البطاقة' },
  'vis.detail': { en: 'Detail Page Context', fr: 'Contexte Détail', ar: 'سياق صفحة التفاصيل' },
  'vis.section': { en: 'Section Context', fr: 'Contexte Section', ar: 'سياق القسم' },
  'vis.visible': { en: 'Visible', fr: 'Visible', ar: 'ظاهر' },
  'vis.hidden': { en: 'Hidden', fr: 'Masqué', ar: 'مخفي' },
  'vis.inherit': { en: 'Inherit Default', fr: 'Par défaut', ar: 'افتراضي' },
  'vis.priorityHint': { en: 'Resolution Priority: Entry override > Template setting > Content-type default', fr: 'Priorité : Surcharge entrée > Réglage modèle > Défaut type de contenu', ar: 'أولوية الحل: استثناء العنصر > إعداد القالب > إعداد نوع المحتوى' },
};

export function getAdminText(key: string, locale: SupportedLocale = 'en'): string {
  const item = adminTranslations[key];
  if (!item) return key;
  return item[locale] || item['en'] || key;
}
