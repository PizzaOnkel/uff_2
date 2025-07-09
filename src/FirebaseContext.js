// src/FirebaseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Erstelle den Firebase Context
const FirebaseContext = createContext(null);

// Benutzerdefinierter Hook zur Verwendung von Firebase
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    console.error('Fehler: useFirebase() wurde außerhalb eines FirebaseProvider aufgerufen.');
    throw new Error('useFirebase() muss innerhalb eines FirebaseProvider verwendet werden.');
  }
  return context;
};

// Firebase Provider Komponente
export const FirebaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Zustand für die Authentifizierungsbereitschaft

  useEffect(() => {
    console.log("FirebaseContext: Starte Initialisierung und Authentifizierung...");
    console.log("REACT_APP_FIREBASE_PROJECT_ID:", process.env.REACT_APP_FIREBASE_PROJECT_ID);
    const initializeFirebase = async () => {
      // Überprüfe, ob die Firebase-Konfiguration verfügbar ist
      if (typeof __firebase_config === 'undefined' || !__firebase_config) {
        console.error('FirebaseContext: Firebase-Konfiguration nicht verfügbar. Bitte stelle sicher, dass __firebase_config gesetzt ist.');
        setIsAuthReady(true); // Setze ready, auch wenn keine Konfig da ist, um Loop zu vermeiden
        return;
      }

      let app;
      try {
        const firebaseConfig = JSON.parse(__firebase_config);
        app = initializeApp(firebaseConfig);
        console.log("FirebaseContext: Firebase App initialisiert.");
      } catch (error) {
        console.error("FirebaseContext: Fehler beim Parsen oder Initialisieren der Firebase-Konfiguration:", error);
        setIsAuthReady(true); // Setze ready bei Fehler, um Loop zu vermeiden
        return;
      }

      const firebaseAuth = getAuth(app);
      const firestoreDb = getFirestore(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      console.log("FirebaseContext: Auth-State-Listener wird eingerichtet.");
      // Authentifizierungs-Listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // Benutzer ist angemeldet
          console.log("FirebaseContext: Benutzer angemeldet. UID:", user.uid);
          setUserId(user.uid);
          setIsAuthReady(true); // Authentifizierung ist bereit
        } else {
          // Benutzer ist abgemeldet oder noch nicht angemeldet
          console.log("FirebaseContext: Kein Benutzer angemeldet. Versuche Anmeldung...");
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
              console.log("FirebaseContext: Versuche Anmeldung mit Custom Token...");
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
              console.log("FirebaseContext: Erfolgreich mit Custom Token angemeldet.");
            } catch (error) {
              console.error("FirebaseContext: Fehler beim Anmelden mit Custom Token:", error);
              console.log("FirebaseContext: Versuche anonyme Anmeldung als Fallback...");
              await signInAnonymously(firebaseAuth);
              console.log("FirebaseContext: Erfolgreich anonym angemeldet (Fallback).");
            }
          } else {
            console.log("FirebaseContext: Kein Custom Token gefunden. Versuche anonyme Anmeldung...");
            await signInAnonymously(firebaseAuth);
            console.log("FirebaseContext: Erfolgreich anonym angemeldet.");
          }
          // Setze die userId nach der Anmeldung (egal ob anonym oder mit Token)
          setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
          setIsAuthReady(true); // Authentifizierung ist bereit, nachdem ein Versuch unternommen wurde
        }
      });

      // Cleanup-Funktion für den Listener
      return () => {
        console.log("FirebaseContext: Auth-State-Listener wird abgemeldet.");
        unsubscribe();
      };
    };

    initializeFirebase();
  }, []); // Leeres Array bedeutet, dass dieser Effekt nur einmal beim Mounten ausgeführt wird

  // Der Wert, der dem Kontext zur Verfügung gestellt wird
  const contextValue = {
    db,
    auth,
    userId,
    isAuthReady, // Füge isAuthReady zum Kontext hinzu
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    where,
    addDoc,
    getDocs
  };

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
