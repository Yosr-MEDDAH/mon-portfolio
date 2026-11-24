import type { CardTemplateConfig, DetailTemplateConfig } from './types.ts';

export const defaultCardTemplate: CardTemplateConfig = {
  id: 'card-default',
  name: 'Standard Card',
  layout: 'grid',
  imageAspectRatio: '16/9',
};

export const defaultDetailTemplate: DetailTemplateConfig = {
  id: 'detail-default',
  name: 'Standard Detail',
};

/**
 * Pre-configured template for Research demonstration:
 * - Date is hidden in card, but visible in detail
 * - Description is visible in card, but hidden in detail
 */
export const researchCardTemplate: CardTemplateConfig = {
  id: 'research-card',
  name: 'Research Card',
  layout: 'grid',
  imageAspectRatio: '16/9',
  fieldOrder: ['coverImage', 'title', 'description', 'date', 'tags', 'externalLink'],
  templateSettings: {
    contextVisibility: {
      card: {
        date: false,
        description: true,
      },
    },
  },
};

export const researchDetailTemplate: DetailTemplateConfig = {
  id: 'research-detail',
  name: 'Research Detail',
  fieldOrder: ['coverImage', 'title', 'date', 'description', 'tags', 'externalLink'],
  templateSettings: {
    contextVisibility: {
      detail: {
        date: true,
        description: false,
      },
    },
  },
};
