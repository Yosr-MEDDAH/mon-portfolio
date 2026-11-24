import type { ContentEntry } from '../types.ts';

export const sampleResearchEntry: ContentEntry = {
  id: 'research-quantum-safe-crypto-2026',
  contentTypeId: 'research',
  slug: 'quantum-safe-cryptography-ai-infrastructure',
  fields: {
    title: {
      en: 'Post-Quantum Cryptography in Distributed AI Infrastructure',
      fr: 'Cryptographie post-quantique dans les infrastructures IA distribuées',
      ar: 'التشفير ما بعد الكمي في البنى التحتية الموزعة للذكاء الاصطناعي',
    },
    description: {
      en: 'An in-depth investigation into lattice-based cryptographic algorithms applied to secure multi-agent communication networks and distributed computation pipelines.',
      fr: 'Une étude approfondie des algorithmes cryptographiques basés sur les réseaux euclidiens appliqués à la sécurisation des communications multi-agents et des flux de calcul distribués.',
      ar: 'دراسة متعمقة لخوارزميات التشفير المستندة إلى الشبيكات المطبقة لتأمين شبكات اتصالات الوكلاء المتعددين وخطوط الحوسبة الموزعة.',
    },
    date: '2026-04-15',
    coverImage: '/assets/images/research/quantum-crypto.webp',
    tags: ['Cryptographie', 'Post-Quantum', 'Artificial Intelligence', 'Security'],
    externalLink: 'https://arxiv.org/abs/2604.12345',
  },
  visibilityOverrides: {
    // Demonstration of visibility override: externalLink is configured as hidden on this entry
    // while its underlying value remains completely preserved in fields
    externalLink: false,
  },
};
