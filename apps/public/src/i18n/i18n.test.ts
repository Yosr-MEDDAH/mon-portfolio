import { DEFAULT_LOCALE, LOCALES, LOCALE_CONFIGS } from './types.ts';
import { t, resolveLocalized, getEquivalentRoute } from './utils.ts';
import { contentRegistry } from '../content-store/index.ts';
import { validateContentType, validateEntry } from '../content-model/validation.ts';
import { ProjectsContentType } from '../content-model/schemas/projects.ts';
import { sampleProjectEntries } from '../content-model/entries/sample-projects.ts';

export function runI18nTests() {
  console.log('=== Running Internationalization & Legacy Tests ===\n');

  // 1. Check default locale and configs
  console.log('1. Checking locale configs and text directions...');
  if (DEFAULT_LOCALE !== 'en') {
    throw new Error(`Expected DEFAULT_LOCALE to be 'en', got '${DEFAULT_LOCALE}'`);
  }
  if (LOCALE_CONFIGS.ar.dir !== 'rtl') {
    throw new Error(`Expected Arabic dir to be 'rtl', got '${LOCALE_CONFIGS.ar.dir}'`);
  }
  if (LOCALE_CONFIGS.en.dir !== 'ltr' || LOCALE_CONFIGS.fr.dir !== 'ltr') {
    throw new Error('Expected English and French dir to be ltr');
  }
  console.log('✓ English is default; Arabic is RTL; English/French are LTR.');

  // 2. Fallback testing
  console.log('2. Checking English translation fallback mechanism...');
  // Test missing key in fr/ar falls back to en
  const fallbackVal = resolveLocalized({ en: 'English Only Text' }, 'fr');
  if (fallbackVal !== 'English Only Text') {
    throw new Error(`Expected English fallback, got '${fallbackVal}'`);
  }
  const fallbackValAr = resolveLocalized({ en: 'English Only Text' }, 'ar');
  if (fallbackValAr !== 'English Only Text') {
    throw new Error(`Expected English fallback for Arabic, got '${fallbackValAr}'`);
  }
  console.log('✓ Missing translations correctly fall back to English.');

  // 3. Language switcher URL preservation
  console.log('3. Checking URL preservation across language switching...');
  // From legacy projects.html to fr / ar
  const frProjects = getEquivalentRoute('/mon-portfolio/projects.html', 'fr');
  const arProjects = getEquivalentRoute('/mon-portfolio/projects.html', 'ar');
  if (!frProjects.endsWith('/fr/projects/index.html')) {
    throw new Error(`Expected fr/projects/index.html, got ${frProjects}`);
  }
  if (!arProjects.endsWith('/ar/projects/index.html')) {
    throw new Error(`Expected ar/projects/index.html, got ${arProjects}`);
  }

  // From French detail page to English and Arabic
  const frDetailPath = '/mon-portfolio/fr/research/quantum-safe-cryptography-ai-infrastructure.html';
  const enDetail = getEquivalentRoute(frDetailPath, 'en');
  const arDetail = getEquivalentRoute(frDetailPath, 'ar');
  if (!enDetail.endsWith('/research/quantum-safe-cryptography-ai-infrastructure.html')) {
    throw new Error(`Expected English detail route, got ${enDetail}`);
  }
  if (!arDetail.endsWith('/ar/research/quantum-safe-cryptography-ai-infrastructure.html')) {
    throw new Error(`Expected Arabic detail route, got ${arDetail}`);
  }

  // From root home to French home
  const frHome = getEquivalentRoute('/mon-portfolio/index.html', 'fr');
  const arHome = getEquivalentRoute('/mon-portfolio/index.html', 'ar');
  if (!frHome.endsWith('/fr/index.html') || !arHome.endsWith('/ar/index.html')) {
    throw new Error('Home route preservation failed');
  }
  console.log('✓ Language selector accurately preserves current content pages across languages.');

  // 4. Projects collection verification in schema & registry
  console.log('4. Validating Projects content type schema and entries...');
  const validatedProjectsType = validateContentType(ProjectsContentType);
  if (!validatedProjectsType || validatedProjectsType.id !== 'projects') {
    throw new Error('ProjectsContentType schema validation failed');
  }

  for (const entry of sampleProjectEntries) {
    const validatedEntry = validateEntry(ProjectsContentType, entry);
    if (!validatedEntry) {
      throw new Error(`Project entry ${entry.id} failed validation`);
    }
  }
  if (!contentRegistry.projects) {
    throw new Error('Projects collection not registered in contentRegistry');
  }
  console.log(`✓ Projects schema valid; all ${sampleProjectEntries.length} project entries verified.`);

  console.log('\n=== All i18n & Legacy Tests Passed Successfully ===');
}

runI18nTests();
