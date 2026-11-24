export type SupportedLocale = 'en' | 'fr' | 'ar';

export type Localized<T> = {
  en: T;
  fr: T;
  ar: T;
};

export type PartialLocalized<T> = {
  en?: T;
  fr?: T;
  ar?: T;
};

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'boolean'
  | 'url'
  | 'image'
  | 'richtext'
  | 'tags'
  | 'media';

export type RenderingContext = 'card' | 'detail' | 'section';

export type ContextVisibilityMap = Partial<Record<RenderingContext, Record<string, boolean>>>;

export type TemplateVisibilitySettings =
  | Record<string, boolean>
  | {
      visibility?: Record<string, boolean>;
      contextVisibility?: ContextVisibilityMap;
      [key: string]: unknown;
    };

export interface VisibilityOptions {
  context?: RenderingContext;
  templateSettings?: TemplateVisibilitySettings;
}

export interface MediaValue {
  url: string;
  type?: 'image' | 'video' | 'audio' | 'document' | 'other';
  title?: string;
  mimeType?: string;
}

export interface ImageValue {
  url: string;
  alt?: string;
  caption?: string;
}

export interface FieldDefinition {
  key: string;
  name: Localized<string> | string;
  description?: Localized<string> | string;
  type: FieldType;
  required?: boolean;
  localized?: boolean;
  defaultVisible?: boolean | Partial<Record<RenderingContext, boolean>>;
}

export interface VisibilitySettings {
  defaultVisibility: Record<string, boolean>;
  contextDefaultVisibility?: ContextVisibilityMap;
}

export interface ContentTypeDefinition {
  id: string; // Stable content type ID (e.g. 'research')
  name: Localized<string> | string;
  description?: Localized<string> | string;
  slug: string;
  fields: FieldDefinition[];
  defaultVisibility?: Record<string, boolean>;
  contextDefaultVisibility?: ContextVisibilityMap;
}

export interface ContentEntry {
  id: string; // Stable entry ID
  contentTypeId: string; // References ContentTypeDefinition.id
  slug: string;
  fields: Record<string, unknown>;
  visibilityOverrides?: Record<string, boolean>; // Global field-level visibility overrides
  contextVisibilityOverrides?: ContextVisibilityMap; // Context-specific field visibility overrides
}
