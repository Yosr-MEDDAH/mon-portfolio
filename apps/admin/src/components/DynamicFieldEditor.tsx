import React, { useState, useEffect } from 'react';
import { Languages, AlertCircle } from 'lucide-react';
import type {
  FieldDefinition,
  SupportedLocale,
  Localized,
} from '../shared/types.ts';
import { getFieldLabel } from '../shared/labels.ts';
import { useAdminLang } from '../context/LanguageContext.tsx';

interface DynamicFieldEditorProps {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (newValues: Record<string, unknown>) => void;
  errors?: Record<string, string>;
}

export const DynamicFieldEditor: React.FC<DynamicFieldEditorProps> = ({
  fields,
  values,
  onChange,
  errors = {},
}) => {
  const { locale } = useAdminLang();
  const [activeLangTab, setActiveLangTab] = useState<SupportedLocale>(locale || 'en');

  // Keep in sync if the global admin interface language changes
  useEffect(() => {
    if (locale) {
      setActiveLangTab(locale);
    }
  }, [locale]);

  const handleFieldChange = (key: string, val: unknown) => {
    onChange({
      ...values,
      [key]: val,
    });
  };

  const handleLocalizedChange = (key: string, lang: SupportedLocale, textVal: string) => {
    const currentLoc = (values[key] as Localized<string>) || { en: '', fr: '', ar: '' };
    onChange({
      ...values,
      [key]: {
        ...currentLoc,
        [lang]: textVal,
      },
    });
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Global language tab switcher for localized fields and labels */}
      <div className="flex items-center justify-between p-3 bg-cream/70 border border-border rounded">
        <div className="text-xs font-medium text-content flex items-center gap-2">
          <Languages size={14} strokeWidth={1.5} className="text-content-secondary" />
          <span>Editing Language:</span>
        </div>
        <div className="flex items-center gap-1 bg-surface p-0.5 rounded border border-border text-xs">
          {(['en', 'fr', 'ar'] as SupportedLocale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLangTab(lang)}
              className={`px-3 py-1 rounded transition-colors ${
                activeLangTab === lang
                  ? 'bg-mg text-white font-medium'
                  : 'text-content-secondary hover:text-content'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'ع'}
            </button>
          ))}
        </div>
      </div>

      {/* Render each field dynamically according to its schema definition */}
      {fields.map((field) => {
        const value = values[field.key];
        const error = errors[field.key];
        const label = getFieldLabel(field, activeLangTab);
        const isLoc = field.localized ?? false;

        return (
          <div key={field.key} className="space-y-1.5 p-4 bg-surface border border-border rounded shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-content flex items-center gap-2">
                <span>{label}</span>
                {field.required && (
                  <span className="text-red-600 font-bold">*</span>
                )}
                {isLoc && (
                  <span className="text-[10px] bg-mg-pale text-mg border border-mg-border px-1.5 py-0.5 rounded font-mono">
                    Localized ({activeLangTab.toUpperCase()})
                  </span>
                )}
              </label>
              <span className="text-[11px] font-mono text-content-muted">
                {field.key} : {field.type}
              </span>
            </div>

            {/* Field input switch */}
            {field.type === 'text' && (
              isLoc ? (
                <input
                  type="text"
                  value={((value as Localized<string>)?.[activeLangTab] as string) || ''}
                  onChange={(e) => handleLocalizedChange(field.key, activeLangTab, e.target.value)}
                  dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={`Enter ${label} in ${activeLangTab.toUpperCase()}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={(value as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${label}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
                />
              )
            )}

            {field.type === 'textarea' && (
              isLoc ? (
                <textarea
                  rows={4}
                  value={((value as Localized<string>)?.[activeLangTab] as string) || ''}
                  onChange={(e) => handleLocalizedChange(field.key, activeLangTab, e.target.value)}
                  dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={`Enter ${label} in ${activeLangTab.toUpperCase()}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-sans transition-colors"
                />
              ) : (
                <textarea
                  rows={4}
                  value={(value as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${label}...`}
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-sans transition-colors"
                />
              )
            )}

            {field.type === 'richtext' && (
              isLoc ? (
                <textarea
                  rows={6}
                  value={((value as Localized<string>)?.[activeLangTab] as string) || ''}
                  onChange={(e) => handleLocalizedChange(field.key, activeLangTab, e.target.value)}
                  dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={`Enter ${label} rich text in ${activeLangTab.toUpperCase()}...`}
                  className="w-full px-3 py-2 text-sm font-mono bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
                />
              ) : (
                <textarea
                  rows={6}
                  value={(value as string) || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${label} rich text...`}
                  className="w-full px-3 py-2 text-sm font-mono bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
                />
              )
            )}

            {field.type === 'date' && (
              <input
                type="date"
                value={(value as string) || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg focus:outline-hidden transition-colors"
              />
            )}

            {field.type === 'boolean' && (
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                  className="w-4 h-4 rounded border-border text-mg accent-mg focus:ring-0"
                />
                <span className="text-sm text-content">{label}</span>
              </label>
            )}

            {field.type === 'url' && (
              <input
                type="url"
                value={(value as string) || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder="https://example.com/..."
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-mono transition-colors"
              />
            )}

            {field.type === 'image' && (
  <div className="space-y-2">
    <div className="flex gap-2">
      <input
        type="text"
        value={typeof value === 'string' ? value : (value as { url?: string })?.url || ''}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        placeholder="/assets/images/... or https://..."
        className="flex-1 px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-mono transition-colors"
      />
      <label className="px-3 py-2 text-xs font-medium border border-border rounded bg-surface text-content hover:border-mg cursor-pointer">
        Upload
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const { getAuth } = await import('firebase/auth');
              const auth = getAuth();
              const user = auth.currentUser;
              if (!user) throw new Error('Not authenticated');
              const token = await user.getIdToken();
              const workerUrl = (import.meta as any).env?.VITE_UPLOAD_WORKER_URL || 'https://portfolio-upload-worker.yosr-meddah92.workers.dev';
              const fd = new FormData();
              fd.append('file', file);
              const res = await fetch(`${workerUrl}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Upload failed');
              handleFieldChange(field.key, data.path);
            } catch (err) {
              console.error(err);
              alert(err instanceof Error ? err.message : 'Upload failed');
            }
            e.target.value = '';
          }}
        />
      </label>
    </div>
    {Boolean(value) && (
      <div className="text-xs text-content-muted">
        Preview link: <code className="text-mg font-mono">{String(value)}</code>
      </div>
    )}
    {Boolean(value) && /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value)) && (
      <img
        src={String(value).startsWith('http') ? String(value) : (String(value))}
        alt="preview"
        className="max-h-32 rounded border border-border"
      />
    )}
  </div>
)}

            {field.type === 'tags' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={Array.isArray(value) ? value.join(', ') : (value as string) || ''}
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                    handleFieldChange(field.key, arr);
                  }}
                  placeholder="e.g. React, TypeScript, AI, Cryptography (comma separated)"
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden transition-colors"
                />
                {Array.isArray(value) && value.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {value.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-sm text-xs bg-mg-pale text-mg border border-mg-border">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {field.type === 'media' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={typeof value === 'string' ? value : (value as { url?: string })?.url || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder="https://youtube.com/watch?... or https://arxiv.org/..."
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content placeholder-content-muted focus:border-mg focus:outline-hidden font-mono transition-colors"
                />
              </div>
            )}

            {/* Extensible placeholder for future field types */}
            {['number', 'email', 'select', 'multi-select', 'repeater', 'group', 'relationship', 'location', 'file'].includes(field.type) && (
              <div className="p-3 bg-cream/40 border border-dashed border-border rounded text-xs text-content-muted">
                <span>Field type <strong>{field.type}</strong> ready for extended plugins.</span>
              </div>
            )}

            {error && (
              <div className="text-xs font-medium text-red-600 flex items-center gap-1.5">
                <AlertCircle size={13} strokeWidth={1.5} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
