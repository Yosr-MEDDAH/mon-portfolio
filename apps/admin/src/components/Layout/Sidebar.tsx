import React from 'react';
import {
  LayoutDashboard,
  User,
  Layers,
  FileText,
  Image,
  Layout,
  Clock,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminLang } from '../../context/LanguageContext.tsx';
import { getFirebaseStatus } from '../../firebase/config.ts';

export type AdminTab =
  | 'dashboard'
  | 'profile'
  | 'content-types'
  | 'entries'
  | 'media'
  | 'pages'
  | 'revisions'
  | 'settings';

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

type NavItem = {
  id: AdminTab;
  labelKey: string;
  Icon: LucideIcon;
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { t } = useAdminLang();
  const fbStatus = getFirebaseStatus();

  const navItems: NavItem[] = [
    { id: 'dashboard',      labelKey: 'nav.dashboard',    Icon: LayoutDashboard },
    { id: 'profile',        labelKey: 'nav.profile',      Icon: User },
    { id: 'content-types',  labelKey: 'nav.contentTypes', Icon: Layers },
    { id: 'entries',        labelKey: 'nav.entries',       Icon: FileText },
    { id: 'media',          labelKey: 'nav.media',         Icon: Image },
    { id: 'pages',          labelKey: 'nav.pages',         Icon: Layout },
    { id: 'revisions',      labelKey: 'nav.revisions',     Icon: Clock },
    { id: 'settings',       labelKey: 'nav.settings',      Icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-2xs"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 start-0 z-40 w-64 bg-surface text-content flex flex-col justify-between transition-transform duration-200 ease-in-out border-e border-border ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-serif text-xl tracking-wide text-content flex items-center gap-2">
                <span>Yosr Meddah</span>
              </div>
              <div className="text-xs text-content-muted mt-0.5 tracking-wider uppercase">
                Portfolio CMS
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 flex items-center justify-center border border-border rounded text-content hover:border-mg hover:text-mg transition-colors"
              aria-label="Close menu"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              const { Icon } = item;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-sm transition-colors text-start font-sans ${
                    active
                      ? 'bg-mg-pale text-mg font-medium border-s-2 border-s-mg'
                      : 'text-content-secondary hover:text-content hover:bg-cream'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.5} className="shrink-0" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Project & Connection Status */}
        <div className="p-4 border-t border-border text-xs bg-cream/40">
          <div className="text-content-muted mb-1 flex items-center justify-between">
            <span>Firebase Spark:</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                fbStatus.isMockMode ? 'bg-amber-600' : 'bg-mg'
              }`}
            />
          </div>
          <div className="font-mono text-content-secondary truncate text-[11px]">
            {fbStatus.projectId}
          </div>
          <div className="mt-1 text-[11px] text-content-muted">
            {fbStatus.isMockMode ? t('status.mock') : t('status.connected')}
          </div>
        </div>
      </aside>
    </>
  );
};
