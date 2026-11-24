import type { ContentEntry } from '../types.ts';

export const sampleProjectEntries: ContentEntry[] = [
  {
    id: 'project-green-a11y-agent',
    contentTypeId: 'projects',
    slug: 'green-a11y-agent',
    fields: {
      title: {
        en: 'Green-A11y Agent — Final Year Project',
        fr: 'Green-A11y Agent — Projet de Fin d\'Année',
        ar: 'Green-A11y Agent — مشروع التخرج',
      },
      description: {
        en: 'Dual-audit platform evaluating WCAG 2.1 accessibility and digital carbon footprint (Sustainable Web Design model). Features a RAG conversational assistant (Llama 3.2 via Groq), automated audit engine, and CO₂ impact calculator.',
        fr: 'Plateforme intelligente d\'audit dual : accessibilité WCAG 2.1 + empreinte carbone (modèle Sustainable Web Design). Assistant conversationnel RAG (Llama 3.2/Groq), moteur d\'audit automatisé et calculateur d\'impact CO₂.',
        ar: 'منصة تدقيق مزدوجة ذكية تجمع بين إمكانية الوصول WCAG 2.1 وحساب البصمة الكربونية للويب، مع مساعد محادثة ذكي ومحرك تدقيق آلي.',
      },
      date: '2026-05-01',
      coverImage: '/assets/green-a11y-agent-screenshots/home.png',
      tags: ['React 18', 'TypeScript', 'FastAPI', 'Python', 'WCAG', 'RAG'],
      externalLink: 'https://github.com/Yosr-MEDDAH',
    },
  },
  {
    id: 'project-tweet-ir-system',
    contentTypeId: 'projects',
    slug: 'tweet-information-retrieval-system',
    fields: {
      title: {
        en: 'Tweet Information Retrieval System (TREC)',
        fr: 'Système de Recherche d\'Information sur Tweets (TREC)',
        ar: 'نظام استرجاع معلومات التغريدات (TREC)',
      },
      description: {
        en: 'Experimental information retrieval system on English tweets evaluated according to TREC campaign methodology. Compares BM25, TF-IDF, and PL2 probabilistic models across multiple token representations.',
        fr: 'Système expérimental de recherche d\'information sur tweets en anglais selon une méthodologie TREC. Évaluation et comparaison de modèles BM25, TF-IDF et PL2 sur différentes représentations textuelles.',
        ar: 'نظام استرجاع معلومات تجريبي على تغريدات باللغة الإنجليزية وفق منهجية حملات TREC مع مقارنة نماذج احتمالية متعددة.',
      },
      date: '2026-04-15',
      coverImage: '/placeholder.png',
      tags: ['Python', 'PyTerrier', 'BM25', 'TF-IDF', 'NLP', 'Data Science'],
      externalLink: 'https://github.com/Yosr-MEDDAH',
    },
  },
  {
    id: 'project-smartfarm-iot',
    contentTypeId: 'projects',
    slug: 'smartfarm-iot-greenhouse',
    fields: {
      title: {
        en: 'SmartFarm IoT — Connected Smart Greenhouse',
        fr: 'SmartFarm IoT — Serre intelligente Jenin',
        ar: 'SmartFarm IoT — دفيئة ذكية متصلة',
      },
      description: {
        en: 'End-to-end IoT automation system for smart greenhouses. Features automatic soil-moisture irrigation, fire detection, PIR motion intrusion capture with ESP32-CAM, and remote mobile telemetry via Flutter/Blynk.',
        fr: 'Système IoT complet pour l\'automatisation d\'une serre agricole connectée : arrosage automatique, détection incendie, surveillance d\'intrusion avec caméra ESP32-CAM et télémétrie Flutter/Blynk.',
        ar: 'نظام إنترنت الأشياء متكامل لأتمتة الدفيئات الزراعية الذكية مع ري آلي ومراقبة أمنية بالصور وتحكم عن بعد عبر تطبيق فلاتر.',
      },
      date: '2026-03-20',
      coverImage: '/assets/iot3-jenin.jpeg',
      tags: ['Arduino', 'ESP32-CAM', 'Flutter', 'IoT', 'C++', 'UART'],
      externalLink: 'https://github.com/Yosr-MEDDAH',
    },
  },
];
