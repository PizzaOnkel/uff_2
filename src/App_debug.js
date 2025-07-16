import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import NavigationPage from './pages/NavigationPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ManagePlayersPage from './pages/ManagePlayersPage';
import ManageRanksPage from './pages/ManageRanksPage';
import ManageTroopStrengthsPage from './pages/ManageTroopStrengthsPage';
import ManageNormsPage from './pages/ManageNormsPage';
import ManageChestMappingPage from './pages/ManageChestMappingPage';
import AdminRegistrationPage from './pages/AdminRegistrationPage';
import ManageAdminRequestsPage from './pages/ManageAdminRequestsPage';
import CreatePeriodPage from './pages/CreatePeriodPage';
import UploadResultsPage from './pages/UploadResultsPage';
import ContactFormPage from './pages/ContactFormPage';
import ComingSoonPage from './pages/ComingSoonPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CurrentTotalEventPage from './pages/CurrentTotalEventPage';

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  return (
    <AuthProvider>
      <div className="App">
        {/* AdminPanel und Admin-Seiten nur nach Login anzeigen */}
        {[
          ROUTES.ADMIN_PANEL,
          ROUTES.MANAGE_PLAYERS,
          ROUTES.MANAGE_RANKS,
          ROUTES.MANAGE_TROOP_STRENGTHS,
          ROUTES.MANAGE_NORMS,
          ROUTES.MANAGE_CHEST_MAPPING,
          ROUTES.MANAGE_ADMIN_REQUESTS,
          ROUTES.UPLOAD_RESULTS,
          ROUTES.CREATE_PERIOD,
          ROUTES.CURRENT_TOTAL_EVENT_ADMIN,
          ROUTES.EVENT_ARCHIVE_ADMIN
        ].includes(currentPage) && !isAdmin && (
          <AdminLoginPage
            t={t}
            setCurrentPage={setCurrentPage}
            setIsAdmin={setIsAdmin}
          />
        )}

        {/* Normale Seiten oder Admin-Seiten nach Login */}
        {(!([
          ROUTES.ADMIN_PANEL,
          ROUTES.MANAGE_PLAYERS,
          ROUTES.MANAGE_RANKS,
          ROUTES.MANAGE_TROOP_STRENGTHS,
          ROUTES.MANAGE_NORMS,
          ROUTES.MANAGE_CHEST_MAPPING,
          ROUTES.MANAGE_ADMIN_REQUESTS,
          ROUTES.UPLOAD_RESULTS,
          ROUTES.CREATE_PERIOD,
          ROUTES.CURRENT_TOTAL_EVENT_ADMIN,
          ROUTES.EVENT_ARCHIVE_ADMIN
        ].includes(currentPage) && !isAdmin)) && (
          <>
            {(() => {
              switch (currentPage) {
                case ROUTES.HOME:
                  return <HomePage {...commonProps} />;
                case ROUTES.INFO:
                  return <InfoPage {...commonProps} />;
                case ROUTES.NAVIGATION:
                  return <NavigationPage {...commonProps} />;
                case ROUTES.ADMIN_PANEL:
                  return <AdminPanelPage {...commonProps} />;
                case ROUTES.MANAGE_PLAYERS:
                  return <ManagePlayersPage {...commonProps} />;
                case ROUTES.MANAGE_RANKS:
                  return <ManageRanksPage {...commonProps} />;
                case ROUTES.MANAGE_TROOP_STRENGTHS:
                  return <ManageTroopStrengthsPage {...commonProps} />;
                case ROUTES.MANAGE_NORMS:
                  return <ManageNormsPage {...commonProps} />;
                case ROUTES.MANAGE_CHEST_MAPPING:
                  return <ManageChestMappingPage {...commonProps} />;
                case ROUTES.ADMIN_REGISTRATION:
                  return <AdminRegistrationPage {...commonProps} />;
                case ROUTES.MANAGE_ADMIN_REQUESTS:
                  return <ManageAdminRequestsPage {...commonProps} />;
                case ROUTES.CREATE_PERIOD:
                  return <CreatePeriodPage {...commonProps} />;
                case ROUTES.UPLOAD_RESULTS:
                  return <UploadResultsPage {...commonProps} />;
                case ROUTES.CONTACT_FORM:
                  return <ContactFormPage {...commonProps} />;
                case ROUTES.CURRENT_TOTAL_EVENT:
                  return <CurrentTotalEventPage {...commonProps} />;
                case ROUTES.STANDARDS_EVALUATION:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.standardsEvaluationTitle} />;
                case ROUTES.EVENT_ARCHIVE:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.eventArchiveTitle} />;
                case ROUTES.TOP_TEN:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.topTenTitle} />;
                case ROUTES.HALL_OF_CHAMPIONS:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.hallOfChampionsTitle} />;
                case ROUTES.CURRENT_TOTAL_EVENT_ADMIN:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.ADMIN_PANEL} title={t.currentTotalEventTitle} />;
                case ROUTES.EVENT_ARCHIVE_ADMIN:
                  return <ComingSoonPage {...commonProps} backPage={ROUTES.ADMIN_PANEL} title={t.eventArchiveTitle} />;
                default:
                  return <HomePage {...commonProps} />;
              }
            })()}
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
