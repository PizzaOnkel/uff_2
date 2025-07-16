import React from 'react';

// Test einzelner Imports
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import ManageChestMappingPage from './pages/ManageChestMappingPage';

function App() {
  // Prüfung der Imports
  console.log('HomePage type:', typeof HomePage);
  console.log('HomePage:', HomePage);
  console.log('AdminLoginPage type:', typeof AdminLoginPage);
  console.log('AdminLoginPage:', AdminLoginPage);
  console.log('ManageChestMappingPage type:', typeof ManageChestMappingPage);
  console.log('ManageChestMappingPage:', ManageChestMappingPage);

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Simple Import Test</h1>
      <p>Check console for import details</p>
      <p>All imports should be functions, not objects</p>
    </div>
  );
}

export default App;
