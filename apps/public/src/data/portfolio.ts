import { getCollectionBySlug } from '../content-store/index.ts';
import publishedData from '../content-store/data/published-content.json';
import type { SupportedLocale } from '../i18n/types.ts';

export interface LocalizedString {
  fr?: string;
  en?: string;
  ar?: string;
  [key: string]: string | undefined;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Experience {
  slug?: string;
  role: LocalizedString;
  company: string;
  period: string;
  location: string;
  description: LocalizedString;
  tags?: string[];
  github?: string;
  images?: string[];
}

export interface AssociativeExperience {
  role: LocalizedString;
  company: string;
  period: string;
  description: LocalizedString;
  tags?: string[];
}

export interface ProjectItem {
  slug?: string;
  title: LocalizedString;
  period?: string;
  context?: string | LocalizedString;
  description: LocalizedString;
  tags?: string[];
  github?: string;
  demo?: string;
  image?: string;
  featured?: boolean;
  pdf?: string;
  notebook?: string;
}

export interface PresentationItem {
  slug?: string;
  title: LocalizedString;
  period?: string;
  context?: string | LocalizedString;
  description: LocalizedString;
  tags?: string[];
  youtube?: string;
}

export interface ArtworkItem {
  slug?: string;
  title: string;
  image: string;
  youtube?: string;
  behance?: string;
}

export interface EducationItem {
  degree: LocalizedString;
  school: string;
  period: string;
  location: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  date: string;
}

export interface AwardItem {
  prize: LocalizedString;
  event: LocalizedString;
  org: string;
  date: string;
}

export interface LanguageItem {
  lang: string;
  level: string;
}

export const PORTFOLIO_DATA = {
  // ── INFOS PERSONNELLES ──────────────────────────────────
  name: "Yosr Meddah",
  email: "yosrmeddah@outlook.com",
  phone: "+216 50 231 459",
  location: "Tunis / Bizerte, Tunisie",
  github: "https://github.com/Yosr-MEDDAH",
  linkedin: "https://www.linkedin.com/in/yosr-meddah/",
  behance: "https://www.behance.net/yosr-meddah",
  youtube: "https://www.youtube.com/@YosrMeddah",
  cv_url: "cv.pdf",
  avatar: "assets/yosr.png",
  contactLabels: {
    heading: { fr: "Restons en contact", en: "Get in Touch", ar: "تواصل معي" },
    subheading: { fr: "", en: "", ar: "" },
  },

  // ── TITRE ──────────────────────────────────────────────
  title: {
    fr: "Ingénieure informatique en formation — Accessibilité · Éco-conception",
    en: "Software Engineering Student — Accessibility · Eco-design",
    ar: "مهندسة برمجيات في طور التكوين — إمكانية الوصول والتصميم الصديق للبيئة",
  },

  // ── À PROPOS ───────────────────────────────────────────
  about: {
    fr: `Ingénieure informatique en 2ᵉ année à l'ISAMM, passionnée par le développement frontend, l'accessibilité numérique (WCAG) et l'éco-conception web. Je conçois des solutions inclusives qui allient performance technique et responsabilité environnementale. Créatrice de contenu pédagogique sur YouTube autour de ces thématiques, avec un engagement fort pour la responsabilité numérique et le design durable.`,
    en: `2nd-year software engineering student at ISAMM, passionate about frontend development, digital accessibility (WCAG) and eco-design. I build inclusive solutions combining technical performance with environmental responsibility. Also a YouTube educator on these topics.`,
    ar: `طالبة هندسة برمجيات في السنة الثانية بـ ISAMM، شغوفة بالتطوير الواجهة الأمامية وإمكانية الوصول الرقمي (WCAG) والتصميم البيئي. أصمم حلولاً شاملة تجمع بين الأداء التقني والمسؤولية البيئية. صانعة محتوى تعليمي على يوتيوب.`,
  },

  // ── COMPÉTENCES ────────────────────────────────────────
  skills: [] as SkillCategory[],

  // ── EXPÉRIENCES PROFESSIONNELLES ───────────────────────
  experiences: [] as Experience[],

  // ── VIE ASSOCIATIVE ────────────────────────────────────
  associative: [
    {
      role: { fr: "Designer Pôle Projet & Chargée de Mission RSE", en: "Project Designer & CSR Officer", ar: "مصممة مشاريع ومسؤولة المسؤولية الاجتماعية" },
      company: "Orenda Junior-Entreprise (ISAMM)",
      period: "Oct. 2025 – Fév. 2026",
      description: {
        fr: "Contribution à plusieurs projets en tant que Designer au sein du département Projet. Participation au séminaire JOBS et sélection comme Chargée de Mission RSE — expérience ayant confirmé l'intérêt pour la responsabilité numérique et le design durable.",
        en: "Contributed to multiple projects as Designer in the Project department. Participated in JOBS seminar and selected as CSR Officer — reinforced interest in digital responsibility and sustainable design.",
        ar: "مساهمة في مشاريع متعددة كمصممة. مشاركة في ندوة JOBS واختيار كمسؤولة المسؤولية الاجتماعية.",
      },
      tags: ["Design", "RSE", "Gestion de projet"],
    },
  ] as AssociativeExperience[],

  // ── PROJETS ────────────────────────────────────────────
  // All projects are managed exclusively via the CMS (Firestore)
  projects: [] as ProjectItem[],

  // ── PRÉSENTATIONS ──────────────────────────────────────
  presentations: [] as PresentationItem[],

  // ── ARTWORKS ───────────────────────────────────────────
  artworks: [] as ArtworkItem[],

  // ── FORMATION ──────────────────────────────────────────
  education: [] as EducationItem[],

  // ── CERTIFICATIONS ─────────────────────────────────────
  certifications: [
    { title: "AWS Academy Cloud Foundations", issuer: "AWS Academy", date: "Mai 2025" },
    { title: "JavaScript Algorithms and Data Structures (Legacy)", issuer: "FreeCodeCamp", date: "Mai 2025" },
    { title: "CCNA: Introduction to Networks", issuer: "Cisco Networking Academy", date: "Avr. 2025" },
    { title: "CCNA: Switching, Routing and Wireless Essentials", issuer: "Cisco Networking Academy", date: "Déc. 2024" },
    { title: "NDG Linux Unhatched", issuer: "Cisco", date: "Mai 2022" },
  ] as CertificationItem[],

  // ── DISTINCTIONS ───────────────────────────────────────
  awards: [
    {
      prize: { fr: "3ᵉ Prix", en: "3rd Prize", ar: "الجائزة الثالثة" },
      event: { fr: "6ᵉ Concours tuniso-chinois de calligraphie au stylo dur", en: "6th Tunisian-Chinese Hard Pen Calligraphy Contest", ar: "المسابقة التونسية الصينية السادسة للخط بالقلم" },
      org: "Institut Confucius — Université de Carthage",
      date: "Fév. 2026",
    },
    {
      prize: { fr: "2ᵉ Prix (3ᵉ au classement général)", en: "2nd Prize (3rd overall)", ar: "الجائزة الثانية (الثالثة في الترتيب العام)" },
      event: { fr: "5ᵉ Concours de calligraphie chinoise", en: "5th Chinese Calligraphy Contest", ar: "المسابقة الصينية الخامسة للخط" },
      org: "Institut Confucius — Université de Carthage",
      date: "Fév. 2025",
    },
  ] as AwardItem[],

  // ── LANGUES ────────────────────────────────────────────
  languages: [
    { lang: "العربية", level: "C1 — Maternelle" },
    { lang: "Français", level: "B2" },
    { lang: "English", level: "B1" },
    { lang: "中文", level: "Notions — Calligraphie" },
  ] as LanguageItem[],
};

/* ── Devicon & Visual Maps ────────────────────────────── */
export const DEVICON_MAP: Record<string, string> = {
  'React': 'react-original', 'React 18': 'react-original',
  'Angular': 'angularjs-plain', 'TypeScript': 'typescript-plain',
  'JavaScript': 'javascript-plain', 'Python': 'python-plain',
  'Java': 'java-plain', 'PHP': 'php-plain', 'Node.js': 'nodejs-plain',
  'NodeJS': 'nodejs-plain', 'Express.js': 'express-original',
  'Express js': 'express-original', 'MongoDB': 'mongodb-plain',
  'PostgreSQL': 'postgresql-plain', 'MySQL': 'mysql-plain',
  'Docker': 'docker-plain', 'Git': 'git-plain', 'Flutter': 'flutter-plain',
  'Firebase': 'firebase-plain', 'Figma': 'figma-plain',
  'HTML/CSS': 'html5-plain', 'Tailwind CSS': 'tailwindcss-plain',
  'FastAPI': 'fastapi-plain', 'Laravel': 'laravel-plain',
  'Unity': 'unity-original', 'Three.js': 'threejs-original',
  'Arduino': 'arduino-plain', 'C++': 'cplusplus-plain', 'C#': 'csharp-plain',
  'Azure': 'azure-plain', 'Spring Boot': 'spring-plain',
  'Flask': 'flask-original', 'Symfony': 'symfony-original',
  'Android Studio': 'android-plain', 'NumPy': 'numpy-plain',
  'Pandas': 'pandas-original', 'SQL': 'mysql-plain',
  'Playwright': 'playwright-plain', 'Cypress': 'cypressio-plain',
  'AWS': 'amazonwebservices-original', 'Material UI': 'materialdesign-plain',
};

export const TECH_GRAD: Record<string, string> = {
  'React': '#61DAFB,#1a9cc4', 'React 18': '#61DAFB,#1a9cc4',
  'Angular': '#DD0031,#7b001a', 'TypeScript': '#3178C6,#1a4a8a',
  'JavaScript': '#F7DF1E,#c4a800', 'Python': '#3776AB,#FFD43B',
  'Java': '#ED8B00,#5382A1', 'Flutter': '#54C5F8,#0175C2',
  'Unity': '#464646,#1a1a1a', 'Arduino': '#00979D,#005f63',
  'C++': '#00599C,#003a6b', 'CUDA': '#76B900,#3d6100',
  'MongoDB': '#47A248,#1a5c1a', 'FastAPI': '#009688,#004d40',
  'Laravel': '#FF2D20,#8b1b14', 'Three.js': '#222,#444',
  'Node.js': '#339933,#1a5c1a', 'NodeJS': '#339933,#1a5c1a',
  'Docker': '#2496ED,#0d5faa', 'Flask': '#555,#222',
  'Spring Boot': '#6DB33F,#2e5c10', 'Firebase': '#FFCA28,#e09400',
};

export const TECH_EMOJI: Record<string, string> = {
  'React': '⚛️', 'Angular': '🔺', 'Python': '🐍', 'Java': '☕',
  'Flutter': '🦋', 'Unity': '🎮', 'Arduino': '🤖', 'Three.js': '🌐',
  'Docker': '🐳', 'Node.js': '🟢', 'NodeJS': '🟢', 'MongoDB': '🍃',
  'CUDA': '⚡', 'C++': '⚙️', 'Laravel': '🎨', 'FastAPI': '⚡',
  'Firebase': '🔥', 'Spring Boot': '🍃', 'IoT': '🌱', 'NLP': '💬',
  'ML': '🧠',
};

export function getProjGrad(tags?: string[]): string {
  if (!tags) return '#3d5229,#6a7f55';
  for (const t of tags) {
    if (TECH_GRAD[t]) return TECH_GRAD[t];
  }
  return '#3d5229,#6a7f55';
}

export function getProjEmoji(tags?: string[]): string {
  if (!tags) return '💻';
  for (const t of tags) {
    if (TECH_EMOJI[t]) return TECH_EMOJI[t];
  }
  return '💻';
}

/**
 * Returns portfolio projects, merging CMS published projects when present.
 * CMS projects strictly enhance/override, while preserving the original portfolio items.
 */
export function getPortfolioProjects(): ProjectItem[] {
  const cmsProjects = (publishedData?.entries || []).filter(
    (e: any) => e.contentTypeId === 'projects' && (e.status === 'published' || !e.status)
  );

  if (cmsProjects.length === 0) {
    return [];
  }

  return cmsProjects.map((entry: any) => {
    const f = entry.fields || {};
    return {
      slug: entry.slug || entry.id,
      title: typeof f.title === 'object' ? f.title : { en: f.title, fr: f.title, ar: f.title },
      period: f.date || f.startDate || '',
      context: f.context || '',
      description: f.shortDescription
        ? (typeof f.shortDescription === 'object' ? f.shortDescription : { en: f.shortDescription, fr: f.shortDescription, ar: f.shortDescription })
        : (typeof f.description === 'object' ? f.description : { en: f.description, fr: f.description, ar: f.description }),
      tags: Array.isArray(f.tags) ? f.tags : (f.technologies ? (Array.isArray(f.technologies) ? f.technologies : [f.technologies]) : []),
      github: f.githubUrl || (f.externalLink?.includes('github') ? f.externalLink : ''),
      demo: f.liveUrl || (f.externalLink && !f.externalLink.includes('github') ? f.externalLink : ''),
      image: f.coverImage || '',
      featured: Boolean(f.featured),
    };
  });
}

export function resolvePortfolioText(
  value: LocalizedString | string | undefined,
  locale: SupportedLocale = 'fr'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value['fr'] || value['en'] || '';
}

// Dynamic CMS profile override from published Firestore data
const _cmsProfile = (publishedData as any)?.siteSettings?.profile;
if (_cmsProfile) {
  if (_cmsProfile.name) PORTFOLIO_DATA.name = _cmsProfile.name;
  if (_cmsProfile.email) PORTFOLIO_DATA.email = _cmsProfile.email;
  if (_cmsProfile.phone) PORTFOLIO_DATA.phone = _cmsProfile.phone;
  if (_cmsProfile.location) PORTFOLIO_DATA.location = _cmsProfile.location;
  if (_cmsProfile.github || _cmsProfile.socials?.github) PORTFOLIO_DATA.github = _cmsProfile.github || _cmsProfile.socials?.github;
  if (_cmsProfile.linkedin || _cmsProfile.socials?.linkedin) PORTFOLIO_DATA.linkedin = _cmsProfile.linkedin || _cmsProfile.socials?.linkedin;
  if (_cmsProfile.behance || _cmsProfile.socials?.behance) PORTFOLIO_DATA.behance = _cmsProfile.behance || _cmsProfile.socials?.behance;
  if (_cmsProfile.youtube || _cmsProfile.socials?.youtube) PORTFOLIO_DATA.youtube = _cmsProfile.youtube || _cmsProfile.socials?.youtube;
  if (_cmsProfile.cvUrl || _cmsProfile.cv_url) PORTFOLIO_DATA.cv_url = _cmsProfile.cvUrl || _cmsProfile.cv_url;
  if (_cmsProfile.title) {
    PORTFOLIO_DATA.title = {
      fr: _cmsProfile.title.fr || PORTFOLIO_DATA.title.fr,
      en: _cmsProfile.title.en || PORTFOLIO_DATA.title.en,
      ar: _cmsProfile.title.ar || PORTFOLIO_DATA.title.ar,
    };
  }
  if (_cmsProfile.bio || _cmsProfile.about) {
    const bioSrc = _cmsProfile.bio || _cmsProfile.about;
    PORTFOLIO_DATA.about = {
      fr: bioSrc.fr || PORTFOLIO_DATA.about.fr,
      en: bioSrc.en || PORTFOLIO_DATA.about.en,
      ar: bioSrc.ar || PORTFOLIO_DATA.about.ar,
    };
  }
  if (_cmsProfile.contactLabels) {
    if (_cmsProfile.contactLabels.heading) {
      PORTFOLIO_DATA.contactLabels.heading = {
        fr: _cmsProfile.contactLabels.heading.fr || PORTFOLIO_DATA.contactLabels.heading.fr,
        en: _cmsProfile.contactLabels.heading.en || PORTFOLIO_DATA.contactLabels.heading.en,
        ar: _cmsProfile.contactLabels.heading.ar || PORTFOLIO_DATA.contactLabels.heading.ar,
      };
    }
    if (_cmsProfile.contactLabels.subheading) {
      PORTFOLIO_DATA.contactLabels.subheading = {
        fr: _cmsProfile.contactLabels.subheading.fr || PORTFOLIO_DATA.contactLabels.subheading.fr,
        en: _cmsProfile.contactLabels.subheading.en || PORTFOLIO_DATA.contactLabels.subheading.en,
        ar: _cmsProfile.contactLabels.subheading.ar || PORTFOLIO_DATA.contactLabels.subheading.ar,
      };
    }
  }
}

export function cmsLocalized(v, locale = 'en') {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return v[locale] || v.en || v.fr || v.ar || '';
  return '';
}

function cmsEntries(slug) {
  const col = getCollectionBySlug(slug);
  return Array.isArray(col?.entries) ? col.entries : [];
}

function asArray(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export function getCmsSkills(locale = 'en') {
  const groups = new Map<string, string[]>();
  const seen = new Set<string>();
  for (const e of cmsEntries('skills')) {
    const f = e.fields || {};
    const cat = cmsLocalized(f.category, locale) || 'Skills';
    const items = asArray(f.items || f.skills);
    if (!groups.has(cat)) groups.set(cat, []);
    for (const it of items) {
      const norm = it.trim().toLowerCase();
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      groups.get(cat)!.push(it);
    }
  }
  const projectTechs: string[] = [];
  for (const e of cmsEntries('projects')) {
    const f = e.fields || {};
    for (const key of ['technologies', 'tags', 'tech', 'stack']) {
      for (const t of asArray(f[key])) {
        const norm = t.trim().toLowerCase();
        if (!norm || seen.has(norm)) continue;
        seen.add(norm);
        projectTechs.push(t);
      }
    }
  }
  if (projectTechs.length) {
    const key = locale === 'ar' ? 'تقنيات المشاريع' : locale === 'fr' ? 'Technologies des projets' : 'Project Technologies';
    groups.set(key, projectTechs);
  }
  return Array.from(groups, ([category, items]) => ({ category, items })).filter((g) => g.items.length > 0);
}

export function getCmsExperiences() {
  return cmsEntries('experience').concat(cmsEntries('experiences')).map((e) => {
    const f = e.fields || {};
    return {
      slug: e.slug || e.id,
      role: (typeof f.role === 'object' ? f.role : { en: String(f.role || '') }),
      company: String(f.company || ''),
      period: String(f.period || f.dates || ''),
      location: String(f.location || ''),
      description: (typeof f.description === 'object' ? f.description : { en: String(f.description || '') }),
      tags: asArray(f.tags),
      images: asArray(f.images),
    };
  });
}

export function getCmsPresentations() {
  return cmsEntries('presentations').concat(cmsEntries('presentation')).map((e) => {
    const f = e.fields || {};
    return {
      slug: e.slug || e.id,
      title: (typeof f.title === 'object' ? f.title : { en: String(f.title || '') }),
      period: String(f.period || f.date || ''),
      context: typeof f.context === 'object' ? f.context : String(f.context || ''),
      description: (typeof f.description === 'object' ? f.description : { en: String(f.description || '') }),
      tags: asArray(f.tags),
      youtube: String(f.youtube || f.video || f.url || ''),
    };
  });
}

export function getCmsArtworks() {
  return cmsEntries('artworks').concat(cmsEntries('artwork')).map((e) => {
    const f = e.fields || {};
    return {
      slug: e.slug || e.id,
      title: cmsLocalized(f.title, 'en') || String(f.title || ''),
      image: String(f.image || f.url || ''),
      youtube: String(f.youtube || ''),
      behance: String(f.behance || ''),
    };
  });
}

export function getCollectionSlug(...names: string[]): string {
  for (const name of names) {
    const col = getCollectionBySlug(name);
    if (col) return col.contentType?.slug || col.contentType?.id || name;
  }
  return names[names.length - 1] || '';
}
export function getCmsEducation() {
  return cmsEntries('education').map((e) => {
    const f = e.fields || {};
    return {
      degree: (typeof f.degree === 'object' ? f.degree : { en: String(f.degree || f.title || '') }),
      school: String(f.school || f.institution || ''),
      period: String(f.period || f.dates || ''),
      location: String(f.location || ''),
    };
  });
}
