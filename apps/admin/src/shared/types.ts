export type SupportedLocale = 'en' | 'fr' | 'ar';

export type Localized<T = string> = {
  en: T;
  fr: T;
  ar: T;
};

export type PartialLocalized<T = string> = {
  en?: T;
  fr?: T;
  ar?: T;
};

export type StandardFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'boolean'
  | 'url'
  | 'image'
  | 'gallery'
  | 'richtext'
  | 'tags'
  | 'media';

export interface GalleryImageItem {
  url: string;
  caption?: Localized<string> | PartialLocalized<string> | string;
  alt?: Localized<string> | PartialLocalized<string> | string;
}

// Prepared future field types (extensible architecture)
export type FutureFieldType =
  | 'number'
  | 'email'
  | 'select'
  | 'multi-select'
  | 'repeater'
  | 'group'
  | 'relationship'
  | 'location'
  | 'file';

export type FieldType = StandardFieldType | FutureFieldType;

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

export interface FieldDefinition {
  key: string;
  name: Localized<string> | string;
  description?: Localized<string> | string;
  type: FieldType;
  required?: boolean;
  localized?: boolean;
  defaultVisible?: boolean | Partial<Record<RenderingContext, boolean>>;
  options?: {
    choices?: Array<{ value: string; label: Localized<string> | string }>;
    min?: number;
    max?: number;
    targetCollection?: string; // For relationship
    subFields?: FieldDefinition[]; // For repeater/group
    acceptedTypes?: string[];
  };
}

export interface ContentTypeDefinition {
  id: string; // Stable content type ID (e.g. 'research', 'projects')
  name: Localized<string> | string;
  description?: Localized<string> | string;
  slug: string;
  fields: FieldDefinition[];
  defaultVisibility?: Record<string, boolean>;
  contextDefaultVisibility?: ContextVisibilityMap;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EntryStatus = 'draft' | 'published' | 'archived';

export interface ContentEntry {
  id: string; // Stable entry ID
  contentTypeId: string; // References ContentTypeDefinition.id
  slug: string;
  status?: EntryStatus;
  fields: Record<string, unknown>;
  visibilityOverrides?: Record<string, boolean>; // Global overrides
  contextVisibilityOverrides?: ContextVisibilityMap; // Context-specific overrides
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  authorUid?: string;
}

// Media library item
export interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  externalUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'pdf' | 'notebook' | 'linkedin' | 'external' | 'other';
  altText: Localized<string>;
  captions: Localized<string>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isAwaitingPublication?: boolean;
}

// Revision tracking
export interface Revision {
  id: string;
  entityType: 'contentType' | 'entry' | 'media' | 'settings' | 'template';
  entityId: string;
  revisionNumber: number;
  authorUid: string;
  authorEmail: string;
  timestamp: string;
  note?: string;
  snapshot: Record<string, unknown>;
}

// Template preset definition
export interface TemplateDefinition {
  id: string;
  name: string;
  targetType: 'card' | 'detail' | 'section';
  layout: 'grid' | 'list' | 'single';
  aspectRatio: string;
  description: string;
  visibilitySettings?: TemplateVisibilitySettings;
  createdAt?: string;
  updatedAt?: string;
}

// Admin user
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor';
  isActive: boolean;
  createdAt: string;
}

// Profile & Homepage settings
export interface ProfileSettings {
  name: string;
  title: Partial<Record<SupportedLocale, string>>;
  bio: Partial<Record<SupportedLocale, string>>;
  cvUrl: Partial<Record<SupportedLocale, string>>;
  email: string;
  phone: string;
  location: string;
  socials: {
    github?: string;
    linkedin?: string;
    behance?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  contactLabels?: {
    heading?: Partial<Record<SupportedLocale, string>>;
    subheading?: Partial<Record<SupportedLocale, string>>;
  };
}

// Site settings
export interface SiteSettings {
  siteTitle: Localized<string>;
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  maintenanceMode: boolean;
  seoDefaults: {
    metaTitle: Localized<string>;
    metaDescription: Localized<string>;
  };
  profile?: ProfileSettings;
}

// Activity log
export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  userEmail: string;
  timestamp: string;
}
