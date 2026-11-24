import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useAdminLang } from '../context/LanguageContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { fetchTemplates, saveTemplate } from '../firebase/firestore.ts';
import type { TemplateDefinition } from '../shared/types.ts';

export const PagesTemplatesPage: React.FC = () => {
  const { t } = useAdminLang();
  const { notify } = useNotify();
  const { user } = useAuth();

  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<TemplateDefinition | null>(null);
  const [isNew, setIsNew] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      notify('error', 'Failed to load templates: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleStartCreate = () => {
    setIsNew(true);
    setEditingTemplate({
      id: `template-${Date.now().toString().slice(-6)}`,
      name: '',
      targetType: 'card',
      layout: 'grid',
      aspectRatio: '16/9',
      description: '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !user) return;

    if (!editingTemplate.name.trim() || !editingTemplate.id.trim()) {
      notify('error', 'Template name and ID are required');
      return;
    }

    try {
      await saveTemplate(
        editingTemplate,
        user.uid,
        user.email || 'admin@cms.dev',
        isNew ? 'Created template preset' : 'Updated template preset'
      );
      notify('success', `Template preset "${editingTemplate.name}" saved successfully`);
      setEditingTemplate(null);
      setIsNew(false);
      loadTemplates();
    } catch (err) {
      notify('error', 'Failed to save template: ' + (err instanceof Error ? err.message : ''));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-content">{t('nav.pages')}</h2>
          <p className="text-xs text-content-muted mt-0.5">
            Manage layout templates, rendering presets, and card geometries persisted in Cloud Firestore.
          </p>
        </div>

        {!editingTemplate && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs flex items-center gap-1.5 self-start cursor-pointer transition-colors"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>New Template Preset</span>
          </button>
        )}
      </div>

      {editingTemplate ? (
        <form onSubmit={handleSave} className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif text-xl font-normal text-content">
              {isNew ? 'Create New Template Preset' : `Configure Preset: ${editingTemplate.name}`}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setIsNew(false);
              }}
              className="px-3 py-1 rounded text-xs border border-border text-content-muted hover:text-content transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Template Preset ID *
              </label>
              <input
                type="text"
                required
                disabled={!isNew}
                value={editingTemplate.id}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, id: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-surface border border-border rounded text-content disabled:bg-cream/50 disabled:text-content-muted focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Preset Name *
              </label>
              <input
                type="text"
                required
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                placeholder="e.g. Minimalist Research Card"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Target Render Context
              </label>
              <select
                value={editingTemplate.targetType}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, targetType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg"
              >
                <option value="card">Card (Collection Listing)</option>
                <option value="detail">Detail (Full Article / Project Page)</option>
                <option value="section">Section (Homepage Feature / Highlight)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Layout Geometry
              </label>
              <select
                value={editingTemplate.layout}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, layout: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg"
              >
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="single">Single (Standalone)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-content mb-1">
                Media Aspect Ratio
              </label>
              <input
                type="text"
                value={editingTemplate.aspectRatio}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, aspectRatio: e.target.value })}
                placeholder="16/9, 4/3, 1/1"
                className="w-full px-3 py-2 text-sm font-mono bg-surface border border-border rounded text-content focus:border-mg transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-content mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingTemplate.description}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                placeholder="Brief description of this template layout purpose..."
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-content focus:border-mg transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setEditingTemplate(null);
                setIsNew(false);
              }}
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
            <div className="p-8 text-center text-xs text-content-muted">Loading templates...</div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-5 bg-surface border border-border rounded shadow-2xs flex flex-col justify-between hover:border-mg transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-medium text-sm text-content">{tpl.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-mg-pale text-mg border border-mg-border">
                        {tpl.targetType}
                      </span>
                    </div>
                    <p className="text-xs text-content-secondary leading-relaxed mb-4">
                      {tpl.description}
                    </p>
                    <div className="text-[11px] font-mono text-content-muted space-y-1">
                      <div>Layout: <strong className="text-content font-medium">{tpl.layout}</strong></div>
                      <div>Aspect Ratio: <strong className="text-content font-medium">{tpl.aspectRatio}</strong></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-end">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingTemplate(tpl);
                      }}
                      className="text-xs font-medium text-mg hover:text-mg-light transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Configure preset</span>
                      <ArrowRight size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-content-muted">
              No template presets configured yet. Click "New Template Preset" to define one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
