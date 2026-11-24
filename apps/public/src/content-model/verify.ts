import { ResearchContentType } from './schemas/research.ts';
import { sampleResearchEntry } from './entries/sample-research.ts';
import {
  validateContentType,
  validateEntry,
} from './validation.ts';
import {
  isFieldVisible,
  resolveVisibility,
  getVisibleFieldValues,
} from './visibility.ts';

function runVerifications() {
  console.log('--- Starting Content Model Verification ---');

  // 1. Verify Research schema validity
  console.log('1. Validating Research content type schema...');
  const validatedType = validateContentType(ResearchContentType);
  if (!validatedType || validatedType.id !== 'research') {
    throw new Error('ResearchContentType validation failed');
  }
  console.log('✓ Research schema is valid.');

  // 2. Verify sample entry passes validation
  console.log('2. Validating sample Research entry against schema...');
  const validatedEntry = validateEntry(ResearchContentType, sampleResearchEntry);
  if (!validatedEntry || validatedEntry.id !== sampleResearchEntry.id) {
    throw new Error('Sample Research entry validation failed');
  }
  console.log('✓ Sample entry passes validation.');

  // 3. Verify invalid required fields are rejected
  console.log('3. Verifying that missing/invalid required fields are rejected...');
  let rejectedCount = 0;

  // Test 3a: Missing required localized language
  try {
    const invalidEntry = {
      ...sampleResearchEntry,
      fields: {
        ...sampleResearchEntry.fields,
        title: {
          en: 'Title in English',
          fr: 'Titre en français',
          // ar is missing!
        },
      },
    };
    validateEntry(ResearchContentType, invalidEntry);
  } catch (err) {
    rejectedCount++;
    console.log('✓ Correctly rejected missing Arabic localized title.');
  }

  // Test 3b: Invalid URL
  try {
    const invalidEntry = {
      ...sampleResearchEntry,
      fields: {
        ...sampleResearchEntry.fields,
        externalLink: 'not-a-valid-url',
      },
    };
    validateEntry(ResearchContentType, invalidEntry);
  } catch (err) {
    rejectedCount++;
    console.log('✓ Correctly rejected invalid externalLink URL.');
  }

  // Test 3c: Invalid date
  try {
    const invalidEntry = {
      ...sampleResearchEntry,
      fields: {
        ...sampleResearchEntry.fields,
        date: 'invalid-date-string',
      },
    };
    validateEntry(ResearchContentType, invalidEntry);
  } catch (err) {
    rejectedCount++;
    console.log('✓ Correctly rejected invalid date string.');
  }

  // Test 3d: Empty required field
  try {
    const invalidEntry = {
      ...sampleResearchEntry,
      fields: {
        ...sampleResearchEntry.fields,
        coverImage: '   ',
      },
    };
    validateEntry(ResearchContentType, invalidEntry);
  } catch (err) {
    rejectedCount++;
    console.log('✓ Correctly rejected empty required coverImage.');
  }

  if (rejectedCount !== 4) {
    throw new Error(`Expected 4 rejection tests to pass, but got ${rejectedCount}`);
  }
  console.log('✓ All invalid required fields correctly rejected.');

  // 4. Verify visibility configuration behavior
  console.log('4. Verifying visibility settings behavior...');
  // Default on content type is true for externalLink, but sampleResearchEntry overrides it to false
  const isExtLinkVisible = isFieldVisible(ResearchContentType, sampleResearchEntry, 'externalLink');
  const isTitleVisible = isFieldVisible(ResearchContentType, sampleResearchEntry, 'title');

  if (isExtLinkVisible !== false) {
    throw new Error('Expected externalLink visibility override to be false');
  }
  if (isTitleVisible !== true) {
    throw new Error('Expected title visibility to default to true');
  }

  const visibilityMap = resolveVisibility(ResearchContentType, sampleResearchEntry);
  if (visibilityMap.externalLink !== false || visibilityMap.title !== true) {
    throw new Error('Visibility resolution map mismatch');
  }

  const visibleValues = getVisibleFieldValues(ResearchContentType, sampleResearchEntry);
  if ('externalLink' in visibleValues) {
    throw new Error('Hidden field externalLink should not be present in visibleValues');
  }

  // Crucial check: Underlying values must NOT be deleted or removed from entry.fields
  if (!sampleResearchEntry.fields.externalLink || sampleResearchEntry.fields.externalLink !== 'https://arxiv.org/abs/2604.12345') {
    throw new Error('CRITICAL: Underlying field value was deleted or altered in sampleResearchEntry.fields!');
  }
  console.log('✓ Visibility overrides work properly and preserve underlying field values without removal.');

  console.log('--- All Content Model Verifications Passed Successfully ---');
}

runVerifications();
