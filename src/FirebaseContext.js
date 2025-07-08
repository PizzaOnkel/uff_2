// src/FirebaseContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [app, setApp] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Initial state is false
  const [errorMessage, setErrorMessage] = useState('');
  const [appId, setAppId] = useState('default-app-id');

  useEffect(() => {
    console.log("FirebaseContext useEffect läuft."); // Debug-Log
    let firebaseConfig = null;
    let initialAuthToken = null;
    let currentAppId = 'default-app-id';

    try {
      // Überprüfe, ob die globalen Variablen definiert und nicht leer sind, bevor sie geparst werden
      if (typeof __firebase_config !== 'undefined' && __firebase_config !== '') {
        firebaseConfig = JSON.parse(__firebase_config);
        console.log("Firebase-Konfiguration erfolgreich geparst."); // Debug-Log
      } else {
        console.log("__firebase_config ist undefined oder leer."); // Debug-Log
      }
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token !== '') {
        initialAuthToken = __initial_auth_token;
        console.log("__initial_auth_token ist vorhanden."); // Debug-Log
      } else {
        console.log("__initial_auth_token ist undefined oder leer."); // Debug-Log
      }
      if (typeof __app_id !== 'undefined' && __app_id !== '') {
        currentAppId = __app_id;
        console.log("__app_id ist vorhanden."); // Debug-Log
      } else {
        console.log("__app_id ist undefined oder leer."); // Debug-Log
      }
    } catch (e) {
      console.error("Fehler beim Parsen der Firebase-Konfiguration oder Token:", e); // Debug-Log
      setErrorMessage(`Fehler beim Laden der Firebase-Konfiguration: ${e.message}`);
      setIsAuthReady(true); // App soll trotzdem rendern, auch bei Konfigurationsfehler
      return;
    }

    setAppId(currentAppId);

    // Wenn keine Firebase-Konfiguration verfügbar ist (z.B. lokale Entwicklungsumgebung)
    if (!firebaseConfig) {
      console.error("Firebase-Konfiguration nicht verfügbar (lokale Umgebung erkannt). Setze isAuthReady auf true."); // Debug-Log
      setErrorMessage("Firebase-Konfiguration nicht verfügbar.");
      setIsAuthReady(true); // Setze auf true, damit die App geladen wird
      return;
    }

    // Wenn Firebase-Konfiguration vorhanden ist, initialisiere Firebase
    try {
      console.log("Initialisiere Firebase App..."); // Debug-Log
      const firebaseApp = initializeApp(firebaseConfig);
      const firebaseAuth = getAuth(firebaseApp);
      const firestoreDb = getFirestore(firebaseApp);

      setApp(firebaseApp);
      setAuth(firebaseAuth);
      setDb(firestoreDb);

      console.log("Firebase initialisiert. Starte Auth-Listener..."); // Debug-Log
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("Firebase: Benutzer angemeldet mit UID:", user.uid); // Debug-Log
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
              console.log("Firebase: Erfolgreich mit Custom Token angemeldet."); // Debug-Log
            } else {
              await signInAnonymously(firebaseAuth);
              console.log("Firebase: Erfolgreich anonym angemeldet."); // Debug-Log
            }
          } catch (error) {
            console.error("Firebase: Fehler bei der Authentifizierung:", error); // Debug-Log
            setErrorMessage(`Fehler bei der Authentifizierung: ${error.message}`);
          }
        }
        setIsAuthReady(true); // Authentifizierungsprozess ist abgeschlossen
        console.log("isAuthReady auf true gesetzt (Auth-Listener)."); // Debug-Log
      });

      return () => unsubscribe();

    } catch (error) {
      console.error("Firebase: Fehler bei der Initialisierung:", error); // Debug-Log
      setErrorMessage(`Fehler beim Starten der App: ${error.message}`);
      setIsAuthReady(true); // Setze auf bereit, auch wenn ein Fehler auftritt, um die App zu rendern
      console.log("isAuthReady auf true gesetzt (Initialisierungsfehler)."); // Debug-Log
    }
  }, []); // Leeres Abhängigkeits-Array, um sicherzustellen, dass dies nur einmal ausgeführt wird

  const value = { app, auth, db, userId, isAuthReady, errorMessage, appId };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
