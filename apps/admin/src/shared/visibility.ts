import type {
  ContentTypeDefinition,
  ContentEntry,
  RenderingContext,
  TemplateVisibilitySettings,
  VisibilityOptions,
  ContextVisibilityMap,
} from './types.ts';

function extractContextAndTemplate(
  contextOrOptions?: RenderingContext | VisibilityOptions,
  templateSettingsParam?: TemplateVisibilitySettings
): { context?: RenderingContext; templateSettings?: TemplateVisibilitySettings } {
  if (typeof contextOrOptions === 'string') {
    return {
      context: contextOrOptions as RenderingContext,
      templateSettings: templateSettingsParam,
    };
  }
  if (contextOrOptions && typeof contextOrOptions === 'object') {
    return {
      context: contextOrOptions.context,
      templateSettings: contextOrOptions.templateSettings ?? templateSettingsParam,
    };
  }
  return {
    context: undefined,
    templateSettings: templateSettingsParam,
  };
}

/**
 * Resolves the visibility status for a single field in an entry.
 *
 * Precedence (highest to lowest):
 * 1. Entry-level overrides (context-specific first, then global)
 * 2. Template-level settings (context-specific first, then global)
 * 3. Content-type defaults (context-specific first, then global)
 * 4. Fallback default: true (visible)
 */
export function isFieldVisible(
  contentType: ContentTypeDefinition,
  entry: ContentEntry,
  fieldKey: string,
  contextOrOptions?: RenderingContext | VisibilityOptions,
  templateSettingsParam?: TemplateVisibilitySettings
): boolean {
  const { context, templateSettings } = extractContextAndTemplate(
    contextOrOptions,
    templateSettingsParam
  );

  // --- 1. Entry-level overrides (highest priority) ---
  if (context && entry.contextVisibilityOverrides?.[context]) {
    const contextOverride = entry.contextVisibilityOverrides[context]![fieldKey];
    if (typeof contextOverride === 'boolean') {
      return contextOverride;
    }
  }

  if (entry.visibilityOverrides && typeof entry.visibilityOverrides[fieldKey] === 'boolean') {
    return entry.visibilityOverrides[fieldKey];
  }

  // --- 2. Template-level settings (middle priority) ---
  if (templateSettings) {
    if ('contextVisibility' in templateSettings || 'visibility' in templateSettings) {
      const structured = templateSettings as {
        visibility?: Record<string, boolean>;
        contextVisibility?: ContextVisibilityMap;
      };

      if (context && structured.contextVisibility?.[context]) {
        const val = structured.contextVisibility[context]![fieldKey];
        if (typeof val === 'boolean') {
          return val;
        }
      }

      if (structured.visibility && typeof structured.visibility[fieldKey] === 'boolean') {
        return structured.visibility[fieldKey];
      }
    } else {
      const record = templateSettings as Record<string, unknown>;

      if (
        context &&
        record[context] &&
        typeof record[context] === 'object' &&
        typeof (record[context] as Record<string, boolean>)[fieldKey] === 'boolean'
      ) {
        return (record[context] as Record<string, boolean>)[fieldKey];
      }

      if (typeof record[fieldKey] === 'boolean') {
        return record[fieldKey] as boolean;
      }
    }
  }

  // --- 3. Content-type defaults (lowest priority) ---
  if (context && contentType.contextDefaultVisibility?.[context]) {
    const ctxDefault = contentType.contextDefaultVisibility[context]![fieldKey];
    if (typeof ctxDefault === 'boolean') {
      return ctxDefault;
    }
  }

  const fieldDef = contentType.fields.find((f) => f.key === fieldKey);
  if (
    context &&
    fieldDef &&
    typeof fieldDef.defaultVisible === 'object' &&
    fieldDef.defaultVisible !== null
  ) {
    const fieldCtxVal = (fieldDef.defaultVisible as Record<string, boolean>)[context];
    if (typeof fieldCtxVal === 'boolean') {
      return fieldCtxVal;
    }
  }

  if (
    contentType.defaultVisibility &&
    typeof contentType.defaultVisibility[fieldKey] === 'boolean'
  ) {
    return contentType.defaultVisibility[fieldKey];
  }

  if (fieldDef && typeof fieldDef.defaultVisible === 'boolean') {
    return fieldDef.defaultVisible;
  }

  // --- 4. Fallback default ---
  return true;
}

/**
 * Resolves full visibility map for all fields defined on a content type for a given entry.
 * Does not mutate or modify the entry or content type.
 */
export function resolveVisibility(
  contentType: ContentTypeDefinition,
  entry: ContentEntry,
  contextOrOptions?: RenderingContext | VisibilityOptions,
  templateSettingsParam?: TemplateVisibilitySettings
): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  for (const field of contentType.fields) {
    result[field.key] = isFieldVisible(
      contentType,
      entry,
      field.key,
      contextOrOptions,
      templateSettingsParam
    );
  }

  return result;
}

/**
 * Returns a new object containing only visible field values for presentation/rendering.
 * The original entry.fields remains completely intact and unmodified.
 */
export function getVisibleFieldValues(
  contentType: ContentTypeDefinition,
  entry: ContentEntry,
  contextOrOptions?: RenderingContext | VisibilityOptions,
  templateSettingsParam?: TemplateVisibilitySettings
): Record<string, unknown> {
  const visibleMap = resolveVisibility(
    contentType,
    entry,
    contextOrOptions,
    templateSettingsParam
  );
  const visibleFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(entry.fields)) {
    if (visibleMap[key] !== false) {
      visibleFields[key] = value;
    }
  }

  return visibleFields;
}
