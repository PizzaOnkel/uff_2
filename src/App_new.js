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

// Beispiel-Daten für die Event-Seite
const exampleClanData = {
  players: [
    {
      id: 1,
      name: "Max Mustermann",
      rank: "Clanführer",
      troopStrength: 12345,
      totalChests: 12,
      totalPoints: 3500,
      norm: 3500,
      timestamp: "2025-07-14T12:30:45",
      chests: {
        "Arena Chests": {
          10: { count: 3, points: 150 },
          11: { count: 2, points: 140 },
        },
        "Rare Chests": {
          10: { count: 1, points: 60 },
          11: { count: 2, points: 150 },
        },
      }
    },
    {
      id: 2,
      name: "Anna Beispiel",
      rank: "Stellvertreter",
      troopStrength: 11000,
      totalChests: 10,
      totalPoints: 3000,
      norm: 3500,
      timestamp: "2025-07-14T12:35:12",
      chests: {
        "Arena Chests": {
          10: { count: 1, points: 50 },
        },
        "Rare Chests": {
          10: { count: 2, points: 120 },
        },
      }
    }
  ]
};

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  const adminPages = [
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
  ];

  return (
    <AuthProvider>
      <div className="App">
        {/* AdminPanel und Admin-Seiten nur nach Login anzeigen */}
        {adminPages.includes(currentPage) && !isAdmin ? (
          <AdminLoginPage
            t={t}
            setCurrentPage={setCurrentPage}
            setIsAdmin={setIsAdmin}
          />
        ) : (
          <>
            {currentPage === ROUTES.HOME && <HomePage {...commonProps} />}
            {currentPage === ROUTES.INFO && <InfoPage {...commonProps} />}
            {currentPage === ROUTES.NAVIGATION && <NavigationPage {...commonProps} />}
            {currentPage === ROUTES.ADMIN_PANEL && <AdminPanelPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_PLAYERS && <ManagePlayersPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_RANKS && <ManageRanksPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_TROOP_STRENGTHS && <ManageTroopStrengthsPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_NORMS && <ManageNormsPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_CHEST_MAPPING && <ManageChestMappingPage {...commonProps} />}
            {currentPage === ROUTES.ADMIN_REGISTRATION && <AdminRegistrationPage {...commonProps} />}
            {currentPage === ROUTES.MANAGE_ADMIN_REQUESTS && <ManageAdminRequestsPage {...commonProps} />}
            {currentPage === ROUTES.CREATE_PERIOD && <CreatePeriodPage {...commonProps} />}
            {currentPage === ROUTES.UPLOAD_RESULTS && <UploadResultsPage {...commonProps} />}
            {currentPage === ROUTES.CONTACT_FORM && <ContactFormPage {...commonProps} />}
            {currentPage === ROUTES.CURRENT_TOTAL_EVENT && <CurrentTotalEventPage {...commonProps} clanData={exampleClanData} />}
            {currentPage === ROUTES.STANDARDS_EVALUATION && <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.standardsEvaluationTitle} />}
            {currentPage === ROUTES.EVENT_ARCHIVE && <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.eventArchiveTitle} />}
            {currentPage === ROUTES.TOP_TEN && <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.topTenTitle} />}
            {currentPage === ROUTES.HALL_OF_CHAMPIONS && <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.hallOfChampionsTitle} />}
            {currentPage === ROUTES.CURRENT_TOTAL_EVENT_ADMIN && <ComingSoonPage {...commonProps} backPage={ROUTES.ADMIN_PANEL} title={t.currentTotalEventTitle} />}
            {currentPage === ROUTES.EVENT_ARCHIVE_ADMIN && <ComingSoonPage {...commonProps} backPage={ROUTES.ADMIN_PANEL} title={t.eventArchiveTitle} />}
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
