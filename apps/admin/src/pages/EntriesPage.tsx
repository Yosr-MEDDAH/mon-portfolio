import React, { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import type {
  ContentTypeDefinition,
  ContentEntry,
  EntryStatus,
} from '../shared/types.ts';
import {
  fetchContentTypes,
  fetchEntries,
  saveEntry,
  archiveEntry,
  restoreEntry,
} from '../firebase/firestore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';
import { DynamicFieldEditor } from '../components/DynamicFieldEditor.tsx';
import { VisibilityManager } from '../components/VisibilityManager.tsx';
import { validateEntry, normalizeEntryFields } from '../shared/validation.ts';
import { getFieldLabel } from '../shared/labels.ts';

export const EntriesPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t, locale } = useAdminLang();

  const [types, setTypes] = useState<ContentTypeDefinition[]>([]);
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<ContentEntry | null>(null);
  const [editingContentType, setEditingContentType] = useState<ContentTypeDefinition | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allTypes, allEntries] = await Promise.all([
        fetchContentTypes(false),
        fetchEntries(undefined, true),
      ]);
      setTypes(allTypes);
      setEntries(allEntries);
    } catch (err) {
      notify('error', 'Failed to load entries: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCreate = (ctId: string) => {
    const ct = types.find((t) => t.id === ctId) || types[0];
    if (!ct) {
      notify('error', 'Please create a content type first');
      return;
    }

    setEditingContentType(ct);
    setIsNew(true);
    setValidationErrors({});

    const initialFields: Record<string, unknown> = {};
    for (const f of ct.fields) {
      if (f.localized) {
        initialFields[f.key] = { en: '', fr: '', ar: '' };
      } else if (f.type === 'tags') {
        initialFields[f.key] = [];
      } else if (f.type === 'boolean') {
        initialFields[f.key] = false;
      } else {
        initialFields[f.key] = '';
      }
    }

    setEditingEntry({
      id: `${ct.slug}-${Date.now().toString().slice(-6)}`,
      contentTypeId: ct.id,
      slug: '',
      status: 'draft',
      fields: initialFields,
      visibilityOverrides: {},
      contextVisibilityOverrides: {},
    });
  };

  const handleStartEdit = (entry: ContentEntry) => {
    const ct = types.find((t) => t.id === entry.contentTypeId);
    if (!ct) {
      notify('error', `Content type "${entry.contentTypeId}" not found`);
      return;
    }
    setEditingContentType(ct);
    const cloned = JSON.parse(JSON.stringify(entry));
    if (ct.fields.some((f) => f.key === 'slug') && !cloned.fields.slug) {
      cloned.fields.slug = cloned.slug;
    }
    setEditingEntry(cloned);
    setIsNew(false);
    setValidationErrors({});
  };

  const handleSave = async (targetStatus: EntryStatus = 'published') => {
    if (!editingEntry || !editingContentType || !user) return;

    if (!editingEntry.slug.trim()) {
      setValidationErrors({ slug: 'Slug is required' });
      notify('error', 'Please provide a valid slug');
      return;
    }

    const sanitizedSlug = editingEntry.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const updatedFields = { ...editingEntry.fields };
    if (editingContentType.fields.some((f) => f.key === 'slug')) {
      updatedFields.slug = sanitizedSlug;
    }

    const normalizedFields = normalizeEntryFields(editingContentType, updatedFields);

    const toSave: ContentEntry = {
      ...editingEntry,
      status: targetStatus,
      slug: sanitizedSlug,
      fields: normalizedFields,
    };

    try {
      // Validate schema and required fields with Zod
      validateEntry(editingContentType, toSave);
      setValidationErrors({});

      await saveEntry(
        toSave,
        editingContentType,
        user.uid,
        user.email || 'admin@cms.dev',
        isNew ? 'Created entry' : `Updated entry (${targetStatus})`
      );

      notify('success', `Entry "${toSave.slug}" saved successfully as ${targetStatus}`);
      setEditingEntry(null);
      setEditingContentType(null);
      setIsNew(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Validation failed';
      notify('error', msg);

      // Extract field error mappings if Zod error
      const fieldErrors: Record<string, string> = {};
      if (typeof err === 'object' && err !== null && 'issues' in err) {
        const issues = (err as { issues: Array<{ path: Array<string | number>; message: string }> }).issues;
        for (const issue of issues) {
          const fieldName = String(issue.path[issue.path.length - 1] || 'general');
          fieldErrors[fieldName] = issue.message;
        }
      }
      setValidationErrors(fieldErrors);
    }
  };

  const handleArchiveToggle = async (entry: ContentEntry) => {
    if (!user) return;
    try {
      if (entry.status === 'archived') {
        await restoreEntry(entry.id, user.uid, user.email || 'admin@cms.dev');
        notify('success', `Restored entry "${entry.slug}"`);
      } else {
        await archiveEntry(entry.id, user.uid, user.email || 'admin@cms.dev');
        notify('success', `Archived entry "${entry.slug}"`);
      }
      loadData();
    } catch (err) {
      notify('error', 'Action failed: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedType === 'all') return true;
    return e.contentTypeId === selectedType;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-content">{t('nav.entries')}</h2>
          <p className="text-xs text-content-muted mt-0.5">
            Create, edit, validate, and manage publication states for any content type.
          </p>
        </div>

        {!editingEntry && types.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border border-border rounded px-3 py-2 bg-surface text-content focus:border-mg"
            >
              <option value="all">All Content Types</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {typeof t.name === 'string' ? t.name : t.name.en}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleStartCreate(selectedType === 'all' ? types[0]?.id : selectedType)}
              className="px-4 py-2 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus size={14} strokeWidth={1.5} />
              <span>{t('action.create')}</span>
            </button>
          </div>
        )}
      </div>

      {editingEntry && editingContentType ? (
        <div className="space-y-6">
          <div className="p-4 bg-mg-pale/70 border border-mg-border rounded flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-content">
                Editing Entry in Collection:{' '}
                <strong className="text-mg font-semibold">
                  {typeof editingContentType.name === 'string'
                    ? editingContentType.name
                    : editingContentType.name.en}
                </strong>
              </span>
              <div className="text-[11px] text-content-muted mt-0.5">
                Status: <span className="uppercase font-mono font-medium text-mg">{editingEntry.status || 'draft'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(!previewOpen)}
                className="px-3 py-1.5 rounded border border-border bg-surface text-content hover:border-mg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
              >
                {previewOpen ? (
                  <>
                    <EyeOff size={13} strokeWidth={1.5} />
                    <span>Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye size={13} strokeWidth={1.5} />
                    <span>Preview Entry</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setEditingContentType(null);
                }}
                className="px-3 py-1.5 rounded border border-border text-xs text-content-muted hover:text-content hover:border-mg transition-colors"
              >
                {t('action.cancel')}
              </button>
            </div>
          </div>

          {previewOpen && (
            <div className="p-5 bg-surface border border-border rounded shadow-2xs space-y-3">
              <h4 className="font-mono text-xs uppercase text-content-muted">Entry Data Preview</h4>
              <pre className="p-4 bg-cream border border-border text-mg rounded text-xs font-mono overflow-x-auto max-h-64">
                {JSON.stringify(editingEntry, null, 2)}
              </pre>
            </div>
          )}

          {/* Stable Identifier and Slug */}
          <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-xl font-normal text-content border-b border-border pb-2">
              Identity & URL Slug
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Stable ID (Internal Reference)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingEntry.id}
                  className="w-full px-3 py-2 text-xs font-mono bg-cream/50 border border-border rounded text-content-muted"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  {getFieldLabel({ key: 'slug' }, locale)} * (Used for routing /projects/[slug].html)
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.slug}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updatedFields = { ...editingEntry.fields };
                    if (editingContentType.fields.some((f) => f.key === 'slug')) {
                      updatedFields.slug = val;
                    }
                    setEditingEntry({ ...editingEntry, slug: val, fields: updatedFields });
                  }}
                  placeholder="e.g. quantum-cryptography-ai"
                  className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
                />
                {validationErrors.slug && (
                  <span className="text-xs text-red-600 font-medium">{validationErrors.slug}</span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Field Editor */}
          <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-xl font-normal text-content border-b border-border pb-2">
              Content Fields
            </h3>
            <DynamicFieldEditor
              fields={editingContentType.fields}
              values={editingEntry.fields}
              onChange={(newFields) => {
                const newSlug = typeof newFields.slug === 'string' && newFields.slug.trim()
                  ? newFields.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
                  : editingEntry.slug;
                setEditingEntry({
                  ...editingEntry,
                  slug: newSlug,
                  fields: newFields,
                });
              }}
              errors={validationErrors}
            />
          </div>

          {/* Contextual Visibility Controls for this Entry */}
          <VisibilityManager
            mode="entry"
            contentType={editingContentType}
            fields={editingContentType.fields}
            entry={editingEntry}
            visibilityOverrides={editingEntry.visibilityOverrides}
            contextVisibilityOverrides={editingEntry.contextVisibilityOverrides}
            onChangeEntryVisibility={(globals, contexts) => {
              setEditingEntry({
                ...editingEntry,
                visibilityOverrides: globals,
                contextVisibilityOverrides: contexts,
              });
            }}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setEditingContentType(null);
              }}
              className="px-4 py-2 rounded border border-border text-xs font-medium text-content-secondary hover:border-mg hover:text-content transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 rounded border border-border text-xs font-medium text-content hover:border-mg transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="px-5 py-2 rounded bg-mg hover:bg-mg-light text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Publish Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded overflow-hidden shadow-2xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-content-muted">Loading entries...</div>
          ) : filteredEntries.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredEntries.map((e) => {
                const ct = types.find((t) => t.id === e.contentTypeId);
                const title = typeof e.fields.title === 'object'
                  ? (e.fields.title as Record<string, string>)?.[locale] || (e.fields.title as Record<string, string>)?.['en'] || e.slug
                  : String(e.fields.title || e.slug);

                return (
                  <div key={e.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-content text-sm">{title}</span>
                        <code className="text-xs font-mono bg-cream text-content-muted border border-border px-1.5 py-0.5 rounded-sm">
                          {e.slug}
                        </code>
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm border ${
                            e.status === 'published'
                              ? 'bg-mg-pale text-mg border-mg-border'
                              : e.status === 'archived'
                              ? 'bg-cream text-content-muted border-border'
                              : 'bg-cream text-content-secondary border-border'
                          }`}
                        >
                          {e.status || 'draft'}
                        </span>
                      </div>
                      <div className="text-xs text-content-muted mt-1 flex items-center gap-4">
                        <span>Collection: <strong className="text-content font-medium">{ct ? (typeof ct.name === 'string' ? ct.name : ct.name[locale] || ct.name.en) : e.contentTypeId}</strong></span>
                        {Boolean(e.fields.date) && <span>Date: {String(e.fields.date)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(e)}
                        className="px-3 py-1.5 rounded border border-border hover:border-mg hover:text-mg text-xs font-medium text-content transition-colors cursor-pointer"
                      >
                        {t('action.edit')}
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(e)}
                        className="px-3 py-1.5 rounded border border-border text-xs font-medium text-content-muted hover:border-mg hover:text-content transition-colors cursor-pointer"
                      >
                        {e.status === 'archived' ? t('action.restore') : t('action.archive')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-content-muted">
              No entries found. Click "Create New" to write an entry.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
