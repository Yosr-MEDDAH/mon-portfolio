import { z } from 'zod';
import type {
  ContentTypeDefinition,
  ContentEntry,
  FieldDefinition,
  FieldType,
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
  z.string().trim().min(1, 'Image path or URL cannot be empty'),
  z.object({
    url: z.string().trim().min(1, 'Image URL cannot be empty'),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }),
]);

export const MediaValueSchema = z.union([
  z.string().trim().min(1, 'Media URL cannot be empty'),
  z.object({
    url: z.string().trim().min(1, 'Media URL cannot be empty'),
    type: z.enum(['image', 'video', 'audio', 'pdf', 'notebook', 'linkedin', 'document', 'other']).optional(),
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
  'number',
  'email',
  'select',
  'multi-select',
  'repeater',
  'group',
  'relationship',
  'location',
  'file',
]);

export const ContextVisibilityMapSchema = z.object({
  card: z.record(z.string(), z.boolean()).optional(),
  detail: z.record(z.string(), z.boolean()).optional(),
  section: z.record(z.string(), z.boolean()).optional(),
});

export const FieldDefinitionSchema = z.object({
  key: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Field key must be alphanumeric, hyphen, or underscore'),
  name: z.union([
    z.string().min(1),
    createLocalizedSchema(z.string().min(1)),
    createPartialLocalizedSchema(z.string().min(1)),
  ]),
  description: z.union([
    z.string(),
    createLocalizedSchema(z.string()),
    createPartialLocalizedSchema(z.string()),
  ]).optional(),
  type: FieldTypeSchema,
  required: z.boolean().optional().default(false),
  localized: z.boolean().optional().default(false),
  defaultVisible: z
    .union([z.boolean(), z.record(z.string(), z.boolean())])
    .optional()
    .default(true),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const ContentTypeDefinitionSchema = z.object({
  id: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.union([
    z.string().min(1),
    createLocalizedSchema(z.string().min(1)),
    createPartialLocalizedSchema(z.string().min(1)),
  ]),
  description: z.union([
    z.string(),
    createLocalizedSchema(z.string()),
    createPartialLocalizedSchema(z.string()),
  ]).optional(),
  slug: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  fields: z.array(FieldDefinitionSchema).min(1),
  defaultVisibility: z.record(z.string(), z.boolean()).optional(),
  contextDefaultVisibility: ContextVisibilityMapSchema.optional(),
  isArchived: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function normalizeEntryFields(
  contentType: ContentTypeDefinition,
  rawFields: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...rawFields };

  for (const field of contentType.fields) {
    const val = normalized[field.key];

    if (!field.required) {
      // 1. Boolean field: strictly preserve boolean false and true!
      if (field.type === 'boolean') {
        if (typeof val === 'boolean') {
          normalized[field.key] = val;
        } else if (val === '' || val === null || val === undefined) {
          normalized[field.key] = undefined;
        }
        continue;
      }

      // 2. Localized field
      if (field.localized) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          const loc = val as Record<string, unknown>;
          const enEmpty = !loc.en || typeof loc.en !== 'string' || loc.en.trim() === '';
          const frEmpty = !loc.fr || typeof loc.fr !== 'string' || loc.fr.trim() === '';
          const arEmpty = !loc.ar || typeof loc.ar !== 'string' || loc.ar.trim() === '';
          if (enEmpty && frEmpty && arEmpty) {
            normalized[field.key] = undefined;
          }
        } else if (val === '' || val === null || val === undefined) {
          normalized[field.key] = undefined;
        }
        continue;
      }

      // 3. Tags field
      if (field.type === 'tags') {
        if (Array.isArray(val)) {
          const cleaned = val.map((s) => (typeof s === 'string' ? s.trim() : String(s))).filter(Boolean);
          normalized[field.key] = cleaned.length > 0 ? cleaned : undefined;
        } else if (val === '' || val === null || val === undefined) {
          normalized[field.key] = undefined;
        }
        continue;
      }

      // 4. String-based optional fields (url, date, image, text, textarea, etc.)
      if (typeof val === 'string') {
        if (val.trim() === '') {
          normalized[field.key] = undefined;
        } else {
          normalized[field.key] = val.trim();
        }
        continue;
      }

      if (val === null) {
        normalized[field.key] = undefined;
        continue;
      }
    }
  }

  return normalized;
}

export function getBaseFieldSchema(type: FieldType, isRequired: boolean): z.ZodTypeAny {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      return isRequired
        ? z.string().trim().min(1, 'Field cannot be empty')
        : z.union([z.string(), z.null(), z.undefined()]).optional();

    case 'date':
      return isRequired
        ? z.string().trim().min(1, 'Date is required').refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format (must be parseable date string)',
          })
        : z.union([
            z.string().trim().min(1).refine((val) => !isNaN(Date.parse(val)), {
              message: 'Invalid date format (must be parseable date string)',
            }),
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'boolean':
      return isRequired
        ? z.boolean()
        : z.union([z.boolean(), z.null(), z.undefined()]).optional();

    case 'url':
      return isRequired
        ? z.string().trim().min(1, 'URL is required').url('Must be a valid URL')
        : z.union([
            z.string().trim().url('Must be a valid URL'),
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'image':
      return isRequired
        ? ImageValueSchema
        : z.union([
            ImageValueSchema,
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'tags':
      return isRequired
        ? z.array(z.string().trim().min(1)).min(1, 'At least one tag is required')
        : z.union([
            z.array(z.string().trim().min(1)),
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'media':
      return isRequired
        ? MediaValueSchema
        : z.union([
            MediaValueSchema,
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'number':
      return isRequired
        ? z.number()
        : z.union([z.number(), z.null(), z.undefined()]).optional();

    case 'email':
      return isRequired
        ? z.string().trim().min(1, 'Email is required').email('Must be a valid email')
        : z.union([
            z.string().trim().email('Must be a valid email'),
            z.literal(''),
            z.null(),
            z.undefined(),
          ]).optional();

    case 'select':
      return isRequired
        ? z.string().trim().min(1, 'Selection is required')
        : z.union([z.string(), z.null(), z.undefined()]).optional();

    case 'multi-select':
      return isRequired
        ? z.array(z.string()).min(1, 'At least one option is required')
        : z.union([z.array(z.string()), z.null(), z.undefined()]).optional();

    default:
      return z.unknown();
  }
}

export function createFieldZodSchema(field: FieldDefinition): z.ZodTypeAny {
  const isRequired = field.required ?? false;
  const isLocalized = field.localized ?? false;

  const baseSchema = getBaseFieldSchema(field.type, isRequired);

  let schema: z.ZodTypeAny;

  if (isLocalized) {
    if (isRequired) {
      schema = createLocalizedSchema(baseSchema);
    } else {
      const optionalBaseSchema = getBaseFieldSchema(field.type, false);
      schema = z.union([
        createLocalizedSchema(optionalBaseSchema),
        createPartialLocalizedSchema(optionalBaseSchema),
        z.literal(''),
        z.null(),
        z.undefined(),
      ]).optional();
    }
  } else {
    schema = baseSchema;
  }

  if (!isRequired) {
    schema = schema.optional();
  }

  return schema;
}

export function createEntryZodSchema(contentType: ContentTypeDefinition) {
  ContentTypeDefinitionSchema.parse(contentType);

  const fieldsShape: Record<string, z.ZodTypeAny> = {};
  for (const field of contentType.fields) {
    fieldsShape[field.key] = createFieldZodSchema(field);
  }

  return z.object({
    id: z.string().min(1, 'Entry ID is required'),
    contentTypeId: z.literal(contentType.id),
    slug: z.string().min(1, 'Entry slug is required').regex(/^[a-zA-Z0-9_-]+$/),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    fields: z.object(fieldsShape),
    visibilityOverrides: z.record(z.string(), z.boolean()).optional(),
    contextVisibilityOverrides: ContextVisibilityMapSchema.optional(),
  });
}

export function validateContentType(contentType: unknown): ContentTypeDefinition {
  return ContentTypeDefinitionSchema.parse(contentType) as ContentTypeDefinition;
}

export function validateEntry(
  contentType: ContentTypeDefinition,
  rawEntry: unknown
): ContentEntry {
  const entry = rawEntry as ContentEntry;
  const normalizedFields = normalizeEntryFields(contentType, entry?.fields || {});
  const entryToValidate: ContentEntry = {
    ...entry,
    fields: normalizedFields,
  };
  const schema = createEntryZodSchema(contentType);
  return schema.parse(entryToValidate) as ContentEntry;
}
