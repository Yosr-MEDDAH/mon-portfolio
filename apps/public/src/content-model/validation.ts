import { z } from 'zod';
import type {
  ContentTypeDefinition,
  ContentEntry,
  FieldDefinition,
  FieldType,
  RenderingContext,
  SupportedLocale,
} from './types.ts';

export const SupportedLocaleSchema = z.enum(['en', 'fr', 'ar']);

export const RenderingContextSchema = z.enum(['card', 'detail', 'section']);

export function createLocalizedSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    en: valueSchema,
    fr: valueSchema,
    ar: valueSchema,
  });
}

export function createPartialLocalizedSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    en: valueSchema.optional(),
    fr: valueSchema.optional(),
    ar: valueSchema.optional(),
  });
}

export const ImageValueSchema = z.union([
  z.string().trim().min(1),
  z.object({
    url: z.string().trim().min(1),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }),
]);

export const MediaValueSchema = z.union([
  z.string().trim().min(1),
  z.object({
    url: z.string().trim().min(1),
    type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
    title: z.string().optional(),
    mimeType: z.string().optional(),
  }),
]);

export const FieldTypeSchema = z.enum([
  'text',
  'textarea',
  'date',
  'boolean',
  'url',
  'image',
  'richtext',
  'tags',
  'media',
]);

export const FieldDefinitionSchema = z.object({
  key: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Field key must be alphanumeric, hyphen, or underscore'),
  name: z.union([z.string().min(1), createLocalizedSchema(z.string().min(1))]),
  description: z.union([z.string(), createLocalizedSchema(z.string())]).optional(),
  type: FieldTypeSchema,
  required: z.boolean().optional().default(false),
  localized: z.boolean().optional().default(false),
  defaultVisible: z
    .union([z.boolean(), z.record(RenderingContextSchema, z.boolean())])
    .optional()
    .default(true),
});

export const ContentTypeDefinitionSchema = z.object({
  id: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.union([z.string().min(1), createLocalizedSchema(z.string().min(1))]),
  description: z.union([z.string(), createLocalizedSchema(z.string())]).optional(),
  slug: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  fields: z.array(FieldDefinitionSchema).min(1),
  defaultVisibility: z.record(z.string(), z.boolean()).optional(),
  contextDefaultVisibility: z
    .record(RenderingContextSchema, z.record(z.string(), z.boolean()))
    .optional(),
});

/**
 * Builds a base Zod schema for a specific FieldType.
 */
export function getBaseFieldSchema(type: FieldType, isRequired: boolean): z.ZodTypeAny {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      return isRequired ? z.string().trim().min(1, 'Field cannot be empty') : z.string().trim();
    case 'date':
      return z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format (must be parseable date string)',
      });
    case 'boolean':
      return z.boolean();
    case 'url':
      return z.string().url('Must be a valid URL');
    case 'image':
      return ImageValueSchema;
    case 'tags':
      return isRequired
        ? z.array(z.string().trim().min(1)).min(1, 'At least one tag is required')
        : z.array(z.string().trim().min(1));
    case 'media':
      return MediaValueSchema;
    default:
      return z.unknown();
  }
}

/**
 * Generates the Zod schema for an individual field definition,
 * taking into account whether it is localized and required.
 */
export function createFieldZodSchema(field: FieldDefinition): z.ZodTypeAny {
  const isRequired = field.required ?? false;
  const isLocalized = field.localized ?? false;

  const baseSchema = getBaseFieldSchema(field.type, isRequired);

  let schema: z.ZodTypeAny;

  if (isLocalized) {
    schema = createLocalizedSchema(baseSchema);
  } else {
    schema = baseSchema;
  }

  if (!isRequired) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Dynamically builds a Zod validator for entries of a given ContentTypeDefinition.
 */
export function createEntryZodSchema(contentType: ContentTypeDefinition) {
  // Validate that the content type definition itself is valid
  ContentTypeDefinitionSchema.parse(contentType);

  const fieldsShape: Record<string, z.ZodTypeAny> = {};
  for (const field of contentType.fields) {
    fieldsShape[field.key] = createFieldZodSchema(field);
  }

  return z.object({
    id: z.string().min(1, 'Entry ID is required'),
    contentTypeId: z.literal(contentType.id),
    slug: z.string().min(1, 'Entry slug is required').regex(/^[a-zA-Z0-9_-]+$/),
    fields: z.object(fieldsShape),
    visibilityOverrides: z.record(z.string(), z.boolean()).optional(),
    contextVisibilityOverrides: z
      .record(RenderingContextSchema, z.record(z.string(), z.boolean()))
      .optional(),
  });
}

/**
 * Validates a ContentTypeDefinition.
 */
export function validateContentType(contentType: unknown): ContentTypeDefinition {
  return ContentTypeDefinitionSchema.parse(contentType) as ContentTypeDefinition;
}

/**
 * Validates a ContentEntry against a ContentTypeDefinition.
 */
export function validateEntry(
  contentType: ContentTypeDefinition,
  rawEntry: unknown
): ContentEntry {
  const schema = createEntryZodSchema(contentType);
  return schema.parse(rawEntry) as ContentEntry;
}
