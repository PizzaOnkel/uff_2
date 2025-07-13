import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import NavigationPage from './pages/NavigationPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ComingSoonPage from './pages/ComingSoonPage';

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  switch (currentPage) {
    case ROUTES.HOME:
      return <HomePage {...commonProps} />;
    case ROUTES.INFO:
      return <InfoPage {...commonProps} />;
    case ROUTES.NAVIGATION:
      return <NavigationPage {...commonProps} />;
    case ROUTES.ADMIN_PANEL:
      return <AdminPanelPage {...commonProps} />;
    // Weitere Seiten analog einfügen!
    default:
      return <HomePage {...commonProps} />;
  }
}

export default App;