import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import NavigationPage from './pages/NavigationPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ManagePlayersPage from './pages/ManagePlayersPage';
import ManageRanksPage from './pages/ManageRanksPage';
import ManageTroopStrengthsPage from './pages/ManageTroopStrengthsPage';
import ManageNormsPage from './pages/ManageNormsPage';
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
        // weitere Kategorien nach Bedarf...
      }
    }
    // weitere Spieler...
  ]
};

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  // AdminPanel und Admin-Seiten nur nach Login anzeigen
  if (
    [
      ROUTES.ADMIN_PANEL,
      ROUTES.MANAGE_PLAYERS,
      ROUTES.MANAGE_RANKS,
      ROUTES.MANAGE_TROOP_STRENGTHS,
      ROUTES.MANAGE_NORMS,
      ROUTES.UPLOAD_RESULTS,
      ROUTES.CREATE_PERIOD,
      ROUTES.CURRENT_TOTAL_EVENT_ADMIN,
      ROUTES.EVENT_ARCHIVE_ADMIN
    ].includes(currentPage) && !isAdmin
  ) {
    return (
      <AdminLoginPage
        t={t}
        setCurrentPage={setCurrentPage}
        setIsAdmin={setIsAdmin}
      />
    );
  }

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
    case ROUTES.CREATE_PERIOD:
      return <CreatePeriodPage {...commonProps} />;
    case ROUTES.UPLOAD_RESULTS:
      return <UploadResultsPage {...commonProps} />;
    case ROUTES.CONTACT_FORM:
      return <ContactFormPage {...commonProps} />;
    // HIER: Zeige die Event-Seite mit Beispiel-Daten!
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
}

export default App;