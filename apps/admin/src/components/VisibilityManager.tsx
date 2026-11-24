import React from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import type {
  FieldDefinition,
  RenderingContext,
  ContextVisibilityMap,
  ContentTypeDefinition,
  ContentEntry,
} from '../shared/types.ts';
import { isFieldVisible } from '../shared/visibility.ts';
import { getFieldLabel } from '../shared/labels.ts';
import { useAdminLang } from '../context/LanguageContext.tsx';

interface VisibilityManagerProps {
  contentType: ContentTypeDefinition;
  fields: FieldDefinition[];
  // If editing at content-type level:
  defaultVisibility?: Record<string, boolean>;
  contextDefaultVisibility?: ContextVisibilityMap;
  onChangeContentTypeVisibility?: (
    def: Record<string, boolean>,
    contextDef: ContextVisibilityMap
  ) => void;
  // If editing at entry level:
  entry?: ContentEntry;
  visibilityOverrides?: Record<string, boolean>;
  contextVisibilityOverrides?: ContextVisibilityMap;
  onChangeEntryVisibility?: (
    globalOverrides: Record<string, boolean>,
    contextOverrides: ContextVisibilityMap
  ) => void;
  mode: 'contentType' | 'entry';
}

export const VisibilityManager: React.FC<VisibilityManagerProps> = ({
  contentType,
  fields,
  defaultVisibility = {},
  contextDefaultVisibility = {},
  onChangeContentTypeVisibility,
  entry,
  visibilityOverrides = {},
  contextVisibilityOverrides = {},
  onChangeEntryVisibility,
  mode,
}) => {
  const { t, locale } = useAdminLang();
  const contexts: RenderingContext[] = ['card', 'detail', 'section'];

  const getEffectiveState = (fieldKey: string, ctx: RenderingContext): boolean => {
    if (mode === 'entry' && entry) {
      const mockEntry: ContentEntry = {
        ...entry,
        visibilityOverrides,
        contextVisibilityOverrides,
      };
      return isFieldVisible(contentType, mockEntry, fieldKey, ctx);
    }
    // At content type level
    if (contextDefaultVisibility[ctx] && typeof contextDefaultVisibility[ctx]![fieldKey] === 'boolean') {
      return contextDefaultVisibility[ctx]![fieldKey]!;
    }
    if (typeof defaultVisibility[fieldKey] === 'boolean') {
      return defaultVisibility[fieldKey];
    }
    const def = fields.find((f) => f.key === fieldKey);
    if (def && typeof def.defaultVisible === 'boolean') return def.defaultVisible;
    return true;
  };

  const handleToggleEntryContext = (fieldKey: string, ctx: RenderingContext) => {
    if (!onChangeEntryVisibility) return;
    const current = contextVisibilityOverrides[ctx]?.[fieldKey];
    const newContextOverrides: ContextVisibilityMap = {
      ...contextVisibilityOverrides,
      [ctx]: {
        ...(contextVisibilityOverrides[ctx] || {}),
        [fieldKey]: current === false ? true : false,
      },
    };
    onChangeEntryVisibility(visibilityOverrides, newContextOverrides);
  };

  const handleToggleContentTypeContext = (fieldKey: string, ctx: RenderingContext) => {
    if (!onChangeContentTypeVisibility) return;
    const current = contextDefaultVisibility[ctx]?.[fieldKey];
    const newContextDefault: ContextVisibilityMap = {
      ...contextDefaultVisibility,
      [ctx]: {
        ...(contextDefaultVisibility[ctx] || {}),
        [fieldKey]: current === false ? true : false,
      },
    };
    onChangeContentTypeVisibility(defaultVisibility, newContextDefault);
  };

  const handleResetOverride = (fieldKey: string, ctx: RenderingContext) => {
    if (!onChangeEntryVisibility) return;
    const ctxMap = { ...(contextVisibilityOverrides[ctx] || {}) };
    delete ctxMap[fieldKey];
    const newContextOverrides: ContextVisibilityMap = {
      ...contextVisibilityOverrides,
      [ctx]: ctxMap,
    };
    onChangeEntryVisibility(visibilityOverrides, newContextOverrides);
  };

  return (
    <div className="bg-surface border border-border rounded p-5 shadow-2xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
        <div>
          <h3 className="font-serif text-lg font-normal text-content flex items-center gap-2">
            <Eye size={16} strokeWidth={1.5} className="text-mg" />
            <span>{t('vis.title')}</span>
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            {t('vis.explanation')}
          </p>
        </div>
        <div className="text-[11px] font-mono text-mg bg-mg-pale border border-mg-border px-2.5 py-1 rounded">
          {t('vis.priorityHint')}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-start">
          <thead>
            <tr className="border-b border-border text-content-muted font-medium uppercase tracking-wider">
              <th className="py-2.5 px-3">Field</th>
              <th className="py-2.5 px-3 text-center">{t('vis.card')}</th>
              <th className="py-2.5 px-3 text-center">{t('vis.detail')}</th>
              <th className="py-2.5 px-3 text-center">{t('vis.section')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fields.map((field) => {
              const label = getFieldLabel(field, locale);
              return (
                <tr key={field.key} className="hover:bg-cream/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-content">
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-content">{label}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-mg">{field.key}</span>
                        <span className="text-[10px] text-content-muted">({field.type})</span>
                      </div>
                    </div>
                  </td>

                {contexts.map((ctx) => {
                  const effective = getEffectiveState(field.key, ctx);
                  const isOverridden = mode === 'entry' && typeof contextVisibilityOverrides[ctx]?.[field.key] === 'boolean';

                  return (
                    <td key={ctx} className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (mode === 'entry') handleToggleEntryContext(field.key, ctx);
                            else handleToggleContentTypeContext(field.key, ctx);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            effective
                              ? 'bg-mg-pale text-mg border border-mg-border hover:bg-mg hover:text-white'
                              : 'bg-cream border border-border text-content-muted hover:border-mg hover:text-content'
                          }`}
                        >
                          {effective ? (
                            <Eye size={12} strokeWidth={1.5} />
                          ) : (
                            <EyeOff size={12} strokeWidth={1.5} />
                          )}
                          <span>{effective ? t('vis.visible') : t('vis.hidden')}</span>
                        </button>

                        {isOverridden && (
                          <button
                            type="button"
                            title="Reset entry override to inherit default"
                            aria-label="Reset entry override"
                            onClick={() => handleResetOverride(field.key, ctx)}
                            className="p-1 text-content-muted hover:text-mg rounded transition-colors inline-flex items-center"
                          >
                            <RotateCcw size={11} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
