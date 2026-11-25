import React, { useState, useEffect } from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type {
  ContentTypeDefinition,
  FieldDefinition,
  FieldType,
} from '../shared/types.ts';
import {
  fetchContentTypes,
  saveContentType,
  archiveContentType,
  restoreContentType,
} from '../firebase/firestore.ts';
import { DEFAULT_CONTENT_TYPES } from '../firebase/defaultContentTypes.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';
import { VisibilityManager } from '../components/VisibilityManager.tsx';
import {
  KNOWN_FIELD_LABELS,
  formatKeyToLabel,
  getNormalizedFieldNames,
  isGenericPlaceholder,
} from '../shared/labels.ts';

export const ContentTypesPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t } = useAdminLang();

  const [types, setTypes] = useState<ContentTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<ContentTypeDefinition | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const availableFieldTypes: FieldType[] = [
    'text',
    'textarea',
    'date',
    'boolean',
    'url',
    'image',
    'gallery',
    'richtext',
    'tags',
    'media',
  ];

  const loadTypes = async () => {
    setLoading(true);
    try {
      let data = await fetchContentTypes(true);
      const existingIds = new Set(data.map((t) => t.id));
      const missing = DEFAULT_CONTENT_TYPES.filter((dt) => !existingIds.has(dt.id));
      if (missing.length > 0 && user) {
        for (const dt of missing) {
          await saveContentType(dt, user.uid, user.email || '', 'Seeded default content type');
        }
        data = await fetchContentTypes(true);
      }
      setTypes(data);
    } catch (err) {
      notify('error', 'Failed to load content types: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingType({
      id: '',
      name: { en: '', fr: '', ar: '' },
      description: { en: '', fr: '', ar: '' },
      slug: '',
      fields: [
        { key: 'title', name: { en: 'Title', fr: 'Titre', ar: 'العنوان' }, type: 'text', required: true, localized: true, defaultVisible: true },
      ],
      defaultVisibility: { title: true },
    });
  };

  const handleAddField = () => {
    if (!editingType) return;
    const newKey = `field_${editingType.fields.length + 1}`;
    const defaultLabels = KNOWN_FIELD_LABELS[newKey] || {
      en: formatKeyToLabel(newKey),
      fr: formatKeyToLabel(newKey),
      ar: formatKeyToLabel(newKey),
    };
    const newField: FieldDefinition = {
      key: newKey,
      name: defaultLabels,
      type: 'text',
      required: false,
      localized: false,
      defaultVisible: true,
    };
    setEditingType({
      ...editingType,
      fields: [...editingType.fields, newField],
    });
  };

  const handleRemoveField = (index: number) => {
    if (!editingType) return;
    const updated = [...editingType.fields];
    updated.splice(index, 1);
    setEditingType({ ...editingType, fields: updated });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!editingType) return;
    const updated = [...editingType.fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setEditingType({ ...editingType, fields: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !user) return;

    if (!editingType.slug.trim()) {
      notify('error', 'Slug is required');
      return;
    }

    const finalId = editingType.id || editingType.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const normalizedFields = editingType.fields.map((f) => ({
      ...f,
      name: getNormalizedFieldNames(f),
    }));
    const toSave: ContentTypeDefinition = {
      ...editingType,
      id: finalId,
      slug: editingType.slug.trim().toLowerCase(),
      fields: normalizedFields,
    };

    try {
      await saveContentType(toSave, user.uid, user.email || 'admin@cms.dev', isNew ? 'Created content type' : 'Updated schema');
      notify('success', `Content type "${toSave.slug}" saved successfully`);
      setEditingType(null);
      setIsNew(false);
      loadTypes();
    } catch (err: unknown) {
      notify('error', err instanceof Error ? err.message : 'Validation or save failed');
    }
  };

  const handleArchiveToggle = async (ct: ContentTypeDefinition) => {
    if (!user) return;
    try {
      if (ct.isArchived) {
        await restoreContentType(ct.id, user.uid, user.email || 'admin@cms.dev');
        notify('success', `Restored content type ${ct.slug}`);
      } else {
        await archiveContentType(ct.id, user.uid, user.email || 'admin@cms.dev');
        notify('success', `Archived content type ${ct.slug}`);
      }
      loadTypes();
    } catch (err) {
      notify('error', 'Action failed: ' + (err instanceof Error ? err.message : ''));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-content">{t('nav.contentTypes')}</h2>
          <p className="text-xs text-content-muted mt-0.5">
            Define content schemas, dynamic custom fields, and contextual visibility defaults.
          </p>
        </div>
        {!editingType && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>{t('action.create')}</span>
          </button>
        )}
      </div>

      {editingType ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl font-normal text-content">
                {isNew ? 'Create New Content Type' : `Edit Content Type: ${editingType.slug}`}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJsonPreview(!showJsonPreview)}
                  className="px-3 py-1 rounded text-xs border border-border bg-surface text-content hover:border-mg font-mono transition-colors"
                >
                  {showJsonPreview ? 'Hide Schema' : 'Preview Schema'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="px-3 py-1 rounded text-xs text-content-muted hover:text-content border border-border transition-colors"
                >
                  {t('action.cancel')}
                </button>
              </div>
            </div>

            {showJsonPreview && (
              <pre className="p-4 bg-cream border border-border text-mg rounded text-xs font-mono overflow-x-auto max-h-64">
                {JSON.stringify(editingType, null, 2)}
              </pre>
            )}

            {/* Base info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Stable Slug (e.g. "research", "projects") *
                </label>
                <input
                  type="text"
                  required
                  value={editingType.slug}
                  onChange={(e) => setEditingType({ ...editingType, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Name in English (EN) *
                </label>
                <input
                  type="text"
                  required
                  value={typeof editingType.name === 'string' ? editingType.name : editingType.name.en}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    name: typeof editingType.name === 'string'
                      ? { en: e.target.value, fr: '', ar: '' }
                      : { ...editingType.name, en: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Name in French (FR)
                </label>
                <input
                  type="text"
                  value={typeof editingType.name === 'object' ? editingType.name.fr : ''}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    name: typeof editingType.name === 'string'
                      ? { en: editingType.name, fr: e.target.value, ar: '' }
                      : { ...editingType.name, fr: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Name in Arabic (AR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={typeof editingType.name === 'object' ? editingType.name.ar : ''}
                  onChange={(e) => setEditingType({
                    ...editingType,
                    name: typeof editingType.name === 'string'
                      ? { en: editingType.name, fr: '', ar: e.target.value }
                      : { ...editingType.name, ar: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors text-right"
                />
              </div>
            </div>
          </div>

          {/* Fields list builder */}
          <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-content">
                Custom Fields Schema ({editingType.fields.length})
              </h3>
              <button
                type="button"
                onClick={handleAddField}
                className="px-3 py-1.5 rounded bg-mg-pale text-mg border border-mg-border hover:bg-mg hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                + Add Field
              </button>
            </div>

            <div className="space-y-3">
              {editingType.fields.map((f, idx) => (
                <div key={idx} className="p-3.5 bg-cream/40 border border-border rounded flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-content-muted">Key</span>
                      <input
                        type="text"
                        value={f.key}
                        onChange={(e) => {
                          const newKeyVal = e.target.value;
                          const updated = [...editingType.fields];
                          updated[idx].key = newKeyVal;
                          const currentNameEn = typeof f.name === 'object' ? f.name.en : f.name;
                          if (isGenericPlaceholder(currentNameEn) || KNOWN_FIELD_LABELS[newKeyVal]) {
                            if (KNOWN_FIELD_LABELS[newKeyVal]) {
                              updated[idx].name = { ...KNOWN_FIELD_LABELS[newKeyVal] };
                            } else if (isGenericPlaceholder(currentNameEn)) {
                              const autoLabel = formatKeyToLabel(newKeyVal);
                              updated[idx].name = { en: autoLabel, fr: autoLabel, ar: autoLabel };
                            }
                          }
                          setEditingType({ ...editingType, fields: updated });
                        }}
                        className="w-full px-2 py-1 text-xs font-mono bg-surface border border-border rounded text-content focus:border-mg"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-content-muted">Type</span>
                      <select
                        value={f.type}
                        onChange={(e) => {
                          const updated = [...editingType.fields];
                          updated[idx].type = e.target.value as FieldType;
                          setEditingType({ ...editingType, fields: updated });
                        }}
                        className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-content focus:border-mg"
                      >
                        {availableFieldTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-4 pt-3 sm:pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-content cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(f.required)}
                          onChange={(e) => {
                            const updated = [...editingType.fields];
                            updated[idx].required = e.target.checked;
                            setEditingType({ ...editingType, fields: updated });
                          }}
                          className="w-3.5 h-3.5 rounded border-border accent-mg"
                        />
                        <span>Required</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-content cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(f.localized)}
                          onChange={(e) => {
                            const updated = [...editingType.fields];
                            updated[idx].localized = e.target.checked;
                            setEditingType({ ...editingType, fields: updated });
                          }}
                          className="w-3.5 h-3.5 rounded border-border accent-mg"
                        />
                        <span>Localized</span>
                      </label>
                    </div>

                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-content-muted">Label (EN)</span>
                        <input
                          type="text"
                          placeholder="e.g. Short Description"
                          value={typeof f.name === 'object' ? (f.name.en || '') : (f.name || '')}
                          onChange={(e) => {
                            const updated = [...editingType.fields];
                            const cur = typeof f.name === 'object' ? f.name : { en: f.name || '', fr: '', ar: '' };
                            updated[idx].name = { ...cur, en: e.target.value };
                            setEditingType({ ...editingType, fields: updated });
                          }}
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-content focus:border-mg"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-content-muted">Label (FR)</span>
                        <input
                          type="text"
                          placeholder="ex. Description courte"
                          value={typeof f.name === 'object' ? (f.name.fr || '') : ''}
                          onChange={(e) => {
                            const updated = [...editingType.fields];
                            const cur = typeof f.name === 'object' ? f.name : { en: f.name || '', fr: '', ar: '' };
                            updated[idx].name = { ...cur, fr: e.target.value };
                            setEditingType({ ...editingType, fields: updated });
                          }}
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-content focus:border-mg"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-content-muted">Label (AR)</span>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: وصف مختصر"
                          value={typeof f.name === 'object' ? (f.name.ar || '') : ''}
                          onChange={(e) => {
                            const updated = [...editingType.fields];
                            const cur = typeof f.name === 'object' ? f.name : { en: f.name || '', fr: '', ar: '' };
                            updated[idx].name = { ...cur, ar: e.target.value };
                            setEditingType({ ...editingType, fields: updated });
                          }}
                          className="w-full px-2 py-1 text-xs bg-surface border border-border rounded text-content focus:border-mg text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, 'up')}
                      className="p-1 rounded border border-border hover:border-mg hover:text-mg disabled:opacity-30 text-xs w-6 h-6 flex items-center justify-center transition-colors"
                      title="Move Up"
                      aria-label="Move Up"
                    >
                      <ChevronUp size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === editingType.fields.length - 1}
                      onClick={() => handleMoveField(idx, 'down')}
                      className="p-1 rounded border border-border hover:border-mg hover:text-mg disabled:opacity-30 text-xs w-6 h-6 flex items-center justify-center transition-colors"
                      title="Move Down"
                      aria-label="Move Down"
                    >
                      <ChevronDown size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1 rounded border border-border text-red-600 hover:border-red-600 hover:bg-red-500/10 text-xs ms-1 w-6 h-6 flex items-center justify-center transition-colors"
                      title="Remove Field"
                      aria-label="Remove Field"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Visibility Defaults */}
          <VisibilityManager
            mode="contentType"
            contentType={editingType}
            fields={editingType.fields}
            defaultVisibility={editingType.defaultVisibility}
            contextDefaultVisibility={editingType.contextDefaultVisibility}
            onChangeContentTypeVisibility={(def, ctxDef) => {
              setEditingType({
                ...editingType,
                defaultVisibility: def,
                contextDefaultVisibility: ctxDef,
              });
            }}
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingType(null)}
              className="px-4 py-2 rounded border border-border text-xs font-medium text-content-secondary hover:border-mg hover:text-content transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-mg hover:bg-mg-light text-xs font-medium text-white transition-colors cursor-pointer"
            >
              {t('action.save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface border border-border rounded overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-content-muted">Loading schemas...</div>
          ) : types.length > 0 ? (
            <div className="divide-y divide-border">
              {types.map((ct) => (
                <div key={ct.id} className="p-5 flex items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-content text-sm">
                        {typeof ct.name === 'string' ? ct.name : ct.name.en || ct.slug}
                      </span>
                      <code className="text-xs font-mono bg-mg-pale text-mg border border-mg-border px-1.5 py-0.5 rounded-sm">
                        /{ct.slug}
                      </code>
                      {ct.isArchived && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-cream text-content-muted border border-border">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-content-muted mt-1">
                      {ct.fields.length} defined custom fields: {ct.fields.map(f => f.key).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingType(ct);
                      }}
                      className="px-3 py-1.5 rounded border border-border hover:border-mg hover:text-mg text-xs font-medium text-content transition-colors cursor-pointer"
                    >
                      {t('action.edit')}
                    </button>
                    <button
                      onClick={() => handleArchiveToggle(ct)}
                      className="px-3 py-1.5 rounded border border-border text-xs font-medium text-content-muted hover:border-mg hover:text-content transition-colors cursor-pointer"
                    >
                      {ct.isArchived ? t('action.restore') : t('action.archive')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-content-muted">
              No content types created yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
