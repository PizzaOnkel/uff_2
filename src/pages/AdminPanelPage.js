// src/pages/AdminPanelPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js'; // Pfad anpassen, falls nötig
import { getDoc } from 'firebase/firestore'; // 'getDoc' importiert, falls direkt verwendet wird
import { Home, Settings, Plus, User, Archive, AlertCircle, LogOut } from 'lucide-react'; // Benötigte Icons, LogOut hinzugefügt

const AdminPanelPage = ({ navigateTo, t, db, appId }) => {
  const { auth, userId, isAuthReady } = useFirebase(); // auth und isAuthReady aus dem Kontext holen
  const [loading, setLoading] = useState(true); // Initial auf true
  const [error, setError] = useState(null);

  // Definition einer einfachen Loader-Komponente für diese Seite
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  useEffect(() => {
    // Warten, bis Firebase Auth bereit ist
    if (!isAuthReady) {
      return;
    }

    // Überprüfen, ob ein Benutzer angemeldet ist
    if (!auth.currentUser) {
      setError(t('notAuthorizedAdmin')); // Neue Übersetzung für nicht autorisiert
      setLoading(false);
      return;
    }

    // Wenn angemeldet, dann lade/prüfe Admin-Status
    const checkAdminStatus = async () => {
      if (!db || !appId || !userId) {
        setError(t('errorLoadingData') + ". Firebase oder User-ID nicht verfügbar.");
        setLoading(false);
        return;
      }
      try {
        // Beispiel: Überprüfung, ob der aktuelle Benutzer Admin-Rechte hat
        // Dies ist nur ein Platzhalter. Du müsstest deine tatsächliche Admin-Logik hier implementieren.
        // Z.B. eine Abfrage in Firestore, ob der userId in einer Admin-Rolle ist.
        // const userDocRef = db.collection('adminRoles').doc(userId); // Beispielpfad
        // const userSnap = await getDoc(userDocRef);
        // if (!userSnap.exists() || !userSnap.data().isAdmin) {
        //   setError(t('notAuthorizedAdmin'));
        //   setLoading(false);
        //   return;
        // }

        setLoading(false); // Fertig mit dem Laden/Prüfen
      } catch (err) {
        console.error("Fehler im Admin-Panel:", err);
        setError(t('errorLoadingData'));
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [auth, isAuthReady, db, appId, userId, t]); // Abhängigkeiten aktualisiert

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigateTo('welcome'); // Nach dem Logout zur Willkommensseite navigieren
    } catch (error) {
      console.error("Fehler beim Logout:", error);
      setError(t('logoutFailed')); // Neue Übersetzung für Logout-Fehler
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <AlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">{error}</p>
          {!auth.currentUser && ( // Nur Login-Button anzeigen, wenn nicht angemeldet
            <button
              onClick={() => navigateTo('auth')}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
            >
              {t('loginButton')}
            </button>
          )}
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

          {/* Hier könnten weitere Admin-Optionen hinzugefügt werden */}
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
