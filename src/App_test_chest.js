import React from 'react';
import { translations } from './translations/translations';
import { ROUTES } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import ManageChestMappingPage from './pages/ManageChestMappingPage';

function App() {
  const t = translations['de'];
  const setCurrentPage = (page) => console.log('Navigate to:', page);

  return (
    <AuthProvider>
      <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
        <h1>ManageChestMappingPage Test</h1>
        <ManageChestMappingPage t={t} setCurrentPage={setCurrentPage} />
      </div>
    </AuthProvider>
  );
}

export default App;
