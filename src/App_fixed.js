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
      totalPoints: 3456,
      norm: 4000,
      timestamp: "2025-07-14T12:34:56",
      chests: {
        "Arena Chests": {
          10: { count: 2, points: 100 },
          15: { count: 1, points: 80 },
        },
        "Common Chests": {
          10: { count: 3, points: 60 },
        },
        // weitere Kategorien nach Bedarf...
      }
    },
    {
      id: 2,
      name: "Erika Musterfrau",
      rank: "Offizier",
      troopStrength: 11000,
      totalChests: 8,
      totalPoints: 2890,
      norm: 3200,
      timestamp: "2025-07-14T12:34:56",
      chests: {
        "Arena Chests": {
          10: { count: 1, points: 50 },
          15: { count: 2, points: 160 },
        },
        "Common Chests": {
          10: { count: 2, points: 40 },
        },
        "Rare Chests": {
          10: { count: 1, points: 100 },
        },
        // weitere Kategorien nach Bedarf...
      }
    },
    // Weitere Beispielspieler...
  ],
  summary: {
    totalPlayers: 50,
    totalChests: 500,
    totalPoints: 125000,
    averagePointsPerPlayer: 2500,
    topPlayer: "Max Mustermann",
    lastUpdated: "2025-07-14T12:34:56"
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');

  const t = translations[language];

  const commonProps = {
    currentPage,
    setCurrentPage,
    language,
    setLanguage,
    t
  };

  const renderPage = () => {
    switch (currentPage) {
      case ROUTES.HOME:
        return <HomePage {...commonProps} />;
      case ROUTES.INFO:
        return <InfoPage {...commonProps} />;
      case ROUTES.NAVIGATION:
        return <NavigationPage {...commonProps} />;
      case ROUTES.ADMIN_LOGIN:
        return <AdminLoginPage {...commonProps} />;
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
        return <CurrentTotalEventPage {...commonProps} clanData={exampleClanData} />;
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
  };

  return (
    <AuthProvider>
      <div className="App">
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;
