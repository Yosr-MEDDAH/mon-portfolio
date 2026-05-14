// ============================================================
//  🎯 FICHIER DE CONFIGURATION — LE SEUL QUE TU DOIS MODIFIER
// ============================================================

const DATA = {

  // ── INFOS PERSONNELLES ──────────────────────────────────
  name:      "Yosr Meddah",
  email:     "yosrmeddah@outlook.com",
  phone:     "+216 50 231 459",
  location:  "Tunis / Bizerte, Tunisie",
  github:    "https://github.com/Yosr-MEDDAH",
  linkedin:  "https://www.linkedin.com/in/yosr-meddah/",
  behance:   "https://www.behance.net/yosr-meddah",
  youtube:   "https://www.youtube.com/@YosrMeddah",
  cv_url:    "cv.pdf",
  avatar:    "assets/yosr.png",

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
    { category: "Frontend",            items: ["React", "Angular", "TypeScript", "HTML/CSS", "Tailwind CSS", "Material UI", "Three.js"] },
    { category: "Backend",             items: ["Node.js", "Express.js", "FastAPI", "Flask", "Spring Boot", "Symfony", "Socket.IO"] },
    { category: "Bases de données",    items: ["MongoDB", "PostgreSQL", "MySQL", "SQL Server", "ChromaDB", "Firebase"] },
    { category: "IA & Data",           items: ["RAG", "LLM (Llama 3.2, Phi-2, Groq)", "CUDA", "spaCy", "TextBlob", "Pandas", "Plotly", "NLP"] },
    { category: "Mobile & IoT",        items: ["Flutter", "Android Studio", "Arduino", "ESP32-CAM", "Firebase", "Blynk Cloud", "Unity", "C#"] },
    { category: "Outils & DevOps",     items: ["Git", "Docker", "Figma", "Cypress", "Playwright", "Azure", "UML", "LaTeX", "Trello"] },
    { category: "Accessibilité & Éco", items: ["WCAG 2.1/2.2", "Audit accessibilité", "Sustainable Web Design", "RTL", "ARIA"] },
    { category: "Langages",            items: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "SQL", "C#", "C++"] },
  ],

  // ── EXPÉRIENCES PROFESSIONNELLES ───────────────────────
  experiences: [
    {
      role:    { fr: "Stagiaire Développeuse Front-End", en: "Front-End Developer Intern", ar: "متدربة مطورة واجهات أمامية" },
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
        "assets/screenshots-notion-clone/work_ow.png"
      ],
    },
    {
      role:    { fr: "Stagiaire Développeuse Front-End", en: "Front-End Developer Intern", ar: "متدربة مطورة واجهات أمامية" },
      company: "VisShop AI", period: "Juin – Juil. 2025", location: "En ligne",
      description: {
        fr: "Refonte et optimisation de l'expérience utilisateur sur les pages clés (accueil, login, dashboard, réinitialisation de mot de passe). Utilisation de Figma pour le design et React/Material-UI pour l'implémentation.",
        en: "Redesign and UX optimization of key pages (home, login, dashboard, password reset). Figma for design, React/Material-UI for implementation.",
        ar: "إعادة تصميم وتحسين تجربة المستخدم على الصفحات الرئيسية. Figma للتصميم و React/Material-UI للتنفيذ.",
      },
      tags: ["React", "Material UI", "Figma", "UX Design"],
    },
    {
      role:    { fr: "Projet de Fin d'Études — Développeuse Front-End", en: "Final Year Project — Front-End Developer", ar: "مشروع التخرج — مطورة واجهات أمامية" },
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
      role:    { fr: "Stage de perfectionnement — Full-Stack JS", en: "Advanced Internship — Full-Stack JS", ar: "تدريب متقدم — Full-Stack JS" },
      company: "VNEXT Consulting", period: "Jan. – Fév. 2023", location: "Bizerte",
      description: {
        fr: "Développement d'une plateforme de soutien aux réfugiés africains en Tunisie (MEAN stack). Messagerie sécurisée via Socket.io, module de dons Stripe, interface multilingue RTL/LTR (ngx-translate), authentification JWT et double validation client/serveur.",
        en: "Built a platform supporting African refugees in Tunisia (MEAN stack). Secure messaging via Socket.io, Stripe donation module, multilingual RTL/LTR interface, JWT auth and double client/server validation.",
        ar: "تطوير منصة دعم اللاجئين الأفارقة في تونس. رسائل آمنة عبر Socket.io، تبرعات Stripe، واجهة متعددة اللغات RTL.",
      },
      tags: ["MongoDB", "Express.js", "Angular", "Node.js", "Socket.IO", "Stripe", "JWT"],
    },
    {
      role:    { fr: "Stage d'été — Full-Stack JS", en: "Summer Internship — Full-Stack JS", ar: "تدريب صيفي — Full-Stack JS" },
      company: "Treetronix", period: "Juil. – Août 2022", location: "Tunis",
      description: {
        fr: "Développement d'une application de gestion des étudiants (MEAN stack).",
        en: "Built a student management web application (MEAN stack).",
        ar: "تطوير تطبيق ويب لإدارة الطلاب.",
      },
      tags: ["MongoDB", "Express.js", "Angular", "Node.js"],
    },
    {
      role:    { fr: "Stage d'initiation", en: "Introductory Internship", ar: "تدريب تعريفي" },
      company: "Tunisie Télécom", period: "Jan. – Fév. 2022", location: "Bizerte",
      description: {
        fr: "Découverte des infrastructures fibre optique (FTTH/GPON). Réceptions techniques de terrain à Menzel Jemil et Bir Masyougha, pointage des chambres de tirage et utilisation du SIG GeoNetwork.",
        en: "Hands-on experience with optical fiber infrastructure (FTTH/GPON). Field technical inspections, pulling chambers and GeoNetwork GIS mapping.",
        ar: "تجربة عملية في البنية التحتية للألياف الضوئية. معاينات ميدانية واستخدام نظام GeoNetwork.",
      },
      tags: ["FTTH", "GPON", "GeoNetwork", "GIS"],
    },
  ],

  // ── VIE ASSOCIATIVE ────────────────────────────────────
  associative: [
    {
      role:    { fr: "Designer Pôle Projet & Chargée de Mission RSE", en: "Project Designer & CSR Officer", ar: "مصممة مشاريع ومسؤولة المسؤولية الاجتماعية" },
      company: "Orenda Junior-Entreprise (ISAMM)",
      period:  "Oct. 2025 – Fév. 2026",
      description: {
        fr: "Contribution à plusieurs projets en tant que Designer au sein du département Projet. Participation au séminaire JOBS et sélection comme Chargée de Mission RSE — expérience ayant confirmé l'intérêt pour la responsabilité numérique et le design durable.",
        en: "Contributed to multiple projects as Designer in the Project department. Participated in JOBS seminar and selected as CSR Officer — reinforced interest in digital responsibility and sustainable design.",
        ar: "مساهمة في مشاريع متعددة كمصممة. مشاركة في ندوة JOBS واختيار كمسؤولة المسؤولية الاجتماعية.",
      },
      tags: ["Design", "RSE", "Gestion de projet"],
    },
  ],

  // ── PROJETS ────────────────────────────────────────────
  projects: [
    // ── 2026 ──
    {
      title: { fr: "Green-A11y Agent — PFA", en: "Green-A11y Agent — Final Year Project", ar: "Green-A11y Agent — مشروع التخرج" },
      period: "Fév. – Mai 2026",
      context: "ISAMM — Projet de Fin d'Année",
      description: {
        fr: "Plateforme intelligente d'audit dual : accessibilité WCAG 2.1 + empreinte carbone (modèle Sustainable Web Design). Assistant conversationnel RAG (Llama 3.2/Groq), moteur d'audit automatisé, calculateur d'impact CO₂. Interface WCAG AA, support RTL arabe, identité visuelle inspirée du tatreez palestinien. Résultats : Lighthouse 100/100, axe DevTools 0 violation, WAVE AIM 10/10, EcoIndex A.",
        en: "Intelligent dual-audit platform: WCAG 2.1 accessibility + carbon footprint (Sustainable Web Design model). RAG conversational assistant (Llama 3.2/Groq), automated audit engine, CO₂ impact calculator. WCAG AA interface with RTL support and tatreez-inspired visual identity. Results: Lighthouse 100/100, axe DevTools 0 violation, WAVE AIM 10/10, EcoIndex A.",
        ar: "منصة تدقيق مزدوجة ذكية: WCAG 2.1 + البصمة الكربونية. مساعد RAG (Llama 3.2/Groq)، محرك تدقيق آلي، حاسبة CO₂. واجهة WCAG AA مع RTL وهوية بصرية مستوحاة من التطريز الفلسطيني.",
      },
      tags: ["React 18", "TypeScript", "FastAPI", "Python", "ChromaDB", "MongoDB", "Groq", "Llama 3.2", "Docker", "OAuth2"],
      github: "",
      demo:   "",
      image: "assets/green-a11y-agent-screenshots/home.png",
      featured: true,
    },
    {
      title: { fr: "Système de Recherche d'Information sur Tweets (TREC)", en: "Tweet Information Retrieval System (TREC)", ar: "نظام استرجاع معلومات التغريدات (TREC)" },
      period: "Mars – Mai 2026",
      context: "ISAMM — Cours SRI (6 personnes)",
      description: {
        fr: "Système de recherche d'information expérimental sur tweets en anglais (guerre en Iran) selon une campagne TREC. Trois modèles de RI (BM25, TF-IDF, PL2) × 3 représentations (lexèmes, stems, lemmes) = 9 configurations évaluées via MAP, P@1, P@5, P@10. Résultat clé : PL2 + lexèmes → MAP = 0.161, R@30 = 0.367.",
        en: "Experimental information retrieval system on English tweets (Iran war) following TREC campaign methodology. Three IR models (BM25, TF-IDF, PL2) × 3 representations (tokens, stems, lemmas) = 9 configurations evaluated via MAP, P@1, P@5, P@10. Key result: PL2 + tokens → MAP = 0.161, R@30 = 0.367.",
        ar: "نظام استرجاع معلومات تجريبي على تغريدات إنجليزية وفق منهجية TREC. ثلاثة نماذج × ثلاث تمثيلات = 9 إعدادات تم تقييمها.",
      },
      tags: ["Python", "PyTerrier", "NLTK", "BM25", "TF-IDF", "PL2", "NLP"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "SmartFarm IoT — Serre intelligente Jenin", en: "SmartFarm IoT — Smart Greenhouse", ar: "SmartFarm IoT — دفيئة ذكية" },
      period: "Mars – Avr. 2026",
      context: "ISAMM (6 personnes)",
      description: {
        fr: "Système IoT bout-en-bout pour l'automatisation d'une serre agricole connectée. Arrosage automatique (humidité sol), détection d'incendie, surveillance d'intrusion avec capture photo (PIR + ESP32-CAM), contrôle à distance via Flutter/Blynk. Protocole UART sécurisé avec checksum XOR entre Arduino et ESP32.",
        en: "End-to-end IoT system for connected greenhouse automation. Auto-watering (soil humidity), fire detection, intrusion surveillance with photo capture (PIR + ESP32-CAM), remote control via Flutter/Blynk. Secure UART protocol with XOR checksum between Arduino and ESP32.",
        ar: "نظام IoT متكامل لأتمتة الدفيئة: ري تلقائي، كشف الحريق، مراقبة التسلل بالتقاط صور، تحكم عبر Flutter.",
      },
      tags: ["Arduino", "ESP32-CAM", "Flutter", "Blynk Cloud", "C++", "UART", "DHT11", "PIR"],
      github: "",
      demo:   "",
      image: "assets/iot3-jenin.jpeg",
    },
    {
      title: { fr: "Frontend Tracking (Jira-inspired)", en: "Tracking Frontend (Jira-inspired)", ar: "واجهة تتبع مشاريع التخرج" },
      period: "Fév. – Mars 2026",
      context: "ISAMM (8 personnes)",
      description: {
        fr: "Frontend de l'API de suivi de projets de fin d'études (PFE) développée en équipe. Interface de gestion agile inspirée de Jira : sprints, user stories, tâches, validations, réunions, tableaux de bord et versionnage des rapports.",
        en: "Frontend for the team-built PFE tracking API. Jira-inspired agile management interface: sprints, user stories, tasks, validations, meetings, dashboards and report versioning.",
        ar: "واجهة أمامية لواجهة برمجة تتبع مشاريع التخرج. إدارة أجايل مستوحاة من Jira.",
      },
      tags: ["React", "TypeScript"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Refonte GEC Tunisie Télécom", en: "GEC Tunisie Télécom Refactoring", ar: "إعادة هيكلة GEC تونس تيليكوم" },
      period: "Mars – Mai 2026",
      context: "ISAMM — Génie Logiciel (5 personnes, chef d'équipe)",
      description: {
        fr: "Refonte architecturale d'une application Laravel de Gestion Électronique des Courriers (GEC) pour la DCF de Tunisie Télécom. Application des patrons GoF (Facade, Strategy, State, Observer, Factory Method…), principes GRASP et SOLID, contraintes OCL. Circuit de validation séquentiel multi-niveaux (BOF, AP, Fiscaliste, Trésorerie), synchronisation Oracle ERP, fusion PDF automatique.",
        en: "Architectural refactoring of a Laravel Electronic Document Management (GEC) app for Tunisie Télécom's DCF. Applied GoF patterns (Facade, Strategy, State, Observer, Factory Method…), GRASP and SOLID principles, OCL constraints. Multi-level sequential validation circuit, Oracle ERP sync, automatic PDF merging.",
        ar: "إعادة هيكلة معمارية لتطبيق Laravel لإدارة المراسلات لتونس تيليكوم. تطبيق أنماط GoF ومبادئ GRASP وSOLID وقيود OCL.",
      },
      tags: ["Laravel", "PHP", "UML", "OCL", "GoF Patterns", "SOLID", "GRASP"],
      github: "https://github.com/Yosr-MEDDAH/GL-Projet-Integratif",
      demo:   "",
      image: "placeholder.png",
    },

    // ── 2025 ──
    {
      title: { fr: "PhiloNodes — Six Minds, One Quote", en: "PhiloNodes — Six Minds, One Quote", ar: "PhiloNodes — ستة عقول، اقتباس واحد" },
      period: "Nov. – Déc. 2025",
      context: "ISAMM — Systèmes parallèles",
      description: {
        fr: "Extension Chrome couplée à un backend Python de 6 nœuds philosophes (Aristote, Kant, Nietzsche…) votant en parallèle par consensus TCP pour recommander une citation contextualisée à la page lue. Gain de performance mesuré : ×4,5 en mode parallèle vs séquentiel.",
        en: "Chrome extension connected to a Python backend of 6 philosopher nodes (Aristotle, Kant, Nietzsche…) voting in parallel TCP consensus to recommend a contextual quote for the current page. Measured 4.5× performance gain in parallel vs sequential mode.",
        ar: "إضافة Chrome مرتبطة بـ 6 عقد فلسفية تصوت بالتوافق عبر TCP. مكسب أداء ×4.5 في الوضع المتوازي.",
      },
      tags: ["Python", "Multiprocessing", "Threading", "AsyncIO", "FastAPI", "TCP Sockets", "Chrome Extension"],
      github: "https://github.com/Yosr-MEDDAH/PhiloNodes-Six-Minds-One-Quote",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "API PFE Tracking — Backend Jira-inspired", en: "PFE Tracking API — Jira-inspired Backend", ar: "واجهة برمجة تتبع مشاريع التخرج" },
      period: "Nov. – Déc. 2025",
      context: "ISAMM (8 personnes)",
      description: {
        fr: "API REST backend de gestion et suivi de projets de fin d'études (PFE) selon un workflow agile inspiré de Jira. Sprints, user stories, tâches, validations, réunions, versionnage des rapports, journaux d'activité et génération de rapports HTML. Rôles : étudiant, encadrant entreprise, encadrant université.",
        en: "REST backend API for PFE management following a Jira-inspired agile workflow. Sprints, user stories, tasks, validations, meetings, report versioning, activity logs and HTML report generation. Roles: student, company supervisor, university supervisor.",
        ar: "API REST لإدارة ومتابعة مشاريع التخرج وفق سير عمل أجايل. سبرينت، قصص مستخدم، مهام، تحقق، اجتماعات.",
      },
      tags: ["NodeJS","Express js","MongoDB"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Clans War — Jeu de stratégie navigateur", en: "Clans War — Browser Strategy Game", ar: "Clans War — لعبة استراتيجية" },
      period: "Avr. – Mai 2025",
      context: "ISAMM (binôme avec Hamza Jema)",
      description: {
        fr: "Jeu de stratégie au tour par tour sur une grille 10×10. Guerriers, archers et mages avec capacités spéciales, mécanique de dés et mode IA adverse.",
        en: "Turn-based strategy game on a 10×10 grid. Warriors, archers and mages with special abilities, dice mechanics and AI opponent mode.",
        ar: "لعبة استراتيجية بالأدوار على شبكة 10×10. محاربون وقناصة وسحرة مع قدرات خاصة ووضع ذكاء اصطناعي.",
      },
      tags: ["JavaScript", "HTML/CSS"],
      github: "",
      demo:   "",
      image: "",
    },
    {
      title: { fr: "Le Dragon d'Or — Application restaurant Java", en: "Le Dragon d'Or — Java Restaurant App", ar: "التنين الذهبي — تطبيق مطعم Java" },
      period: "Avr. – Mai 2025",
      context: "ISAMM (binôme avec Hamza Jema)",
      description: {
        fr: "Application desktop native pour un restaurant chinois : gestion des commandes, suivi des livraisons et interface thématique chinoise conçue uniquement avec les composants standard Java Swing.",
        en: "Native desktop application for a Chinese restaurant: order management, delivery tracking and Chinese-themed custom interface designed using standard Java Swing components only.",
        ar: "تطبيق سطح مكتب لمطعم صيني: إدارة الطلبات وتتبع التوصيل وواجهة Java Swing مخصصة.",
      },
      tags: ["Java", "Swing", "POO"],
      github: "",
      demo:   "",
      image: "",
    },
    {
      title: { fr: "TuniHist — UX Design éducatif", en: "TuniHist — Educational UX Design", ar: "TuniHist — تصميم تعليمي" },
      period: "Mars – Mai 2025",
      context: "ISAMM (binôme avec Mohamed Amine Yeferni)",
      description: {
        fr: "Application éducative multilingue (FR/AR) sur l'histoire de la Tunisie pour enfants. Frise chronologique, cartes interactives et quiz. Conception UX centrée sur la lisibilité pour jeune public.",
        en: "Multilingual educational app (FR/AR) on Tunisian history for children. Timeline, interactive maps and quizzes. UX design focused on readability for young audiences.",
        ar: "تطبيق تعليمي متعدد اللغات عن تاريخ تونس للأطفال. خط زمني وخرائط تفاعلية وأسئلة.",
      },
      tags: ["Figma", "UX Design", "Education"],
      github: "",
      demo:   "",
      image: "assets/Tunihist.png",
    },
    {
      title: { fr: "GPU-Accelerated Image Processing (CUDA)", en: "GPU-Accelerated Image Processing (CUDA)", ar: "معالجة صور بتسريع GPU (CUDA)" },
      period: "Mars – Avr. 2025",
      context: "ISAMM",
      description: {
        fr: "Application de traitement d'image haute performance (rotation, luminosité, contraste) via kernels CUDA personnalisés. Benchmark démontrant un gain de vitesse significatif pour images 2048px vs traitement CPU séquentiel.",
        en: "High-performance image processing app (rotation, brightness, contrast) via custom CUDA kernels. Benchmark showing significant speed gains for 2048px images vs sequential CPU processing.",
        ar: "تطبيق معالجة صور عالي الأداء عبر CUDA kernels مخصصة. أداء أعلى بكثير من CPU للصور 2048px.",
      },
      tags: ["C++", "NVIDIA CUDA", "GPU", "HPC"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Netflix Content Analysis — Big Data & NLP", en: "Netflix Content Analysis — Big Data & NLP", ar: "تحليل محتوى Netflix — ضخامة البيانات" },
      period: "Nov. – Déc. 2023",
      context: "ISET Radès",
      description: {
        fr: "Analyse Big Data end-to-end du catalogue Netflix : nettoyage avec Pandas/NumPy, visualisations avancées (Plotly, Seaborn), NLP (spaCy, TextBlob) pour extraire les tendances de contenu et les patterns de métadonnées. Publié sur YouTube.",
        en: "End-to-end Big Data analysis of Netflix's catalog: data cleaning with Pandas/NumPy, advanced visualizations (Plotly, Seaborn), NLP (spaCy, TextBlob) to extract content trends and metadata patterns. Published on YouTube.",
        ar: "تحليل شامل لكتالوج Netflix: تنظيف البيانات، تصورات متقدمة، NLP لاستخراج الاتجاهات.",
      },
      tags: ["Python", "Pandas", "NumPy", "Plotly", "Seaborn", "spaCy", "TextBlob", "NLP"],
      github: "",
      demo:   "https://youtu.be/iAYV2910Fwg?si=Yqqc25Ht2Y_poa9T",
      image: "placeholder.png",
    },
    {
      title: { fr: "Analyse de Données — Notebook MongoDB", en: "Data Analysis — MongoDB Notebook", ar: "تحليل البيانات — دفتر MongoDB" },
      period: "Nov. – Déc. 2023",
      context: "ISET Radès",
      description: {
        fr: "Projet de gestion et d'exploration de données via des notebooks Jupyter avec MongoDB. Mise en œuvre de requêtes NoSQL et de pipelines d'agrégation.",
        en: "Data management and exploration project using Jupyter notebooks with MongoDB. Implementation of NoSQL queries and aggregation pipelines.",
        ar: "مشروع إدارة واستكشاف البيانات باستخدام دفاتر Jupyter مع MongoDB. تنفيذ استعلامات NoSQL.",
      },
      tags: ["Jupyter Notebook", "MongoDB", "NoSQL", "Python"],
      github: "https://github.com/Yosr-MEDDAH/MongoDB-notebook",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Analyse de sentiment — Messagerie subliminale YouTube", en: "Sentiment Analysis — YouTube Subliminal Messaging", ar: "تحليل المشاعر — الرسائل الخفية في يوتيوب" },
      period: "Mai – Juin 2023",
      context: "ISET Radès",
      description: {
        fr: "Analyse de l'impact psychologique de messages subliminaux via extraction de milliers de commentaires YouTube (YouTube Data API + Node.js), traitement haute performance en C++ et catégorisation des sentiments utilisateurs.",
        en: "Analysis of the psychological impact of subliminal messages via extraction of thousands of YouTube comments (YouTube Data API + Node.js), high-performance C++ processing and user sentiment categorization.",
        ar: "تحليل التأثير النفسي للرسائل الخفية عبر استخراج آلاف التعليقات من YouTube ومعالجة C++ عالية الأداء.",
      },
      tags: ["Node.js", "YouTube Data API", "C++", "NLP", "Data Mining"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Yosart — Galerie d'art virtuelle immersive 360°", en: "Yosart — Immersive 360° Virtual Art Gallery", ar: "Yosart — معرض فني افتراضي 360°" },
      period: "Fév. – Mai 2023",
      context: "ISET Radès — Projet d'intégration 1",
      description: {
        fr: "Galerie virtuelle 360° reliant artistes contemporains et amateurs d'art. Visite immersive, espaces interactifs pour artistes, événements artistiques en ligne, support multilingue et sécurité renforcée pour une audience internationale.",
        en: "360° virtual gallery connecting contemporary artists and art lovers. Immersive visit, interactive spaces for artists, online artistic events, multilingual support and enhanced security for a global audience.",
        ar: "معرض افتراضي 360° يربط الفنانين بمحبي الفن. زيارة غامرة ومساحات تفاعلية متعددة اللغات.",
      },
      tags: ["Three.js", "JavaScript", "WebGL"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Unipartner — Jumelage d'étudiants", en: "Unipartner — Student Matching Platform", ar: "Unipartner — منصة توأمة الطلاب" },
      period: "2023",
      context: "ISET Radès — Projet d'intégration 2 (binôme)",
      description: {
        fr: "Application web de jumelage d'étudiants selon leurs projets de fin d'études. Les étudiants se trouvent des partenaires complémentaires en fonction de leurs compétences et thématiques de PFE.",
        en: "Web application for matching students based on their final year project topics. Students find complementary partners based on their skills and PFE themes.",
        ar: "تطبيق ويب لمطابقة الطلاب وفق مواضيع مشاريع تخرجهم.",
      },
      tags: ["Angular", "Spring Boot", "MongoDB", "Python"],
      github: "https://github.com/Yosr-MEDDAH/Unipartner",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Fraisa : Path to Home — Jeu 2D Platformer", en: "Fraisa: Path to Home — 2D Platformer", ar: "Fraisa: طريق البيت — لعبة 2D" },
      period: "Nov. – Déc. 2024",
      context: "ISAMM",
      description: {
        fr: "Jeu 2D platformer en 3 niveaux inspiré d'une histoire personnelle : ma chatte Fraisa s'est perdue, et ce jeu retrace son chemin vers la maison. Systèmes d'ennemis, d'obstacles et de progression de niveaux. Premier projet Unity. Publié sur YouTube.",
        en: "2D platformer in 3 levels inspired by a personal story: my cat Fraisa went missing, and this game traces her way home. Enemy systems, obstacles and level progression. First Unity project. Published on YouTube.",
        ar: "لعبة منصات ثنائية الأبعاد من 3 مستويات مستوحاة من قصة شخصية عن قطتي فريسة.",
      },
      tags: ["Unity", "C#", "2D Game Design"],
      github: "https://github.com/Yosr-MEDDAH/path-to-home-FRAISA-",
      demo:   "https://youtu.be/D2tdYaQoNwg?si=n4_CDtBkTvOnqfRC",
      image: "placeholder.png",
    },
    {
      title: { fr: "Histoire du monde — Application éducative pour enfants", en: "World History — Educational Children App", ar: "تاريخ العالم — تطبيق تعليمي للأطفال" },
      period: "2024",
      context: "ISAMM",
      description: {
        fr: "Application de vulgarisation historique pour enfants avec contenu multilingue dynamique, simplification automatique via LLM (Phi-2), génération automatique de quiz et synthèse vocale enfantine (Azure Speech).",
        en: "Historical popularization app for children with dynamic multilingual content, automatic LLM-based simplification (Phi-2), automatic quiz generation and child-friendly text-to-speech (Azure Speech).",
        ar: "تطبيق تعليمي تاريخي للأطفال مع محتوى متعدد اللغات، تبسيط تلقائي بالذكاء الاصطناعي وتوليف صوتي.",
      },
      tags: ["Flask", "SQLAlchemy", "Wikipedia API", "Phi-2", "Azure Speech", "Unsplash"],
      github: "https://github.com/Yosr-MEDDAH/Histoire-du-monde-enfants-",
      demo:   "",
      image: "placeholder.png",
    },
    {
      title: { fr: "Monte Carlo — Simulation comportementale féline", en: "Monte Carlo — Feline Behavioral Simulation", ar: "مونتي كارلو — محاكاة سلوك القطط" },
      period: "2025",
      context: "ISAMM — Probabilités et statistiques",
      description: {
        fr: "Simulation probabiliste Monte Carlo modélisant les interactions entre humains et une chatte (Fraisa). Analyse des probabilités d'acceptation de différentes stratégies d'interaction selon des variables stochastiques : humeur, mémoire, environnement. Visualisations statistiques : convergence, histogrammes, distributions comparées.",
        en: "Monte Carlo probabilistic simulation modeling human-cat interactions (Fraisa). Acceptance probability analysis of different interaction strategies with stochastic variables: mood, memory, environment. Statistical visualizations: convergence graphs, histograms, comparative distributions.",
        ar: "محاكاة مونتي كارلو لنمذجة التفاعلات بين الإنسان والقطة. تحليل احتمالات القبول مع متغيرات عشوائية.",
      },
      tags: ["Python", "Monte Carlo", "Statistics", "Data Visualization"],
      github: "",
      demo:   "assets/ProjetMonteCarlo/index.html",
      pdf:    "assets/ProjetMonteCarlo/RapportYosrMEDDAH1ing1.pdf",
      notebook: "assets/ProjetMonteCarlo/MonteCarloFraisa.ipynb",
      image: "placeholder.png",
    },
    {
      title: { fr: "Smart Farming — Prototype d'irrigation intelligente (ISET)", en: "Smart Farming — Intelligent Irrigation Prototype", ar: "الزراعة الذكية — نموذج ري ذكي" },
      period: "Mars – Mai 2022",
      context: "ISET Radès",
      description: {
        fr: "Prototype IoT d'arrosage automatique basé sur capteurs d'humidité du sol (MH-FC28) et DHT11 via ESP32. Transmission sans fil vers Firebase, affichage temps réel sur application Android native. Pipeline IoT complet : capteurs → connectivité → cloud → interface mobile.",
        en: "IoT auto-watering prototype using soil humidity sensor (MH-FC28) and DHT11 via ESP32. Wireless transmission to Firebase, real-time display on native Android app. Complete IoT pipeline: sensors → connectivity → cloud → mobile interface.",
        ar: "نموذج IoT للري التلقائي عبر مستشعرات الرطوبة وESP32. إرسال لاسلكي إلى Firebase وعرض فوري على تطبيق أندرويد.",
      },
      tags: ["ESP32", "Arduino IDE", "Firebase", "Android Studio", "IoT", "DHT11"],
      github: "",
      demo:   "",
      image: "placeholder.png",
    },
  ],

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
        fr: "Présentation de 2h30 sur les 11 patrons de comportement GoF (Chain of Responsibility, Observer, Mediator, State, Strategy, Template Method, Command, Memento, Visitor, Iterator, Interpreter). Thème fil rouge : ZooKeeper du Zodiaque Chinois. Activités interactives, diagrammes PlantUML, quiz HTML.",
        en: "2.5-hour presentation on all 11 GoF behavioral patterns (Chain of Responsibility, Observer, Mediator, State, Strategy, Template Method, Command, Memento, Visitor, Iterator, Interpreter). Running theme: Chinese Zodiac ZooKeeper. Interactive activities, PlantUML diagrams, HTML quiz.",
        ar: "عرض مدته 2.5 ساعة على 11 نمطًا سلوكيًا من GoF بموضوع حديقة حيوان الزودياك الصيني.",
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
      context: { fr: "ISET Radès (binôme avec Wassim Ouertani)", en: "ISET Radès (pair with Wassim Ouertani)", ar: "ISET Radès" },
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
      context: { fr: "ISET Radès (binôme avec Wassim Ouertani)", en: "ISET Radès (pair with Wassim Ouertani)", ar: "ISET Radès" },
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
      context: { fr: "ISET Radès (binôme avec Wassim Ouertani)", en: "ISET Radès (pair with Wassim Ouertani)", ar: "ISET Radès" },
      description: {
        fr: "Modèle de responsabilité partagée entre fournisseurs et clients cloud. Chiffrement des données, IAM (Identity & Access Management) et sécurité réseau.",
        en: "Shared responsibility model between cloud providers and customers. Data encryption, IAM (Identity & Access Management) and network security.",
        ar: "نموذج المسؤولية المشتركة في الحوسبة السحابية: تشفير البيانات وإدارة الهوية.",
      },
      tags: ["Cloud", "Sécurité", "IAM"],
      youtube: "",
    },
  ],

  // ── CRÉATION DE CONTENU ────────────────────────────────
  content: {
    channel: "https://www.youtube.com/playlist?list=PLJY8pFMYqReqMKaBP2oCBhlwSRz3PT3X1",
    course: {
      title: { fr: "Développer pour l'Humain et la Planète", en: "Developing for Humans and the Planet", ar: "التطوير من أجل الإنسان والكوكب" },
      description: {
        fr: "Cours progressif gratuit sur l'accessibilité web (WCAG 2.2) et l'éco-conception numérique. Projet fil rouge : Filastine, un site culturel palestinien utilisé comme démo d'audit accessibilité corrigée progressivement. Modules couverts : navigation clavier, contraste/dark mode, images accessibles, tests Playwright.",
        en: "Free progressive course on web accessibility (WCAG 2.2) and digital eco-design. Running project: Filastine, a Palestinian cultural website used as a progressively corrected accessibility audit demo. Modules: keyboard navigation, contrast/dark mode, accessible images, Playwright tests.",
        ar: "دورة تدريجية مجانية في إمكانية الوصول للويب والتصميم البيئي. مشروع تطبيقي: Filastine، موقع ثقافي فلسطيني يُستخدم كعرض توضيحي.",
      },
      github: "https://github.com/Yosr-MEDDAH/Filastine",
      modules_published: 4,
    },
  },

  // ── ARTWORKS ───────────────────────────────────────────
  artworks: [
    { title: "Peinture — Décadence Offerte",           image: "assets/OfferedDecadence-artwork.jpg" , youtube:"https://youtu.be/SnA0zi-Bqms?si=f_GLAVODaBfpoe7l", behance: "https://www.behance.net/gallery/238073733/Offered-Decadence"},
    { title: "The Curse of Wealth",                    image: "assets/artwork-TheCurseOfWealth.jpg", behance: "https://www.behance.net/gallery/241390357/The-Curse-of-Wealth" },
    { title: "The Effort Crown",                       image: "assets/artwork-TheEffortCrown.png", behance: "https://www.behance.net/gallery/241391541/The-Effort-Crown" },
    { title: "When Machines Kneel",                    image: "assets/When Machines Kneel.jpg", youtube:"https://youtu.be/iN40R1spt6I?si=lBn_28-TQvbkCQA4", behance: "https://www.behance.net/gallery/238059971/When-Machines-Kneel" },
    { title: "Calligraphie chinoise — Concours",       image: "assets/artwork-ReflectionOfTomorrow-chinese-bridge-competition.jpg", youtube:"https://youtu.be/598T_KiJzOI?si=pRZmHiZdsPZZDKpn", behance: "https://www.behance.net/gallery/241061843/Reflection-of-Tomorrow-From-Rice-Fields-to-Rockets"},
  ],

  // ── FORMATION ──────────────────────────────────────────
  education: [
    {
      degree: { fr: "Cycle Ingénieur en Sciences Appliquées et en Technologie", en: "Engineering Degree in Applied Sciences and Technology", ar: "شهادة هندسة في العلوم التطبيقية والتكنولوجيا" },
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
  ],

  // ── CERTIFICATIONS ─────────────────────────────────────
  certifications: [
    { title: "AWS Academy Cloud Foundations",                          issuer: "AWS Academy",              date: "Mai 2025" },
    { title: "JavaScript Algorithms and Data Structures (Legacy)",     issuer: "FreeCodeCamp",             date: "Mai 2025" },
    { title: "CCNA: Introduction to Networks",                         issuer: "Cisco Networking Academy", date: "Avr. 2025" },
    { title: "CCNA: Switching, Routing and Wireless Essentials",       issuer: "Cisco Networking Academy", date: "Déc. 2024" },
    { title: "NDG Linux Unhatched",                                    issuer: "Cisco",                    date: "Mai 2022" },
  ],

  // ── DISTINCTIONS ───────────────────────────────────────
  awards: [
    {
      prize: { fr: "3ᵉ Prix", en: "3rd Prize", ar: "الجائزة الثالثة" },
      event: { fr: "6ᵉ Concours tuniso-chinois de calligraphie au stylo dur", en: "6th Tunisian-Chinese Hard Pen Calligraphy Contest", ar: "المسابقة التونسية الصينية السادسة للخط بالقلم" },
      org:   "Institut Confucius — Université de Carthage",
      date:  "Fév. 2026",
    },
    {
      prize: { fr: "2ᵉ Prix (3ᵉ au classement général)", en: "2nd Prize (3rd overall)", ar: "الجائزة الثانية (الثالثة في الترتيب العام)" },
      event: { fr: "5ᵉ Concours de calligraphie chinoise", en: "5th Chinese Calligraphy Contest", ar: "المسابقة الصينية الخامسة للخط" },
      org:   "Institut Confucius — Université de Carthage",
      date:  "Fév. 2025",
    },
  ],

  // ── LANGUES ────────────────────────────────────────────
  languages: [
    { lang: "العربية",  level: "C1 — Maternelle"       },
    { lang: "Français", level: "B2"                    },
    { lang: "English",  level: "B1"                    },
    { lang: "中文",      level: "Notions — Calligraphie" },
  ],
};