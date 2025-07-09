// src/App.js (Deine Haupt-App-Datei)

import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext.js';
import { translations } from './translations.js';

// Importiere alle ausgelagerten Seiten-Komponenten
import WelcomePage from './pages/WelcomePage.js';
import InfoPage from './pages/InfoPage.js';
import NavigationPage from './pages/NavigationPage.js';
import CurrentTotalEventPage from './pages/CurrentTotalEventPage.js';
import EventArchivePage from './pages/EventArchivePage.js';
import TopTenPage from './pages/TopTenPage.js';
import AdminPanelPage from './pages/AdminPanelPage.js';
import PlayerDetailsPage from './pages/PlayerDetailsPage.js';
import ArchivedPeriodDetailsPage from './pages/ArchivedPeriodDetailsPage.js';
import AuthPage from './pages/AuthPage.js';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [pageParams, setPageParams] = useState({});
  const [currentLanguage, setCurrentLanguage] = useState('de'); // Standard: Deutsch

  const { db, auth, isAuthReady, userId } = useFirebase();

  // Funktion zur Übersetzung
  const t = (key) => translations[currentLanguage][key] || key;

  // Navigationsfunktion
  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  useEffect(() => {
    // Dieser Effekt stellt sicher, dass der Benutzer zur WelcomePage
    // zurückgeleitet wird, wenn er nicht angemeldet ist und Firebase bereit ist.
    if (isAuthReady && !userId && currentPage !== 'welcome') {
      navigateTo('welcome');
    }
  }, [isAuthReady, userId, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage navigateTo={navigateTo} setLanguage={setCurrentLanguage} currentLanguage={currentLanguage} t={t} />;
      case 'info':
        return <InfoPage navigateTo={navigateTo} t={t} />;
      case 'navigation':
        return <NavigationPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} />;
      case 'currentTotalEvent':
        return <CurrentTotalEventPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} periodId={pageParams.periodId} playerId={pageParams.playerId} />;
      case 'eventArchive':
        return <EventArchivePage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} archivedPeriodId={pageParams.periodId} />;
      case 'topTen':
        return <TopTenPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} periodId={pageParams.periodId} />;
      case 'adminPanel':
        return <AdminPanelPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} />;
      case 'playerDetails':
        return <PlayerDetailsPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} periodId={pageParams.periodId} playerId={pageParams.playerId} />;
      case 'archivedPeriodDetails':
        return <ArchivedPeriodDetailsPage navigateTo={navigateTo} t={t} db={db} appId={typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'} userId={userId} archivedPeriodId={pageParams.periodId} />;
      default:
        return <WelcomePage navigateTo={navigateTo} setLanguage={setCurrentLanguage} currentLanguage={currentLanguage} t={t} />;
      case 'auth':
      return <AuthPage navigateTo={navigateTo} t={t} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white p-4 sm:p-6 lg:p-8 font-inter flex flex-col items-center">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`}
      </style>
      {/* Zeige die Benutzer-ID an, wenn sie verfügbar ist und Firebase bereit ist */}
      {isAuthReady && userId && (
        <div className="absolute top-4 right-4 bg-gray-800 text-gray-300 px-3 py-1 rounded-md text-sm shadow-lg">
          {t('loggedInAs')}: {userId}
        </div>
      )}

      {/* Hier wird die aktuell gerenderte Seite angezeigt */}
      {renderPage()}
    </div>
  );
}

export default App;