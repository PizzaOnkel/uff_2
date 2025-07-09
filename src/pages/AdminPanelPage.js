// src/pages/AdminPanelPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
import { doc, getDoc, collection, addDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Home, Settings, Plus, User, Archive, AlertCircle, LogOut, Loader } from 'lucide-react';

const AdminPanelPage = ({ navigateTo, t, appId }) => {
  const { auth, db, userId, isAuthReady } = useFirebase();
  const [loadingData, setLoadingData] = useState(false); // Spezifischer Ladezustand für Datenabrufe
  const [error, setError] = useState(null);

  // Definition einer einfachen Loader-Komponente für diese Seite
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  // Dieser useEffect wird nun nur den potenziellen Datenabruf behandeln, *wenn* der Benutzer autorisiert ist.
  // Die primäre Authentifizierungsprüfung erfolgt direkt in der Render-Logik.
  useEffect(() => {
    // Wir versuchen nur Daten zu laden, wenn Firebase bereit UND ein Benutzer authentifiziert ist.
    // Andernfalls zeigt die Render-Logik die 'nicht autorisiert'-Meldung an.
    if (isAuthReady && auth.currentUser && db) {
      // Hier würden Sie alle anfänglichen Datenabrufe für das Admin-Panel selbst einfügen
      // Vorerst gehen wir davon aus, dass kein sofortiger Datenabruf erforderlich ist, um die Schaltflächen anzuzeigen.
      // Wenn Sie hier Daten abrufen müssten, würden Sie setLoadingData(true) und dann false in finally setzen.
      console.log("AdminPanelPage: Benutzer ist authentifiziert und Firebase ist bereit. Zeige Admin-Panel an.");
      setError(null); // Vorherige Fehler löschen
    } else if (isAuthReady && !auth.currentUser) {
      // Wenn die Authentifizierung bereit ist, aber kein Benutzer angemeldet ist, setzen Sie die Fehlermeldung.
      console.log("AdminPanelPage: Firebase Auth bereit, aber kein Benutzer angemeldet.");
      setError(t('notAuthorizedAdmin'));
    } else {
      // Wenn Firebase noch nicht bereit ist, setzen wir keinen Fehler, sondern warten einfach.
      console.log("AdminPanelPage: Firebase noch nicht bereit, warte auf Authentifizierungsstatus.");
    }
  }, [isAuthReady, auth, db, t]);


  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
        navigateTo('welcome');
      } else {
        console.error("AdminPanelPage: Auth-Objekt nicht verfügbar für Logout.");
        setError(t('logoutFailed'));
      }
    } catch (error) {
      console.error("Fehler beim Logout:", error);
      setError(t('logoutFailed') + `: ${error.message}`);
    }
  };

  // Render-Logik basierend auf Authentifizierungsstatus und Ladezustand
  if (!isAuthReady) {
    return <Loader />; // Loader anzeigen, während der Firebase Auth-Status ermittelt wird
  }

  if (!auth.currentUser) {
    // Wenn nicht authentifiziert, Fehlermeldung und Login-Button anzeigen
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <AlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">{error || t('notAuthorizedAdmin')}</p>
          <button
            onClick={() => navigateTo('auth', { redirectPath: 'adminPanel' })}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
          >
            {t('loginButton')}
          </button>
          <button
            onClick={() => navigateTo('navigation')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
          >
            <Home className="mr-2" size={24} /> {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  // Wenn authentifiziert und keine spezifischen Daten geladen werden, den Inhalt des Admin-Panels anzeigen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-orange-400 text-center">
          <Settings className="inline-block mr-3" size={32} />
          {t('adminPanelTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigateTo('manageEvents')}
            className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 text-lg"
          >
            <Plus className="mb-2" size={36} />
            {t('manageEvents')}
          </button>

          <button
            onClick={() => navigateTo('managePlayers')}
            className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 text-lg"
          >
            <User className="mb-2" size={36} />
            {t('managePlayers')}
          </button>

          <button
            onClick={() => navigateTo('createPeriod')}
            className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 text-lg"
          >
            <Archive className="mb-2" size={36} />
            {t('createPeriod')}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto mb-4"
        >
          <LogOut className="mr-2" size={24} /> {t('logout')}
        </button>

        <button
          onClick={() => navigateTo('navigation')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          <Home className="mr-2" size={24} /> {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default AdminPanelPage;
