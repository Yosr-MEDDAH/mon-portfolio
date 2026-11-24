import React, { useEffect, useState } from 'react';
import {
  Layers,
  FileText,
  Image,
  Clock,
  Plus,
  ArrowRight,
  User,
} from 'lucide-react';
import {
  fetchContentTypes,
  fetchEntries,
  fetchMediaItems,
  fetchAllRevisions,
  fetchRecentLogs,
} from '../firebase/firestore.ts';
import { useAdminLang } from '../context/LanguageContext.tsx';
import { useNotify } from '../context/NotificationContext.tsx';
import type { ActivityLog } from '../shared/types.ts';
import type { AdminTab } from '../components/Layout/Sidebar.tsx';

interface DashboardPageProps {
  onNavigate: (tab: AdminTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { t } = useAdminLang();
  const { notify } = useNotify();
  const [stats, setStats] = useState({
    contentTypes: 0,
    entries: 0,
    media: 0,
    revisions: 0,
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cts, ents, meds, revs, recentLogs] = await Promise.all([
          fetchContentTypes(false),
          fetchEntries(undefined, false),
          fetchMediaItems(),
          fetchAllRevisions(5),
          fetchRecentLogs(10),
        ]);

        setStats({
          contentTypes: cts.length,
          entries: ents.length,
          media: meds.length,
          revisions: revs.length,
        });
        setLogs(recentLogs);
      } catch (err) {
        console.error('Dashboard load error:', err);
        notify('error', 'Failed to load dashboard data: ' + (err instanceof Error ? err.message : ''));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('content-types')}
          className="p-5 bg-surface border border-border rounded shadow-2xs hover:border-mg cursor-pointer transition-colors"
        >
          <Layers size={18} strokeWidth={1.5} className="text-mg mb-3" />
          <div className="font-serif text-3xl font-normal text-content">
            {loading ? '...' : stats.contentTypes}
          </div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mt-1">
            {t('nav.contentTypes')}
          </div>
        </div>

        <div
          onClick={() => onNavigate('entries')}
          className="p-5 bg-surface border border-border rounded shadow-2xs hover:border-mg cursor-pointer transition-colors"
        >
          <FileText size={18} strokeWidth={1.5} className="text-mg mb-3" />
          <div className="font-serif text-3xl font-normal text-content">
            {loading ? '...' : stats.entries}
          </div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mt-1">
            {t('nav.entries')}
          </div>
        </div>

        <div
          onClick={() => onNavigate('media')}
          className="p-5 bg-surface border border-border rounded shadow-2xs hover:border-mg cursor-pointer transition-colors"
        >
          <Image size={18} strokeWidth={1.5} className="text-mg mb-3" />
          <div className="font-serif text-3xl font-normal text-content">
            {loading ? '...' : stats.media}
          </div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mt-1">
            {t('nav.media')}
          </div>
        </div>

        <div
          onClick={() => onNavigate('revisions')}
          className="p-5 bg-surface border border-border rounded shadow-2xs hover:border-mg cursor-pointer transition-colors"
        >
          <Clock size={18} strokeWidth={1.5} className="text-mg mb-3" />
          <div className="font-serif text-3xl font-normal text-content">
            {loading ? '...' : stats.revisions}
          </div>
          <div className="text-xs font-medium text-content-muted uppercase tracking-wider mt-1">
            {t('nav.revisions')}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs">
        <h2 className="font-serif text-xl font-normal text-content mb-3">
          Quick Management Actions
        </h2>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('profile')}
            className="px-3.5 py-2 rounded bg-mg hover:bg-mg-light text-white font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User size={14} strokeWidth={1.5} />
            <span>Profile & Homepage</span>
          </button>
          <button
            onClick={() => onNavigate('entries')}
            className="px-3.5 py-2 rounded border border-border bg-surface hover:border-mg hover:text-mg text-content font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>New Content Entry</span>
          </button>
          <button
            onClick={() => onNavigate('content-types')}
            className="px-3.5 py-2 rounded border border-border bg-surface hover:border-mg hover:text-mg text-content font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Layers size={14} strokeWidth={1.5} />
            <span>Configure Content Types</span>
          </button>
          <button
            onClick={() => onNavigate('media')}
            className="px-3.5 py-2 rounded border border-border bg-surface hover:border-mg hover:text-mg text-content font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} strokeWidth={1.5} />
            <span>Register External Media</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-surface border border-border rounded p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-normal text-content">
            Recent Activity & Audit Log
          </h2>
          <button
            onClick={() => onNavigate('revisions')}
            className="text-xs text-mg hover:text-mg-light font-medium transition-colors inline-flex items-center gap-1"
          >
            <span>View all history</span>
            <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="font-medium text-content">
                    <span className="font-mono text-mg bg-mg-pale border border-mg-border px-1.5 py-0.5 rounded me-2 text-[11px]">
                      {log.action}
                    </span>
                    {log.details}
                  </div>
                  <div className="text-content-muted mt-0.5">
                    By <strong className="text-content-secondary font-medium">{log.userEmail}</strong>
                  </div>
                </div>
                <div className="text-content-muted font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-content-muted">
            No activity records logged yet.
          </div>
        )}
      </div>
    </div>
  );
};
