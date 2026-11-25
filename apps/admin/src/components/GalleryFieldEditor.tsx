import React, { useState } from 'react';
import { Upload, Trash2, GripVertical, ArrowUp, ArrowDown, Plus, AlertCircle } from 'lucide-react';
import type { GalleryImageItem, SupportedLocale, PartialLocalized } from '../shared/types.ts';

interface GalleryFieldEditorProps {
  value: GalleryImageItem[];
  onChange: (items: GalleryImageItem[]) => void;
  activeLangTab: SupportedLocale;
  maxImages?: number;
}

function getLocalizedText(
  field: GalleryImageItem['caption'] | GalleryImageItem['alt'],
  lang: SupportedLocale
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || '';
}

function setLocalizedText(
  existing: GalleryImageItem['caption'] | GalleryImageItem['alt'],
  lang: SupportedLocale,
  text: string
): PartialLocalized<string> {
  const base: PartialLocalized<string> =
    existing && typeof existing === 'object'
      ? { ...existing }
      : typeof existing === 'string' && existing
      ? { en: existing, fr: existing, ar: existing }
      : {};
  return {
    ...base,
    [lang]: text,
  };
}

function resolvePreviewSrc(url: string): string {
  if (!url) return '';
  if (/^(?:[a-z]+:)?\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url : `/${url}`;
  if (clean.startsWith('/mon-portfolio/')) return clean;
  return `/mon-portfolio${clean}`;
}

export const GalleryFieldEditor: React.FC<GalleryFieldEditorProps> = ({
  value,
  onChange,
  activeLangTab,
  maxImages = 20,
}) => {
  const items = Array.isArray(value) ? value : [];
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setUploadError('Please select valid image files.');
      return;
    }

    const remaining = maxImages - items.length;
    if (remaining <= 0) {
      setUploadError(`Maximum of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`Only ${remaining} more image(s) allowed (max ${maxImages}). Uploading first ${remaining}.`);
    } else {
      setUploadError('');
    }

    setUploading(true);
    const nextItems = [...items];

    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      const workerUrl =
        (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_UPLOAD_WORKER_URL ||
        'https://portfolio-upload-worker.yosr-meddah92.workers.dev';

      // Upload sequentially so GitHub Contents API commits never race on the branch head
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(`Uploading ${i + 1} / ${filesToUpload.length}: ${file.name}`);
        const fd = new FormData();
        fd.append('file', file);

        const res = await fetch(`${workerUrl}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Upload failed for ${file.name}`);
        }
        nextItems.push({
          url: data.path,
          caption: { en: '', fr: '', ar: '' },
          alt: { en: '', fr: '', ar: '' },
        });
        onChange([...nextItems]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (items.length >= maxImages) {
      setUploadError(`Maximum of ${maxImages} images reached.`);
      return;
    }
    setUploadError('');
    onChange([
      ...items,
      {
        url: trimmed,
        caption: { en: '', fr: '', ar: '' },
        alt: { en: '', fr: '', ar: '' },
      },
    ]);
    setManualUrl('');
  };

  const handleRemove = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const handleItemTextChange = (
    index: number,
    prop: 'caption' | 'alt',
    text: string
  ) => {
    const updated = [...items];
    const current = updated[index];
    updated[index] = {
      ...current,
      [prop]: setLocalizedText(current[prop], activeLangTab, text),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-content-muted">
          Upload up to {maxImages} images, drag to reorder, and add optional captions &amp; alt text ({activeLangTab.toUpperCase()}).
        </span>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded border ${
            items.length >= maxImages
              ? 'bg-mg-pale text-mg border-mg-border font-medium'
              : 'bg-cream text-content-secondary border-border'
          }`}
        >
          {items.length} / {maxImages}
        </span>
      </div>

      {/* Multi-file Dropzone & Upload Button */}
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setIsFileDragOver(true);
          }
        }}
        onDragLeave={() => setIsFileDragOver(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            setIsFileDragOver(false);
            if (!uploading && items.length < maxImages) {
              void uploadFiles(e.dataTransfer.files);
            }
          }
        }}
        className={`p-4 border-2 border-dashed rounded text-center transition-colors ${
          isFileDragOver
            ? 'border-mg bg-mg-pale/50'
            : 'border-border bg-cream/30 hover:border-mg/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <label
            className={`px-4 py-2 rounded text-xs font-medium inline-flex items-center gap-2 transition-colors ${
              uploading || items.length >= maxImages
                ? 'bg-cream text-content-muted border border-border cursor-not-allowed'
                : 'bg-mg hover:bg-mg-light text-white cursor-pointer'
            }`}
          >
            <Upload size={14} strokeWidth={1.5} />
            <span>{uploading ? uploadProgress || 'Uploading...' : 'Upload Images'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading || items.length >= maxImages}
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void uploadFiles(e.target.files);
                }
                e.target.value = '';
              }}
            />
          </label>
          <span className="text-xs text-content-muted">
            or drag &amp; drop image files here
          </span>
        </div>
      </div>

      {/* Optional Manual URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddManualUrl();
            }
          }}
          placeholder="Or paste image path / URL (/assets/... or https://...)"
          disabled={items.length >= maxImages}
          className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-mono"
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          disabled={!manualUrl.trim() || items.length >= maxImages}
          className="px-3 py-1.5 rounded border border-border bg-surface text-xs font-medium text-content hover:border-mg disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus size={13} strokeWidth={1.5} />
          <span>Add</span>
        </button>
      </div>

      {uploadError && (
        <div className="text-xs font-medium text-red-600 flex items-center gap-1.5">
          <AlertCircle size={13} strokeWidth={1.5} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Ordered Image List with Drag-and-Drop Reordering */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={`${item.url}-${idx}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(idx);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(idx));
              }}
              onDragOver={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  setDragOverIndex(idx);
                }
              }}
              onDragLeave={() => {
                if (dragOverIndex === idx) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  handleMove(dragIndex, idx);
                  setDragIndex(null);
                  setDragOverIndex(null);
                }
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`p-3 bg-cream/40 border rounded flex flex-col sm:flex-row gap-3 items-start transition-colors ${
                dragOverIndex === idx && dragIndex !== idx
                  ? 'border-mg bg-mg-pale/40'
                  : 'border-border'
              }`}
            >
              {/* Drag Handle & Order Controls */}
              <div className="flex sm:flex-col items-center gap-1 shrink-0 pt-1">
                <span
                  title="Drag to reorder"
                  className="p-1 text-content-muted hover:text-mg cursor-grab active:cursor-grabbing"
                >
                  <GripVertical size={15} strokeWidth={1.5} />
                </span>
                <span className="text-[11px] font-mono text-content-muted">#{idx + 1}</span>
                <div className="flex sm:flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx - 1)}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-0.5 text-content-muted hover:text-mg disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, idx + 1)}
                    disabled={idx === items.length - 1}
                    title="Move down"
                    className="p-0.5 text-content-muted hover:text-mg disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="w-24 h-24 shrink-0 rounded border border-border bg-surface overflow-hidden flex items-center justify-center">
                <img
                  src={resolvePreviewSrc(item.url)}
                  alt={getLocalizedText(item.alt, activeLangTab) || `Gallery image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metadata Inputs */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[11px] font-mono text-content-muted truncate max-w-xs sm:max-w-md">
                    {item.url}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove image"
                    className="px-2 py-1 rounded border border-border text-xs text-red-600 hover:border-red-400 hover:bg-red-50/40 inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-content-secondary mb-0.5">
                      Caption ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={getLocalizedText(item.caption, activeLangTab)}
                      onChange={(e) => handleItemTextChange(idx, 'caption', e.target.value)}
                      dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                      placeholder={`Optional caption (${activeLangTab.toUpperCase()})...`}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-content-secondary mb-0.5">
                      Alt Text ({activeLangTab.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={getLocalizedText(item.alt, activeLangTab)}
                      onChange={(e) => handleItemTextChange(idx, 'alt', e.target.value)}
                      dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                      placeholder={`Optional alt text (${activeLangTab.toUpperCase()})...`}
                      className="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
