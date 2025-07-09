// src/pages/AuthPage.js

import React, { useState } from 'react';
import { useFirebase } from '../FirebaseContext.js'; // Pfad anpassen, falls nötig
import { LogIn, UserPlus, Home, AlertCircle, CheckCircle2, Loader } from 'lucide-react'; // Benötigte Icons
// NEU: setDoc zu den Firestore-Imports hinzufügen
import { doc, setDoc } from 'firebase/firestore'; 

const AuthPage = ({ navigateTo, t }) => {
  // NEU: signInWithEmailAndPassword, createUserWithEmailAndPassword und signOut direkt aus useFirebase holen
  const { auth, db, userId, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } = useFirebase();
  const [isLogin, setIsLogin] = useState(true); // true für Login, false für Registrierung
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // Für Erfolgs- oder Fehlermeldungen
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!auth) { // Zusätzliche Prüfung, falls auth noch nicht bereit ist
      setMessage({ type: 'error', text: t('firebaseNotReady') });
      setLoading(false);
      return;
    }

    if (isLogin) {
      // Login-Logik
      try {
        await signInWithEmailAndPassword(auth, email, password); // auth als erstes Argument übergeben
        setMessage({ type: 'success', text: t('loginSuccess') });
        navigateTo('navigation'); // Bei Erfolg zur Navigation
      } catch (error) {
        console.error("Login Fehler:", error.code, error.message);
        setMessage({ type: 'error', text: t(error.code) || t('loginFailed') + `: ${error.message}` });
      }
    } else {
      // Registrierungs-Logik
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: t('passwordsDoNotMatch') });
        setLoading(false);
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password); // auth als erstes Argument übergeben
        // Optional: Benutzerdaten in Firestore speichern
        // Hier musst du die appId korrekt übergeben, z.B. als Prop von App.js oder aus dem FirebaseContext
        // Aktuell ist appId nicht direkt in AuthPage verfügbar, außer du holst es aus useFirebase
        // Für den Moment nehmen wir an, dass appId im Kontext verfügbar ist oder direkt übergeben wird
        const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Fallback wie in App.js
        if (db && userCredential.user) {
          // Pfad anpassen: users-Collection direkt unter der App-ID oder als Subcollection
          await setDoc(doc(db, 'applications', currentAppId, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            createdAt: new Date().toISOString(),
            // Weitere initiale Benutzerdaten
          });
        }
        setMessage({ type: 'success', text: t('registerSuccess') });
        navigateTo('navigation'); // Bei Erfolg zur Navigation
      } catch (error) {
        console.error("Registrierungsfehler:", error.code, error.message);
        setMessage({ type: 'error', text: t(error.code) || t('registerFailed') + `: ${error.message}` });
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-purple-400">
          {isLogin ? t('loginTitle') : t('registerTitle')}
        </h2>

        {message && (
          <div className={`p-3 rounded-md mb-4 flex items-center justify-center ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">{t('emailPlaceholder')}</label>
            <input
              type="email"
              id="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">{t('passwordPlaceholder')}</label>
            <input
              type="password"
              id="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">{t('confirmPasswordPlaceholder')}</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} /> {t('loading')}
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="mr-2" size={24} /> : <UserPlus className="mr-2" size={24} />}
                {isLogin ? t('loginButton') : t('registerButton')}
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-blue-400 hover:underline text-md"
        >
          {isLogin ? t('switchToRegister') : t('switchToLogin')}
        </button>

        <button
          onClick={() => navigateTo('welcome')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          <Home className="mr-2" size={24} /> {t('goBackToWelcome')}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
