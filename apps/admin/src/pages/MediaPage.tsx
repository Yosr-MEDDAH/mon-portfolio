import React, { useState, useEffect } from 'react';
import {
  Plus,
  Info,
  Image as ImageIcon,
  FileText,
  Video,
  Link2,
  Copy,
  Trash2,
} from 'lucide-react';
import type { MediaItem, SupportedLocale } from '../shared/types.ts';
import { fetchMediaItems, saveMediaItem, deleteMediaItem } from '../firebase/firestore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';

export const MediaPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t } = useAdminLang();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<SupportedLocale>('en');

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await fetchMediaItems();
      setItems(data);
    } catch (err) {
      notify('error', 'Failed to load media items: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingItem({
      id: `media-${Date.now().toString().slice(-6)}`,
      title: '',
      fileName: '',
      mimeType: 'image/png',
      externalUrl: '',
      mediaType: 'image',
      altText: { en: '', fr: '', ar: '' },
      captions: { en: '', fr: '', ar: '' },
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAwaitingPublication: false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !user) return;

    if (!editingItem.title.trim() || !editingItem.externalUrl.trim()) {
      notify('error', 'Title and External URL are required');
      return;
    }

    try {
      await saveMediaItem(editingItem, user.uid, user.email || 'admin@cms.dev');
      notify('success', `Media item "${editingItem.title}" saved`);
      setEditingItem(null);
      setIsNew(false);
      loadMedia();
    } catch (err: unknown) {
      notify('error', err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media reference?')) return;
    try {
      await deleteMediaItem(id, user?.email || 'admin@cms.dev');
      notify('success', 'Media reference deleted');
      loadMedia();
    } catch (err) {
      notify('error', 'Delete failed: ' + (err instanceof Error ? err.message : ''));
    }
  };

  const filtered = items.filter((m) => {
    if (filterType === 'all') return true;
    return m.mediaType === filterType;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-content">{t('nav.media')}</h2>
          <p className="text-xs text-content-muted mt-0.5">
            Registry for external media URLs, YouTube videos, PDFs, and repository assets.
          </p>
        </div>

        {!editingItem && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>Register External Media</span>
          </button>
        )}
      </div>

      {/* Spark Plan notice */}
      <div className="p-4 bg-cream/70 border border-border rounded text-xs text-content-secondary leading-relaxed flex items-start gap-3">
        <Info size={16} strokeWidth={1.5} className="text-mg shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-content">Spark Plan & Media Management:</span> Binary uploads to Firebase Storage are avoided to ensure zero hosting fees. Media items are registered as external URLs (GitHub repo assets, YouTube, arXiv, PDFs, Google Drive, Colab notebooks).
        </div>
      </div>

      {editingItem ? (
        <form onSubmit={handleSave} className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif text-xl font-normal text-content">
              {isNew ? 'Register Media Item' : `Edit Media Item: ${editingItem.title}`}
            </h3>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-3 py-1 rounded text-xs border border-border text-content-muted hover:text-content transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Media Title *
              </label>
              <input
                type="text"
                required
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. Green-A11y Architecture Diagram"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Resource Type *
              </label>
              <select
                value={editingItem.mediaType}
                onChange={(e) => setEditingItem({ ...editingItem, mediaType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg"
              >
                <option value="image">Image (PNG, WebP, JPG, SVG)</option>
                <option value="pdf">Document (PDF)</option>
                <option value="video">Video (YouTube, MP4)</option>
                <option value="notebook">Jupyter / Colab Notebook</option>
                <option value="linkedin">LinkedIn Post / Article</option>
                <option value="external">External Web Link</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-content mb-1">
                External URL / Asset Path *
              </label>
              <input
                type="text"
                required
                value={editingItem.externalUrl}
                onChange={(e) => setEditingItem({ ...editingItem, externalUrl: e.target.value })}
                placeholder="https://... or /assets/images/..."
                className="w-full px-3 py-2 text-sm font-mono bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                File Name
              </label>
              <input
                type="text"
                value={editingItem.fileName}
                onChange={(e) => setEditingItem({ ...editingItem, fileName: e.target.value })}
                placeholder="e.g. architecture.png"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                MIME Type
              </label>
              <input
                type="text"
                value={editingItem.mimeType}
                onChange={(e) => setEditingItem({ ...editingItem, mimeType: e.target.value })}
                placeholder="image/png, application/pdf"
                className="w-full px-3 py-2 text-sm font-mono bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
              />
            </div>
          </div>

          {/* Localized Alt text and Captions */}
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs uppercase text-content-muted">
                Localized Accessibility (Alt Text & Captions)
              </h4>
              <div className="flex items-center gap-1 bg-cream p-0.5 rounded border border-border text-xs">
                {(['en', 'fr', 'ar'] as SupportedLocale[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLangTab(lang)}
                    className={`px-2.5 py-0.5 rounded transition-colors ${
                      activeLangTab === lang
                        ? 'bg-mg text-white font-medium'
                        : 'text-content-secondary hover:text-content'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Alt Text ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                  value={editingItem.altText[activeLangTab] || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    altText: { ...editingItem.altText, [activeLangTab]: e.target.value },
                  })}
                  placeholder={`Descriptive alt text in ${activeLangTab.toUpperCase()}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content mb-1">
                  Caption ({activeLangTab.toUpperCase()})
                </label>
                <input
                  type="text"
                  dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                  value={editingItem.captions[activeLangTab] || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    captions: { ...editingItem.captions, [activeLangTab]: e.target.value },
                  })}
                  placeholder={`Caption in ${activeLangTab.toUpperCase()}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
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
          <div className="p-3.5 border-b border-border bg-cream/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-content-muted">Filter by type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-border rounded px-2 py-1 bg-surface text-content text-xs focus:border-mg"
              >
                <option value="all">All Media</option>
                <option value="image">Images</option>
                <option value="pdf">Documents (PDF)</option>
                <option value="video">Videos</option>
                <option value="notebook">Notebooks</option>
                <option value="linkedin">LinkedIn</option>
                <option value="external">External</option>
              </select>
            </div>
            <div className="text-xs text-content-muted">
              {filtered.length} items registered
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-content-muted">Loading media...</div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-cream/60 flex items-center justify-center text-content-muted border border-border shrink-0">
                      {m.mediaType === 'image' ? (
                        <ImageIcon size={18} strokeWidth={1.5} />
                      ) : m.mediaType === 'pdf' ? (
                        <FileText size={18} strokeWidth={1.5} />
                      ) : m.mediaType === 'video' ? (
                        <Video size={18} strokeWidth={1.5} />
                      ) : (
                        <Link2 size={18} strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-content text-sm">{m.title}</div>
                      <div className="text-xs font-mono text-mg truncate max-w-md mt-0.5">
                        <a href={m.externalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {m.externalUrl}
                        </a>
                      </div>
                      <div className="text-[11px] text-content-muted mt-1 flex items-center gap-3">
                        <span className="uppercase font-mono text-content-secondary">{m.mediaType}</span>
                        <span>MIME: {m.mimeType || 'unknown'}</span>
                        {m.altText?.en && <span>Alt (EN): {m.altText.en}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(m.externalUrl);
                        notify('info', 'URL copied to clipboard');
                      }}
                      className="px-2.5 py-1.5 rounded border border-border text-xs font-mono text-content-secondary hover:border-mg hover:text-content transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      title="Copy URL"
                    >
                      <Copy size={12} strokeWidth={1.5} />
                      <span>Copy URL</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem(m);
                      }}
                      className="px-3 py-1.5 rounded border border-border hover:border-mg hover:text-mg text-xs font-medium text-content transition-colors cursor-pointer"
                    >
                      {t('action.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded border border-border text-red-600 hover:border-red-600 hover:bg-red-500/10 text-xs transition-colors cursor-pointer flex items-center justify-center"
                      title="Delete Reference"
                      aria-label="Delete Reference"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-content-muted">
              No media items registered yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
