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
  title: LocalizedString;
  period?: string;
  context?: string | LocalizedString;
  description: LocalizedString;
  tags?: string[];
  youtube?: string;
}

export interface ArtworkItem {
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
  skills: [
    { category: "Frontend", items: ["React", "Angular", "TypeScript", "HTML/CSS", "Tailwind CSS", "Material UI", "Three.js"] },
    { category: "Backend", items: ["Node.js", "Express.js", "FastAPI", "Flask", "Spring Boot", "Symfony", "Socket.IO"] },
    { category: "Bases de données", items: ["MongoDB", "PostgreSQL", "MySQL", "SQL Server", "ChromaDB", "Firebase"] },
    { category: "IA & Data", items: ["RAG", "LLM (Llama 3.2, Phi-2, Groq)", "CUDA", "spaCy", "TextBlob", "Pandas", "Plotly", "NLP"] },
    { category: "Mobile & IoT", items: ["Flutter", "Android Studio", "Arduino", "ESP32-CAM", "Firebase", "Blynk Cloud", "Unity", "C#"] },
    { category: "Outils & DevOps", items: ["Git", "Docker", "Figma", "Cypress", "Playwright", "Azure", "UML", "LaTeX", "Trello"] },
    { category: "Accessibilité & Éco", items: ["WCAG 2.1/2.2", "Audit accessibilité", "Sustainable Web Design", "RTL", "ARIA"] },
    { category: "Langages", items: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "SQL", "C#", "C++"] },
  ] as SkillCategory[],

  // ── EXPÉRIENCES PROFESSIONNELLES ───────────────────────
  experiences: [
    {
      role: { fr: "Stagiaire Développeuse Front-End", en: "Front-End Developer Intern", ar: "متدربة مطورة واجهات أمامية" },
      company: "WebMedia", period: "Juil. – Août 2025", location: "Tunis (Hybride)",
      description: {
        fr: "Développement du front-end complet d'un clone Notion multi-tenant : gestion des rôles (Personal User, Super Admin, Org Admin, Workspace Owner), mode sombre/clair, réinitialisation de mot de passe, gestion des permissions et personnalisation de l'interface.",
        en: "Full front-end development of a multi-tenant Notion clone: role management (Personal User, Super Admin, Org Admin, Workspace Owner), dark/light mode, password reset, permissions and UI customization.",
        ar: "تطوير الواجهة الأمامية الكاملة لنسخة Notion متعددة المستأجرين مع إدارة الأدوار والوضع الليلي وإعادة تعيين كلمة المرور.",
      },
      tags: ["React 18", "Tailwind CSS", "UI/UX"],
      github: "https://github.com/Yosr-MEDDAH/notion-clone-frontend",
      images: [
        "assets/screenshots-notion-clone/VuePages.png",
        "assets/screenshots-notion-clone/auth.png",
        "assets/screenshots-notion-clone/darkLightMode.png",
        "assets/screenshots-notion-clone/editeurPage.png",
        "assets/screenshots-notion-clone/indiv.png",
        "assets/screenshots-notion-clone/org ad.png",
        "assets/screenshots-notion-clone/responsive.png",
        "assets/screenshots-notion-clone/super ad.png",
        "assets/screenshots-notion-clone/work_ow.png",
      ],
    },
    {
      role: { fr: "Stagiaire Développeuse Front-End", en: "Front-End Developer Intern", ar: "متدربة مطورة واجهات أمامية" },
      company: "VisShop AI", period: "Juin – Juil. 2025", location: "En ligne",
      description: {
        fr: "Refonte et optimisation de l'expérience utilisateur sur les pages clés (accueil, login, dashboard, réinitialisation de mot de passe). Utilisation de Figma pour le design et React/Material-UI pour l'implémentation.",
        en: "Redesign and UX optimization of key pages (home, login, dashboard, password reset). Figma for design, React/Material-UI for implementation.",
        ar: "إعادة تصميم وتحسين تجربة المستخدم على الصفحات الرئيسية. Figma للتصميم و React/Material-UI للتنفيذ.",
      },
      tags: ["React", "Material UI", "Figma", "UX Design"],
    },
    {
      role: { fr: "Projet de Fin d'Études — Développeuse Front-End", en: "Final Year Project — Front-End Developer", ar: "مشروع التخرج — مطورة واجهات أمامية" },
      company: "Domi Affaire", period: "Jan. – Mai 2024", location: "Tunis",
      description: {
        fr: "Solution web de domiciliation d'entreprise et application mobile de gestion de salles avec chat en temps réel, notifications push et algorithme de recommandation.",
        en: "Web solution for company domiciliation and a mobile room management app with real-time chat, push notifications, and recommendation algorithm.",
        ar: "حل ويب لتوطين الشركات وتطبيق موبايل لإدارة القاعات مع دردشة فورية وإشعارات وخوارزمية توصية.",
      },
      tags: ["Angular", "Flutter", "Cypress", "Flask", "MongoDB", "Docker"],
      github: "https://github.com/Yosr-MEDDAH/DomiAffaire",
    },
    {
      role: { fr: "Stage de perfectionnement — Full-Stack JS", en: "Advanced Internship — Full-Stack JS", ar: "تدريب متقدم — Full-Stack JS" },
      company: "VNEXT Consulting", period: "Jan. – Fév. 2023", location: "Bizerte",
      description: {
        fr: "Développement d'une plateforme de soutien aux réfugiés africains en Tunisie (MEAN stack). Messagerie sécurisée via Socket.io, module de dons Stripe, interface multilingue RTL/LTR (ngx-translate), authentification JWT et double validation client/serveur.",
        en: "Built a platform supporting African refugees in Tunisia (MEAN stack). Secure messaging via Socket.io, Stripe donation module, multilingual RTL/LTR interface, JWT auth and double client/server validation.",
        ar: "تطوير منصة دعم اللاجئين الأفارقة في تونس. رسائل آمنة عبر Socket.io، تبرعات Stripe، واجهة متعددة اللغات RTL.",
      },
      tags: ["MongoDB", "Express.js", "Angular", "Node.js", "Socket.IO", "Stripe", "JWT"],
    },
    {
      role: { fr: "Stage d'été — Full-Stack JS", en: "Summer Internship — Full-Stack JS", ar: "تدريب صيفي — Full-Stack JS" },
      company: "Treetronix", period: "Juil. – Août 2022", location: "Tunis",
      description: {
        fr: "Développement d'une application de gestion des étudiants (MEAN stack).",
        en: "Built a student management web application (MEAN stack).",
        ar: "تطوير تطبيق ويب لإدارة الطلاب.",
      },
      tags: ["MongoDB", "Express.js", "Angular", "Node.js"],
    },
    {
      role: { fr: "Stage d'initiation", en: "Introductory Internship", ar: "تدريب تعريفي" },
      company: "Tunisie Télécom", period: "Jan. – Fév. 2022", location: "Bizerte",
      description: {
        fr: "Découverte des infrastructures fibre optique (FTTH/GPON). Réceptions techniques de terrain à Menzel Jemil et Bir Masyougha, pointage des chambres de tirage et utilisation du SIG GeoNetwork.",
        en: "Hands-on experience with optical fiber infrastructure (FTTH/GPON). Field technical inspections, pulling chambers and GeoNetwork GIS mapping.",
        ar: "تجربة عملية في البنية التحتية للألياف الضوئية. معاينات ميدانية واستخدام نظام GeoNetwork.",
      },
      tags: ["FTTH", "GPON", "GeoNetwork", "GIS"],
    },
  ] as Experience[],

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
  presentations: [
    {
      title: { fr: "Les Coulisses de l'Éducation en Chine", en: "Behind Chinese Education", ar: "كواليس التعليم في الصين" },
      period: "Avr. 2025",
      context: { fr: "ISAMM (binôme avec Mohamed Amine Yeferni)", en: "ISAMM (pair with Mohamed Amine Yeferni)", ar: "ISAMM" },
      description: {
        fr: "Analyse du système éducatif chinois : fondements historiques, évolution, défis et réformes. Du méritocratisme millénaire au Gaokao, comment ce modèle a propulsé la Chine vers le rang de puissance mondiale.",
        en: "Analysis of the Chinese education system: historical foundations, evolution, challenges and reforms. From millennial meritocracy to the Gaokao, how this model propelled China to global power status.",
        ar: "تحليل النظام التعليمي الصيني من الجذور التاريخية إلى الإصلاحات الحديثة.",
      },
      tags: ["Éducation", "Chine", "Sociologie"],
      youtube: "https://youtu.be/s8Gdx8sP-2M?si=-z5KzA291mUeDgfn",
    },
    {
      title: { fr: "Les Nouveaux Médias : Jeux vidéo & Anime", en: "New Media: Video Games & Anime", ar: "وسائل الإعلام الجديدة: ألعاب الفيديو والأنيمي" },
      period: "Mai 2025",
      context: { fr: "ISAMM — Cours de français (binôme avec Mohamed Beldi)", en: "ISAMM — French course (pair with Mohamed Beldi)", ar: "ISAMM" },
      description: {
        fr: "Au-delà des clichés, comment les jeux vidéo et l'anime peuvent devenir de véritables outils éducatifs développant des compétences cognitives, sociales et créatives — tout en abordant les défis (violence, addiction). \"Le poison est dans la dose.\"",
        en: "Beyond clichés, how video games and anime can become genuine educational tools developing cognitive, social and creative skills — while addressing challenges (violence, addiction). \"The poison is in the dose.\"",
        ar: "كيف يمكن لألعاب الفيديو والأنيمي أن تصبح أدوات تعليمية حقيقية.",
      },
      tags: ["Médias", "Éducation", "Culture"],
      youtube: "https://youtu.be/s6G7bNou6d8?si=KW1tZst55Z-4tJ3d",
    },
    {
      title: { fr: "Le Mur Invisible — Accessibilité numérique & ODD 10", en: "The Invisible Wall — Digital Accessibility & SDG 10", ar: "الجدار غير المرئي — إمكانية الوصول الرقمي" },
      period: "Jan. 2026",
      context: { fr: "ISAMM (binôme avec Nour Ben Rhouma) — Publié sur YouTube", en: "ISAMM (pair with Nour Ben Rhouma) — Published on YouTube", ar: "ISAMM" },
      description: {
        fr: "Comment une année entière de développement web m'a conduite à exclure 285 millions de personnes sans le savoir. 71% des clients handicapés quittent immédiatement un site inaccessible. Les slides respectent elles-mêmes les principes WCAG 2.1.",
        en: "How a full year of web development led me to unknowingly exclude 285 million people. 71% of customers with disabilities immediately leave an inaccessible website. The slides themselves apply WCAG 2.1 principles.",
        ar: "كيف أدى عام كامل من تطوير الويب إلى استبعاد 285 مليون شخص دون أن أدرك ذلك.",
      },
      tags: ["Accessibilité", "WCAG", "ODD 10", "Inclusion numérique"],
      youtube: "https://youtu.be/iRd9SPUbov0?si=tVl82fpjj695pHNG",
    },
    {
      title: { fr: "Décadence Offerte — Art, Symbolisme & Océans", en: "Offered Decadence — Art, Symbolism & Oceans", ar: "الانحدار المُهدى — فن ورمزية وأمحيطات" },
      period: "Déc. 2025",
      context: { fr: "ISAMM — Cours artistique — Publié sur YouTube", en: "ISAMM — Art course — Published on YouTube", ar: "ISAMM" },
      description: {
        fr: "Réflexion sur ce que nous offrons à nos océans. Processus créatif complet : œuvre peinte, stickers-récompenses, brochures éducatives, quiz interactif Canva, analyse symboliste des éléments de la toile. Publié en plusieurs épisodes sur YouTube.",
        en: "Reflection on what we offer our oceans. Complete creative process: painted artwork, reward stickers, educational brochures, interactive Canva quiz, symbolist analysis of the canvas elements. Published in multiple episodes on YouTube.",
        ar: "تأمل في ما نقدمه لمحيطاتنا. عملية إبداعية كاملة من اللوحة إلى التحليل الرمزي.",
      },
      tags: ["Art", "Symbolisme", "Environnement", "Peinture"],
      youtube: "https://youtu.be/eUfeOi0YTio?si=YUpUtkJGnMGX3AEI",
    },
    {
      title: { fr: "Architecture Web & Complexité — Notion Clone (Stage WebMedia)", en: "Web Architecture & Complexity — Notion Clone (WebMedia Internship)", ar: "معمارية الويب والتعقيد — نسخة Notion" },
      period: "Juil. – Août 2025",
      context: { fr: "Co-réalisé avec Mohamed Amine Loueti — Publié sur YouTube", en: "Co-authored with Mohamed Amine Loueti — Published on YouTube", ar: "مع Mohamed Amine Loueti" },
      description: {
        fr: "Retour d'expérience technique sur la complexité cachée derrière Notion. Pourquoi SQL (PostgreSQL) a atteint ses limites face aux blocs imbriqués (arbre infini). Transition vers FastAPI + MongoDB (NoSQL), RBAC granulaire, React 18 et requêtes asynchrones Python.",
        en: "Technical experience report on the hidden complexity behind Notion. Why SQL (PostgreSQL) hit its limits with nested blocks (infinite tree). Migration to FastAPI + MongoDB (NoSQL), granular RBAC, React 18 and Python async queries.",
        ar: "تقرير تجربة تقنية حول التعقيد الخفي وراء Notion والانتقال من SQL إلى NoSQL.",
      },
      tags: ["FastAPI", "MongoDB", "React 18", "RBAC", "Architecture", "NoSQL"],
      youtube: "https://youtu.be/zs-Sz_ltXrw?si=q8YOonKEQ9iDNM41",
    },
    {
      title: { fr: "Patrons de comportement GoF — Zoo du Zodiaque Chinois", en: "GoF Behavioral Patterns — Chinese Zodiac Zoo", ar: "أنماط GoF السلوكية — حديقة حيوان الزودياك الصيني" },
      period: "Mars 2026",
      context: { fr: "ISAMM — Génie Logiciel (chef d'équipe, 5 personnes) — Publié sur YouTube", en: "ISAMM — Software Engineering (team leader, 5 people) — Published on YouTube", ar: "ISAMM — هندسة البرمجيات" },
      description: {
        fr: "Présentation de 1h13 sur les 9 patrons de comportement GoF (Chain of Responsibility, Mediator, State, Strategy, Template Method, Command, Memento, Visitor). Thème fil rouge : ZooKeeper du Zodiaque Chinois. Activités interactives, diagrammes PlantUML, quiz HTML.",
        en: "1.13-hour presentation on all 9 GoF behavioral patterns (Chain of Responsibility, Mediator, State, Strategy, Template Method, Command, Memento, Visitor). Running theme: Chinese Zodiac ZooKeeper. Interactive activities, PlantUML diagrams, HTML quiz.",
        ar: "عرض مدته 1.13 ساعة على 9 أنماط سلوكية من GoF بموضوع حديقة حيوان الزودياك الصيني.",
      },
      tags: ["GoF", "Design Patterns", "Génie Logiciel", "UML"],
      youtube: "https://youtu.be/Ezm1wgb-CSg?si=uEqTYMJtTRGi7lbK",
    },
    {
      title: { fr: "Fondamentaux de JavaScript", en: "JavaScript Fundamentals", ar: "أساسيات JavaScript" },
      period: "Déc. 2024 – Jan. 2025",
      context: { fr: "ISAMM (binôme avec Mohamed Amine Yeferni) — Playlist YouTube", en: "ISAMM (pair with Mohamed Amine Yeferni) — YouTube playlist", ar: "ISAMM" },
      description: {
        fr: "Playlist YouTube documentant les fondamentaux de JavaScript : types, fonctions, DOM, événements, asynchrone. Réalisée dans le cadre du cursus ingénierie, publiée comme partie du portfolio en ligne.",
        en: "YouTube playlist documenting JavaScript fundamentals: types, functions, DOM, events, async. Created as part of the engineering curriculum, published as part of the online portfolio.",
        ar: "قائمة تشغيل يوتيوب توثق أساسيات JavaScript ضمن المنهج الهندسي.",
      },
      tags: ["JavaScript", "Web", "Pédagogie"],
      youtube: "https://youtu.be/T5uF_a_DEcI?si=FUejbSKJr87sDZ2Q",
    },
    {
      title: { fr: "Méthode Agile — Scrum & Gestion de projet", en: "Agile Methodology — Scrum & Project Management", ar: "منهجية أجايل — Scrum وإدارة المشاريع" },
      period: "Déc. 2023",
      context: { fr: "ISET Radès (en binôme)", en: "ISET Radès (in pairs)", ar: "ISET Radès (في ثنائي)" },
      description: {
        fr: "Présentation sur les valeurs et principes Agile, transition du modèle en V/Waterfall vers le développement itératif. Analyse approfondie de Scrum : rôles (Scrum Master, Product Owner), Sprints, Daily Stand-ups.",
        en: "Presentation on Agile values and principles, transition from V-Model/Waterfall to iterative development. In-depth Scrum analysis: roles (Scrum Master, Product Owner), Sprints, Daily Stand-ups.",
        ar: "عرض عن قيم Agile والانتقال من نموذج V إلى التطوير التكراري وتحليل Scrum.",
      },
      tags: ["Agile", "Scrum", "Gestion de projet"],
      youtube: "",
    },
    {
      title: { fr: "Théorie C-K — Design & Innovation radicale", en: "C-K Theory — Design & Radical Innovation", ar: "نظرية C-K — التصميم والابتكار الجذري" },
      period: "Mai 2023",
      context: { fr: "ISET Radès (en binôme)", en: "ISET Radès (in pairs)", ar: "ISET Radès (في ثنائي)" },
      description: {
        fr: "Présentation de la théorie C-K (Concept-Knowledge), méthode formelle pour le design créatif et l'innovation radicale. Interaction entre l'espace Concept (idées inconnues) et l'espace Connaissance (faits établis).",
        en: "Presentation of C-K theory (Concept-Knowledge), a formal method for creative design and radical innovation. Interaction between the Concept space (unknown ideas) and the Knowledge space (established facts).",
        ar: "نظرية C-K للتصميم الإبداعي والابتكار الجذري: التفاعل بين فضاء المفاهيم وفضاء المعرفة.",
      },
      tags: ["Innovation", "Design thinking", "Créativité"],
      youtube: "",
    },
    {
      title: { fr: "Sécurité dans le Cloud Computing", en: "Security in Cloud Computing", ar: "الأمن في الحوسبة السحابية" },
      period: "Nov. 2023",
      context: { fr: "ISET Radès (en binôme)", en: "ISET Radès (in pairs)", ar: "ISET Radès (في ثنائي)" },
      description: {
        fr: "Modèle de responsabilité partagée entre fournisseurs et clients cloud. Chiffrement des données, IAM (Identity & Access Management) et sécurité réseau.",
        en: "Shared responsibility model between cloud providers and customers. Data encryption, IAM (Identity & Access Management) and network security.",
        ar: "نموذج المسؤولية المشتركة في الحوسبة السحابية: تشفير البيانات وإدارة الهوية.",
      },
      tags: ["Cloud", "Sécurité", "IAM"],
      youtube: "",
    },
  ] as PresentationItem[],

  // ── ARTWORKS ───────────────────────────────────────────
  artworks: [
    { title: "Peinture — Décadence Offerte", image: "assets/OfferedDecadence-artwork.jpg", youtube: "https://youtu.be/SnA0zi-Bqms?si=f_GLAVODaBfpoe7l", behance: "https://www.behance.net/gallery/238073733/Offered-Decadence" },
    { title: "The Curse of Wealth", image: "assets/artwork-TheCurseOfWealth.jpg", behance: "https://www.behance.net/gallery/241390357/The-Curse-of-Wealth" },
    { title: "The Effort Crown", image: "assets/artwork-TheEffortCrown.png", behance: "https://www.behance.net/gallery/241391541/The-Effort-Crown" },
    { title: "When Machines Kneel", image: "assets/When Machines Kneel.jpg", youtube: "https://youtu.be/iN40R1spt6I?si=lBn_28-TQvbkCQA4", behance: "https://www.behance.net/gallery/238059971/When-Machines-Kneel" },
    { title: "Calligraphie chinoise — Concours", image: "assets/artwork-ReflectionOfTomorrow-chinese-bridge-competition.jpg", youtube: "https://youtu.be/598T_KiJzOI?si=pRZmHiZdsPZZDKpn", behance: "https://www.behance.net/gallery/241061843/Reflection-of-Tomorrow-From-Rice-Fields-to-Rockets" },
  ] as ArtworkItem[],

  // ── FORMATION ──────────────────────────────────────────
  education: [
    {
      degree: { fr: "Cycle Ingénieur en Sciences Informatiques et Multimédia", en: "Engineering Degree in Computer Science and Multimedia", ar: "شهادة هندسة في علوم الحاسوب والوسائط المتعددة" },
      school: "ISAMM — Institut Supérieur des Arts Multimédia de la Manouba",
      period: "2024 – Présent", location: "Manouba",
    },
    {
      degree: { fr: "Licence en Technologies de l'Informatique", en: "Bachelor's in Information Technologies", ar: "إجازة في تكنولوجيات المعلوماتية" },
      school: "ISETR — Institut Supérieur des Études Technologiques de Radès",
      period: "2021 – 2024", location: "Radès",
    },
    {
      degree: { fr: "Baccalauréat en Sciences Expérimentales", en: "Baccalaureate in Experimental Sciences", ar: "بكالوريا علوم تجريبية" },
      school: "Lycée Habib Thameur",
      period: "2021", location: "Bizerte",
    },
  ] as EducationItem[],

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
