import publishedData from './data/published-content.json';
import { ProjectsContentType } from '../content-model/schemas/projects.ts';
import {
  researchCardTemplate,
  researchDetailTemplate,
  defaultCardTemplate,
  defaultDetailTemplate,
} from '../templates/registry.ts';
import type {
  ContentTypeRegistryEntry,
  CardTemplateConfig,
  DetailTemplateConfig,
} from '../templates/types.ts';
import type { ContentTypeDefinition, ContentEntry } from '../content-model/types.ts';

/**
 * Builds the content registry strictly from the exported CMS JSON payload.
 * NEVER falls back to sample data. Empty exports (0 entries or 0 content types) work gracefully.
 */
export function buildRegistryFromExport(
  payload: typeof publishedData
): Record<string, ContentTypeRegistryEntry> {
  const registry: Record<string, ContentTypeRegistryEntry> = {};

  const contentTypes: ContentTypeDefinition[] = Array.isArray(payload?.contentTypes)
    ? payload.contentTypes
    : [];

  // Filter entries strictly to published status
  const publishedEntries: ContentEntry[] = Array.isArray(payload?.entries)
    ? payload.entries.filter(
        (entry) => entry && (entry.status === 'published' || !entry.status)
      )
    : [];

  const templates = Array.isArray(payload?.templates) ? payload.templates : [];

  for (const ct of contentTypes) {
    if (!ct || !ct.id) continue;
    const key = ct.slug || ct.id;

    // Filter published entries belonging to this content type
    const entries = publishedEntries.filter((e) => e.contentTypeId === ct.id);

    // Resolve template configurations
    let cardTemplate: CardTemplateConfig = defaultCardTemplate;
    let detailTemplate: DetailTemplateConfig = defaultDetailTemplate;

    const matchedCard = templates.find(
      (t) => (t.id === `${ct.id}-card` || t.id === ct.id) && t.targetType === 'card'
    );
    if (matchedCard) {
      cardTemplate = {
        id: matchedCard.id,
        name: matchedCard.name,
        layout: matchedCard.layout === 'list' ? 'list' : 'grid',
        imageAspectRatio: (matchedCard.aspectRatio as any) || '16/9',
        templateSettings: matchedCard.visibilitySettings,
      };
    } else if (ct.id === 'research') {
      cardTemplate = researchCardTemplate;
    }

    const matchedDetail = templates.find(
      (t) => (t.id === `${ct.id}-detail` || t.id === ct.id) && t.targetType === 'detail'
    );
    if (matchedDetail) {
      detailTemplate = {
        id: matchedDetail.id,
        name: matchedDetail.name,
        templateSettings: matchedDetail.visibilitySettings,
      };
    } else if (ct.id === 'research') {
      detailTemplate = researchDetailTemplate;
    }

    const title = typeof ct.name === 'string' ? ct.name : ct.name?.en || key;
    const description =
      typeof ct.description === 'string' ? ct.description : ct.description?.en || '';

    registry[key] = {
      contentType: ct,
      entries,
      cardTemplate,
      detailTemplate,
      title,
      description,
    };
  }

  return registry;
}

export const contentRegistry: Record<string, ContentTypeRegistryEntry> =
  buildRegistryFromExport(publishedData);

export function getAllRegisteredCollections(
  registry: Record<string, ContentTypeRegistryEntry> = contentRegistry
): ContentTypeRegistryEntry[] {
  return Object.values(registry);
}

export function getCollectionBySlug(
  slug: string,
  registry: Record<string, ContentTypeRegistryEntry> = contentRegistry
): ContentTypeRegistryEntry | undefined {
  const directMatch = Object.values(registry).find(
    (item) => item.contentType.slug === slug || item.contentType.id === slug
  );
  if (directMatch) return directMatch;

  // Empty export safety for legacy URL compatibility (/projects.html)
  // If the export has 0 content types or missing 'projects', return an empty collection structure.
  // CRITICAL: entries is strictly EMPTY []; never falls back to sample data!
  if (slug === 'projects') {
    return {
      contentType: ProjectsContentType,
      entries: [], // Empty collection — no sample data fallback!
      cardTemplate: defaultCardTemplate,
      detailTemplate: defaultDetailTemplate,
      title: 'Projects',
      description: 'Projects and engineering implementations',
    };
  }

  return undefined;
}

export function getEntryBySlugs(
  collectionSlug: string,
  entrySlug: string,
  registry: Record<string, ContentTypeRegistryEntry> = contentRegistry
): { collection: ContentTypeRegistryEntry; entry: ContentEntry } | undefined {
  const collection = getCollectionBySlug(collectionSlug, registry);
  if (!collection) return undefined;

  const entry = collection.entries.find((e) => e.slug === entrySlug || e.id === entrySlug);
  if (!entry) return undefined;

  return { collection, entry };
}
