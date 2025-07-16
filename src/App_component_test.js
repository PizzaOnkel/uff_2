import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';

// Importiere alle Komponenten
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

  // Prüfe alle Komponenten
  const components = {
    HomePage,
    InfoPage,
    NavigationPage,
    AdminPanelPage,
    ManagePlayersPage,
    ManageRanksPage,
    ManageTroopStrengthsPage,
    ManageNormsPage,
    ManageChestMappingPage,
    AdminRegistrationPage,
    ManageAdminRequestsPage,
    CreatePeriodPage,
    UploadResultsPage,
    ContactFormPage,
    ComingSoonPage,
    AdminLoginPage,
    CurrentTotalEventPage
  };

  console.log('Component check:');
  Object.entries(components).forEach(([name, component]) => {
    console.log(`${name}:`, typeof component, component);
  });

  return (
    <AuthProvider>
      <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
        <h1>Component Import Test</h1>
        <p>Check console for component types</p>
        <p>All components should be functions, not objects</p>
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => setCurrentPage(ROUTES.HOME)} style={{ margin: '5px', padding: '10px' }}>
            Home ({typeof HomePage})
          </button>
          <button onClick={() => setCurrentPage(ROUTES.MANAGE_CHEST_MAPPING)} style={{ margin: '5px', padding: '10px' }}>
            Chest Mapping ({typeof ManageChestMappingPage})
          </button>
          <button onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)} style={{ margin: '5px', padding: '10px' }}>
            Admin Panel ({typeof AdminPanelPage})
          </button>
        </div>
        <div style={{ marginTop: '20px', border: '1px solid #333', padding: '20px' }}>
          <h2>Current Page: {currentPage}</h2>
          {currentPage === ROUTES.HOME && <HomePage t={t} language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} />}
          {currentPage === ROUTES.MANAGE_CHEST_MAPPING && <ManageChestMappingPage t={t} setCurrentPage={setCurrentPage} />}
          {currentPage === ROUTES.ADMIN_PANEL && <AdminPanelPage t={t} setCurrentPage={setCurrentPage} />}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
