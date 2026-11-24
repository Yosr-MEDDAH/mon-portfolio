import type {
  ContentTypeDefinition,
  ContentEntry,
  TemplateVisibilitySettings,
  SupportedLocale,
} from '../content-model/types.ts';

export interface CardTemplateConfig {
  id: string;
  name: string;
  fieldOrder?: string[];
  templateSettings?: TemplateVisibilitySettings;
  showTitle?: boolean;
  imageAspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  layout?: 'grid' | 'list';
}

export interface DetailTemplateConfig {
  id: string;
  name: string;
  fieldOrder?: string[];
  templateSettings?: TemplateVisibilitySettings;
  headerFields?: string[];
  mainFields?: string[];
  metaFields?: string[];
}

export interface ContentTypeRegistryEntry {
  contentType: ContentTypeDefinition;
  entries: ContentEntry[];
  cardTemplate?: CardTemplateConfig;
  detailTemplate?: DetailTemplateConfig;
  title?: string;
  description?: string;
}
