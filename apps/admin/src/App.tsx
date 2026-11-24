import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { AuthGuard } from './components/AuthGuard.tsx';
import { AdminLayout } from './components/Layout/AdminLayout.tsx';
import type { AdminTab } from './components/Layout/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ContentTypesPage } from './pages/ContentTypesPage.tsx';
import { EntriesPage } from './pages/EntriesPage.tsx';
import { MediaPage } from './pages/MediaPage.tsx';
import { PagesTemplatesPage } from './pages/PagesTemplatesPage.tsx';
import { RevisionsPage } from './pages/RevisionsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <AuthGuard fallbackLogin={<LoginPage />}>
              <AdminLayout currentTab={currentTab} onSelectTab={setCurrentTab}>
                {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
                {currentTab === 'content-types' && <ContentTypesPage />}
                {currentTab === 'entries' && <EntriesPage />}
                {currentTab === 'media' && <MediaPage />}
                {currentTab === 'pages' && <PagesTemplatesPage />}
                {currentTab === 'revisions' && <RevisionsPage />}
                {currentTab === 'settings' && <SettingsPage />}
              </AdminLayout>
            </AuthGuard>
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
