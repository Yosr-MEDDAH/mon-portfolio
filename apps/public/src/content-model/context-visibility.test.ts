import { ResearchContentType } from './schemas/research.ts';
import { sampleResearchEntry } from './entries/sample-research.ts';
import {
  isFieldVisible,
  resolveVisibility,
  getVisibleFieldValues,
} from './visibility.ts';
import type {
  ContentTypeDefinition,
  ContentEntry,
  TemplateVisibilitySettings,
} from './types.ts';

export function runContextVisibilityTests() {
  console.log('=== Running Context-Aware Visibility Tests ===\n');

  // --- 1. Demonstration Requirements ---
  console.log('1. Testing minimal demonstration requirements...');

  // Setup template settings for card and detail
  const demonstrationTemplateSettings: TemplateVisibilitySettings = {
    contextVisibility: {
      card: {
        date: false,
        description: true,
        tags: false, // will be overridden by entry override
      },
      detail: {
        date: true,
        description: false,
      },
      section: {
        date: true,
        description: true,
      },
    },
  };

  // Entry with override taking precedence over template setting (tags: true in card)
  const demoEntry: ContentEntry = {
    ...sampleResearchEntry,
    contextVisibilityOverrides: {
      card: {
        tags: true, // Overrides template setting (tags: false)
      },
    },
  };

  // Check 1: Date hidden in card
  const cardDateVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'date',
    'card',
    demonstrationTemplateSettings
  );
  if (cardDateVisible !== false) {
    throw new Error(`Expected date to be hidden in card, but got ${cardDateVisible}`);
  }
  console.log('✓ Date is hidden in card context.');

  // Check 2: Date visible in detail
  const detailDateVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'date',
    'detail',
    demonstrationTemplateSettings
  );
  if (detailDateVisible !== true) {
    throw new Error(`Expected date to be visible in detail, but got ${detailDateVisible}`);
  }
  console.log('✓ Date is visible in detail context.');

  // Check 3: Description visible in card
  const cardDescVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'description',
    'card',
    demonstrationTemplateSettings
  );
  if (cardDescVisible !== true) {
    throw new Error(`Expected description to be visible in card, but got ${cardDescVisible}`);
  }
  console.log('✓ Description is visible in card context.');

  // Check 4: Description hidden in detail
  const detailDescVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'description',
    'detail',
    demonstrationTemplateSettings
  );
  if (detailDescVisible !== false) {
    throw new Error(`Expected description to be hidden in detail, but got ${detailDescVisible}`);
  }
  console.log('✓ Description is hidden in detail context.');

  // Check 5: Entry-level override taking precedence over template setting
  // Template set tags to false in card, but entry override set tags to true in card
  const cardTagsVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'tags',
    'card',
    demonstrationTemplateSettings
  );
  if (cardTagsVisible !== true) {
    throw new Error(
      `Expected entry override (tags: true) to take precedence over template setting (tags: false), got ${cardTagsVisible}`
    );
  }
  console.log('✓ Entry-level override takes precedence over template setting.');

  // Check 6: Original entry data remaining unchanged
  if (
    sampleResearchEntry.fields.date !== '2026-04-15' ||
    typeof sampleResearchEntry.fields.description !== 'object' ||
    !Array.isArray(sampleResearchEntry.fields.tags) ||
    sampleResearchEntry.fields.externalLink !== 'https://arxiv.org/abs/2604.12345'
  ) {
    throw new Error('Original sampleResearchEntry was mutated!');
  }
  console.log('✓ Original entry data remains completely unmutated.');

  // --- 2. Testing Each Rendering Context (card, detail, section) ---
  console.log('\n2. Testing all required rendering contexts (card, detail, section)...');
  const sectionDateVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'date',
    'section',
    demonstrationTemplateSettings
  );
  const sectionDescVisible = isFieldVisible(
    ResearchContentType,
    demoEntry,
    'description',
    'section',
    demonstrationTemplateSettings
  );
  if (sectionDateVisible !== true || sectionDescVisible !== true) {
    throw new Error('Expected date and description to be visible in section context');
  }
  console.log('✓ Contexts card, detail, and section resolve correctly and independently.');

  // --- 3. Testing Complete Override Priority: entry > template > content-type ---
  console.log('\n3. Testing complete override priority chain (entry > template > content-type)...');
  const customContentType: ContentTypeDefinition = {
    id: 'test-priority',
    name: 'Test Priority',
    slug: 'test-priority',
    fields: [
      { key: 'f1', name: 'F1', type: 'text' },
      { key: 'f2', name: 'F2', type: 'text' },
      { key: 'f3', name: 'F3', type: 'text' },
    ],
    contextDefaultVisibility: {
      card: {
        f1: false, // Content-type default is false
        f2: false, // Content-type default is false
        f3: false, // Content-type default is false
      },
    },
  };

  const priorityTemplate: TemplateVisibilitySettings = {
    contextVisibility: {
      card: {
        f2: true, // Template setting overrides content-type default (false -> true)
        f3: true, // Template setting sets to true
      },
    },
  };

  const priorityEntry: ContentEntry = {
    id: 'priority-entry-1',
    contentTypeId: 'test-priority',
    slug: 'priority-entry-1',
    fields: { f1: 'val1', f2: 'val2', f3: 'val3' },
    contextVisibilityOverrides: {
      card: {
        f3: false, // Entry override overrides template setting (true -> false)
      },
    },
  };

  // f1: Content-type default (false) should apply since template and entry didn't set it
  const f1 = isFieldVisible(customContentType, priorityEntry, 'f1', 'card', priorityTemplate);
  if (f1 !== false) throw new Error(`f1 should be false from content-type default, got ${f1}`);

  // f2: Template setting (true) should override content-type default (false)
  const f2 = isFieldVisible(customContentType, priorityEntry, 'f2', 'card', priorityTemplate);
  if (f2 !== true) throw new Error(`f2 should be true from template setting, got ${f2}`);

  // f3: Entry override (false) should override template setting (true)
  const f3 = isFieldVisible(customContentType, priorityEntry, 'f3', 'card', priorityTemplate);
  if (f3 !== false) throw new Error(`f3 should be false from entry override, got ${f3}`);

  console.log('✓ Priority chain verified: entry override > template setting > content-type default.');

  // --- 4. Testing Context Isolation ---
  console.log('\n4. Testing context isolation...');
  const isolatedEntry: ContentEntry = {
    id: 'isolated-entry',
    contentTypeId: 'research',
    slug: 'isolated-entry',
    fields: { ...sampleResearchEntry.fields },
    contextVisibilityOverrides: {
      card: { coverImage: false }, // only card
    },
  };

  const cardImage = isFieldVisible(ResearchContentType, isolatedEntry, 'coverImage', 'card');
  const detailImage = isFieldVisible(ResearchContentType, isolatedEntry, 'coverImage', 'detail');
  const sectionImage = isFieldVisible(ResearchContentType, isolatedEntry, 'coverImage', 'section');

  if (cardImage !== false) throw new Error('coverImage should be false in card');
  if (detailImage !== true) throw new Error('coverImage should be true in detail');
  if (sectionImage !== true) throw new Error('coverImage should be true in section');
  console.log('✓ Context isolation verified: settings in card do not leak into detail or section.');

  // --- 5. Testing Preservation of Original Values in getVisibleFieldValues ---
  console.log('\n5. Testing preservation of underlying values during projection...');
  const visibleInCard = getVisibleFieldValues(
    ResearchContentType,
    demoEntry,
    'card',
    demonstrationTemplateSettings
  );
  if ('date' in visibleInCard) {
    throw new Error('date should not be present in visible fields for card');
  }
  if (!('description' in visibleInCard)) {
    throw new Error('description should be present in visible fields for card');
  }
  if (demoEntry.fields.date !== '2026-04-15') {
    throw new Error('demoEntry.fields.date was mutated!');
  }
  console.log('✓ getVisibleFieldValues projects visible fields without altering entry.fields.');

  // --- 6. Testing Backwards Compatibility ---
  console.log('\n6. Testing backwards compatibility with existing visibility calls...');
  // sampleResearchEntry has visibilityOverrides: { externalLink: false }
  const legacyExternalLink = isFieldVisible(ResearchContentType, sampleResearchEntry, 'externalLink');
  const legacyTitle = isFieldVisible(ResearchContentType, sampleResearchEntry, 'title');

  if (legacyExternalLink !== false) {
    throw new Error(`Legacy call failed: expected externalLink to be false, got ${legacyExternalLink}`);
  }
  if (legacyTitle !== true) {
    throw new Error(`Legacy call failed: expected title to be true, got ${legacyTitle}`);
  }

  const legacyMap = resolveVisibility(ResearchContentType, sampleResearchEntry);
  if (legacyMap.externalLink !== false || legacyMap.title !== true) {
    throw new Error('Legacy resolveVisibility call failed');
  }
  console.log('✓ Backwards compatibility with legacy 3-argument calls verified.');

  console.log('\n=== All Context-Aware Visibility Tests Passed Successfully ===');
}

runContextVisibilityTests();
