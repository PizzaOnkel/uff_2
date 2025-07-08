// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Stelle sicher, dass diese Datei existiert und die Tailwind-Direktiven enthält
import App from './App'; // Stelle sicher, dass diese Datei existiert
import reportWebVitals from './reportWebVitals';
import { FirebaseProvider } from './FirebaseContext'; // Stelle sicher, dass diese Datei existiert und den Provider exportiert

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Der FirebaseProvider MUSS die App-Komponente umschließen, damit der Kontext verfügbar ist */}
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);

// Wenn du die Leistung deiner App messen möchtest, übermittle ein Web-Vitals-Ergebnis:
// reportWebVitals(console.log);
reportWebVitals();
