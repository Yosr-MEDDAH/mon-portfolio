import React, { useState } from 'react';
import { Sidebar, type AdminTab } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { useAdminLang } from '../../context/LanguageContext.tsx';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useAdminLang();

  const tabTitles: Record<AdminTab, string> = {
    dashboard: t('nav.dashboard'),
    profile: t('nav.profile'),
    'content-types': t('nav.contentTypes'),
    entries: t('nav.entries'),
    media: t('nav.media'),
    pages: t('nav.pages'),
    revisions: t('nav.revisions'),
    settings: t('nav.settings'),
  };

  return (
    <div className="min-h-screen flex bg-cream text-content transition-colors duration-200">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          title={tabTitles[currentTab]}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
