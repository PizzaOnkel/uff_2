import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import ManageAdministratorsPage from './pages/ManageAdministratorsPage';
import CreatePeriodPage from './pages/CreatePeriodPage';
import UploadResultsPage from './pages/UploadResultsPage';
import ContactFormPage from './pages/ContactFormPage';
import EmailTestPage from './pages/EmailTestPage';
import ComingSoonPage from './pages/ComingSoonPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CurrentTotalEventPage from './pages/CurrentTotalEventPage';
import TopTen from './pages/TopTen';
import TopTenCategory from './pages/TopTenCategory';
import AdminDebugPage from './pages/AdminDebugPage';

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

function AppContent() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const { currentAdmin } = useAuth();

  const t = translations[language];

  const commonProps = {
    currentPage,
    setCurrentPage,
    language,
    setLanguage,
    t
  };

  // Admin-Seiten die Login erfordern
  const adminPages = [
    ROUTES.ADMIN_PANEL,
    ROUTES.MANAGE_PLAYERS,
    ROUTES.MANAGE_RANKS,
    ROUTES.MANAGE_TROOP_STRENGTHS,
    ROUTES.MANAGE_NORMS,
    ROUTES.MANAGE_CHEST_MAPPING,
    ROUTES.MANAGE_ADMIN_REQUESTS,
    ROUTES.MANAGE_ADMINISTRATORS,
    ROUTES.CREATE_PERIOD,
    ROUTES.UPLOAD_RESULTS,
    ROUTES.CURRENT_TOTAL_EVENT_ADMIN,
    ROUTES.EVENT_ARCHIVE_ADMIN
  ];

  const renderPage = () => {
    // Wenn es eine Admin-Seite ist und der User nicht angemeldet ist, leite zum Login weiter
    if (adminPages.includes(currentPage) && !currentAdmin) {
      return <AdminLoginPage {...commonProps} />;
    }

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
      case ROUTES.MANAGE_ADMINISTRATORS:
        return <ManageAdministratorsPage {...commonProps} />;
      case ROUTES.CREATE_PERIOD:
        return <CreatePeriodPage {...commonProps} />;
      case ROUTES.UPLOAD_RESULTS:
        return <UploadResultsPage {...commonProps} />;
      case ROUTES.CONTACT_FORM:
        return <ContactFormPage t={t} setCurrentPage={setCurrentPage} />;
      case ROUTES.EMAIL_TEST:
        return <EmailTestPage t={t} setCurrentPage={setCurrentPage} />;
      case ROUTES.ADMIN_DEBUG:
        return <AdminDebugPage t={t} setCurrentPage={setCurrentPage} />;
      case ROUTES.CURRENT_TOTAL_EVENT:
        return <CurrentTotalEventPage {...commonProps} clanData={exampleClanData} />;
      case ROUTES.STANDARDS_EVALUATION:
        return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.standardsEvaluationTitle} />;
      case ROUTES.EVENT_ARCHIVE:
        return <ComingSoonPage {...commonProps} backPage={ROUTES.NAVIGATION} title={t.eventArchiveTitle} />;
      case ROUTES.TOP_TEN:
        return <TopTen {...commonProps} />;
      case ROUTES.TOP_TEN_ARENA:
        return <TopTenCategory {...commonProps} category="Arena Total" categoryInfo={{ label: 'Arena Chests', icon: '⚔️', color: '#7C3AED' }} />;
      case ROUTES.TOP_TEN_COMMON:
        return <TopTenCategory {...commonProps} category="Common Total" categoryInfo={{ label: 'Common Chests', icon: '📦', color: '#10B981' }} />;
      case ROUTES.TOP_TEN_RARE:
        return <TopTenCategory {...commonProps} category="Rare Total" categoryInfo={{ label: 'Rare Chests', icon: '💎', color: '#3B82F6' }} />;
      case ROUTES.TOP_TEN_EPIC:
        return <TopTenCategory {...commonProps} category="Epic Total" categoryInfo={{ label: 'Epic Chests', icon: '👑', color: '#8B5CF6' }} />;
      case ROUTES.TOP_TEN_TARTAROS:
        return <TopTenCategory {...commonProps} category="Tartaros Total" categoryInfo={{ label: 'Tartaros Chests', icon: '🔥', color: '#DC2626' }} />;
      case ROUTES.TOP_TEN_ELVEN:
        return <TopTenCategory {...commonProps} category="Elven Total" categoryInfo={{ label: 'Elven Chests', icon: '🧝', color: '#059669' }} />;
      case ROUTES.TOP_TEN_CURSED:
        return <TopTenCategory {...commonProps} category="Cursed Total" categoryInfo={{ label: 'Cursed Chests', icon: '🌙', color: '#6B46C1' }} />;
      case ROUTES.TOP_TEN_BANK:
        return <TopTenCategory {...commonProps} category="Bank Total" categoryInfo={{ label: 'Bank Chests', icon: '💰', color: '#D97706' }} />;
      case ROUTES.TOP_TEN_RUNIC:
        return <TopTenCategory {...commonProps} category="Runic Total" categoryInfo={{ label: 'Runic Chests', icon: '🔮', color: '#F97316' }} />;
      case ROUTES.TOP_TEN_HEROIC:
        return <TopTenCategory {...commonProps} category="Heroic Total" categoryInfo={{ label: 'Heroic Chests', icon: '🏆', color: '#EF4444' }} />;
      case ROUTES.TOP_TEN_VOTA:
        return <TopTenCategory {...commonProps} category="VotA Total" categoryInfo={{ label: 'Vault of the Ancients', icon: '🏛️', color: '#8B5CF6' }} />;
      case ROUTES.TOP_TEN_ROTA:
        return <TopTenCategory {...commonProps} category="ROTA Total" categoryInfo={{ label: 'Rise of the Ancients', icon: '🌟', color: '#EC4899' }} />;
      case ROUTES.TOP_TEN_EAS:
        return <TopTenCategory {...commonProps} category="EAs Total" categoryInfo={{ label: 'Epic Ancient Squad', icon: '⚡', color: '#F59E0B' }} />;
      case ROUTES.TOP_TEN_UNION:
        return <TopTenCategory {...commonProps} category="Union Total" categoryInfo={{ label: 'Union Chests', icon: '🤝', color: '#6366F1' }} />;
      case ROUTES.TOP_TEN_JORMUNGANDR:
        return <TopTenCategory {...commonProps} category="Jormungandr Total" categoryInfo={{ label: 'Jormungandr Chests', icon: '🐉', color: '#059669' }} />;
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
    <div className="App">
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
