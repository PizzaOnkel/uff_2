// src/pages/AdminPanelPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
import { doc, getDoc, collection, addDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Home, Settings, Plus, User, Archive, AlertCircle, LogOut, Loader, Award } from 'lucide-react'; // Award Icon hinzugefügt

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

  useEffect(() => {
    console.log("AdminPanelPage: useEffect gestartet.");
    console.log("AdminPanelPage: isAuthReady:", isAuthReady);
    console.log("AdminPanelPage: db:", db);
    console.log("AdminPanelPage: auth.currentUser:", auth?.currentUser);
    console.log("AdminPanelPage: appId:", appId);

    if (!isAuthReady) { // Warten, bis Firebase Auth bereit ist
      return;
    }

    if (!auth.currentUser) {
      console.log("AdminPanelPage: Kein Benutzer angemeldet. Setze Fehler.");
      setError(t('notAuthorizedAdmin'));
      setLoadingData(false); // Nicht laden, wenn nicht authentifiziert
      return;
    }

    // Wenn authentifiziert, setzen wir keinen Fehler und zeigen das Panel an
    console.log("AdminPanelPage: Benutzer ist authentifiziert. Zeige Admin-Panel an.");
    setError(null); // Vorherige Fehler löschen
    setLoadingData(false); // Laden beendet, da Benutzer angemeldet
  }, [isAuthReady, auth, db, t]); // db in Abhängigkeiten, falls es für initialen Ladezustand relevant wäre

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

  if (!isAuthReady) {
    return <Loader />;
  }

  if (!auth.currentUser) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-orange-400 text-center">
          <Settings className="inline-block mr-3" size={32} />
          {t('adminPanelTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Button für Ränge verwalten */}
          <button
            onClick={() => navigateTo('manageRanks')} // Navigiert zu 'manageRanks'
            className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 text-lg"
          >
            <Award className="mb-2" size={36} />
            {t('manageRanks')}
          </button>

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
