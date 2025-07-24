import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import InfoPage from './pages/InfoPage';
import NavigationPage from './pages/NavigationPage';

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  return (
    <AuthProvider>
      <div className="App">
        {(() => {
          switch (currentPage) {
            case ROUTES.HOME:
              return <HomePage {...commonProps} />;
            case ROUTES.INFO:
              return <InfoPage {...commonProps} />;
            case ROUTES.NAVIGATION:
              return <NavigationPage {...commonProps} />;
            default:
              return <HomePage {...commonProps} />;
          }
        })()}
      </div>
    </AuthProvider>
  );
}

export default App;
