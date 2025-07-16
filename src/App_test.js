import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';

// Teste alle Imports
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
        <HomePage {...commonProps} />
        <div>
          <h2>Alle Komponenten erfolgreich importiert!</h2>
          <p>HomePage, InfoPage, NavigationPage, AdminPanelPage, ManagePlayersPage, ManageRanksPage, ManageTroopStrengthsPage, ManageNormsPage, ManageChestMappingPage, AdminRegistrationPage, ManageAdminRequestsPage, CreatePeriodPage, UploadResultsPage, ContactFormPage, ComingSoonPage, AdminLoginPage, CurrentTotalEventPage</p>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
