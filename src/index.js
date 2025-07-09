// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Stelle sicher, dass deine CSS-Datei korrekt importiert wird
import App from './App'; // Importiere deine Haupt-App-Komponente
import { FirebaseProvider } from './FirebaseContext'; // Importiere den FirebaseProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Umschließe deine gesamte App mit dem FirebaseProvider */}
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);
