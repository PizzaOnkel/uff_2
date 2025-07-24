import React, { useState } from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import ManageChestMappingPage from './pages/ManageChestMappingPage';

function App() {
  const [currentPage, setCurrentPage] = useState(ROUTES.HOME);
  const [language, setLanguage] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const t = translations[language];

  const commonProps = { t, language, setLanguage, setCurrentPage };

  console.log('App rendering with currentPage:', currentPage);
  console.log('HomePage:', HomePage);
  console.log('AdminLoginPage:', AdminLoginPage);
  console.log('ManageChestMappingPage:', ManageChestMappingPage);

  return (
    <AuthProvider>
      <div className="App">
        <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
          <h1>Debug App - Testing Imports</h1>
          <p>Current Page: {currentPage}</p>
          <p>Admin Status: {isAdmin ? 'Yes' : 'No'}</p>
          
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setCurrentPage(ROUTES.HOME)} style={{ margin: '5px', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
              Home
            </button>
            <button onClick={() => setCurrentPage(ROUTES.MANAGE_CHEST_MAPPING)} style={{ margin: '5px', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
              Chest Mapping
            </button>
            <button onClick={() => setIsAdmin(!isAdmin)} style={{ margin: '5px', padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
              Toggle Admin
            </button>
          </div>

          <div style={{ marginTop: '20px', border: '1px solid #333', padding: '20px', borderRadius: '5px' }}>
            {currentPage === ROUTES.HOME && (
              <div>
                <h2>Rendering HomePage</h2>
                <HomePage {...commonProps} />
              </div>
            )}
            
            {currentPage === ROUTES.MANAGE_CHEST_MAPPING && (
              <div>
                <h2>Rendering ManageChestMappingPage</h2>
                <ManageChestMappingPage {...commonProps} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
