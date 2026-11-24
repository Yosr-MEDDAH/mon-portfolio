import React, { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import type { Revision, ContentEntry, ContentTypeDefinition, TemplateDefinition, SiteSettings } from '../shared/types.ts';
import {
  fetchAllRevisions,
  saveEntry,
  saveContentType,
  fetchContentTypeById,
  saveTemplate,
  saveSiteSettings,
} from '../firebase/firestore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import { useAdminLang } from '../context/LanguageContext.tsx';

export const RevisionsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotify();
  const { t } = useAdminLang();

  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  const loadRevs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllRevisions(50);
      setRevisions(data);
    } catch (err) {
      notify('error', 'Failed to load revisions: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevs();
  }, []);

  const handleRestore = async (rev: Revision) => {
    if (!user) return;
    if (!confirm(`Restore revision #${rev.revisionNumber} of ${rev.entityType} "${rev.entityId}"? This will create a new revision snapshot with the restored data.`)) {
      return;
    }

    try {
      if (rev.entityType === 'entry') {
        const restoredEntry = rev.snapshot as unknown as ContentEntry;
        const ct = await fetchContentTypeById(restoredEntry.contentTypeId);
        if (!ct) throw new Error(`Parent content type "${restoredEntry.contentTypeId}" not found`);
        await saveEntry(restoredEntry, ct, user.uid, user.email || 'admin@cms.dev', `Restored from revision #${rev.revisionNumber}`);
        notify('success', `Entry restored to revision #${rev.revisionNumber}`);
      } else if (rev.entityType === 'contentType') {
        const restoredCt = rev.snapshot as unknown as ContentTypeDefinition;
        await saveContentType(restoredCt, user.uid, user.email || 'admin@cms.dev', `Restored from revision #${rev.revisionNumber}`);
        notify('success', `Content type restored to revision #${rev.revisionNumber}`);
      } else if (rev.entityType === 'template') {
        const restoredTpl = rev.snapshot as unknown as TemplateDefinition;
        await saveTemplate(restoredTpl, user.uid, user.email || 'admin@cms.dev', `Restored from revision #${rev.revisionNumber}`);
        notify('success', `Template preset restored to revision #${rev.revisionNumber}`);
      } else if (rev.entityType === 'settings') {
        const restoredSettings = rev.snapshot as unknown as SiteSettings;
        await saveSiteSettings(restoredSettings, user.uid, user.email || 'admin@cms.dev');
        notify('success', `Site settings restored to revision #${rev.revisionNumber}`);
      } else {
        notify('warning', `Automatic restore not supported for entity type: ${rev.entityType}`);
      }
      loadRevs();
    } catch (err: unknown) {
      notify('error', err instanceof Error ? err.message : 'Restore failed');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="font-serif text-2xl font-normal text-content">{t('nav.revisions')}</h2>
        <p className="text-xs text-content-muted mt-0.5">
          Immutable audit trail and historical snapshots for all content types and entries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revisions List */}
        <div className="lg:col-span-2 bg-surface border border-border rounded overflow-hidden shadow-2xs">
          <div className="p-3.5 border-b border-border bg-cream/40 font-medium text-xs text-content flex items-center justify-between">
            <span>Historical Revisions ({revisions.length})</span>
            <button
              onClick={loadRevs}
              className="text-xs text-mg hover:text-mg-light font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw size={12} strokeWidth={1.5} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-content-muted">Loading revisions...</div>
          ) : revisions.length > 0 ? (
            <div className="divide-y divide-border">
              {revisions.map((rev) => {
                const isSelected = selectedRevision?.id === rev.id;
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-4 ${
                      isSelected ? 'bg-mg-pale/60 border-s-2 border-s-mg' : 'hover:bg-cream/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-mg">
                          #{rev.revisionNumber}
                        </span>
                        <span className="text-xs font-medium text-content">
                          {rev.entityType}: <code className="text-content-secondary font-mono">{rev.entityId}</code>
                        </span>
                      </div>
                      <div className="text-xs text-content-secondary mt-0.5">
                        {rev.note || 'Snapshot recorded'}
                      </div>
                      <div className="text-[11px] text-content-muted mt-1">
                        Author: <strong className="text-content-secondary font-medium">{rev.authorEmail}</strong> • {new Date(rev.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(rev);
                        }}
                        className="px-2.5 py-1 text-xs font-medium rounded border border-border hover:border-mg hover:text-mg text-content transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        title="Restore this revision safely"
                      >
                        <RotateCcw size={11} strokeWidth={1.5} />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-content-muted">
              No revisions recorded yet. Revisions are created automatically whenever items are saved.
            </div>
          )}
        </div>

        {/* Snapshot Inspector */}
        <div className="bg-surface border border-border rounded p-5 shadow-2xs flex flex-col h-fit">
          <h3 className="font-serif text-lg font-normal text-content border-b border-border pb-2 mb-3">
            Revision Snapshot Inspector
          </h3>

          {selectedRevision ? (
            <div className="space-y-3">
              <div className="text-xs text-content-secondary space-y-1 bg-cream/40 p-3 rounded border border-border">
                <div>Revision: <strong className="font-mono text-mg">#{selectedRevision.revisionNumber}</strong></div>
                <div>Entity: <code className="text-content font-mono">{selectedRevision.entityType}/{selectedRevision.entityId}</code></div>
                <div>Author: <strong className="text-content">{selectedRevision.authorEmail}</strong></div>
                <div className="text-content-muted">{new Date(selectedRevision.timestamp).toLocaleString()}</div>
              </div>

              <pre className="p-3 bg-cream border border-border text-mg rounded text-xs font-mono overflow-x-auto max-h-96">
                {JSON.stringify(selectedRevision.snapshot, null, 2)}
              </pre>

              <button
                type="button"
                onClick={() => handleRestore(selectedRevision)}
                className="w-full py-2 px-3 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Restore this snapshot
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-content-muted">
              Select any revision on the left to inspect its complete underlying snapshot data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
