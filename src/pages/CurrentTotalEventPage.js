// src/pages/CurrentTotalEventPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
// NEU: collection, query, orderBy, onSnapshot importieren
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Plus, Eye, Home, AlertCircle, Loader } from 'lucide-react'; // Stelle sicher, dass alle benötigten Lucide Icons hier importiert sind

const CurrentTotalEventPage = ({ navigateTo, t, appId }) => { // userId, periodId, playerId werden hier nicht direkt verwendet
  const { db, isAuthReady } = useFirebase(); // db und isAuthReady aus dem Kontext holen
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definition einer einfachen Loader-Komponente direkt in dieser Datei
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  useEffect(() => {
    console.log("CurrentTotalEventPage: useEffect gestartet.");
    console.log("CurrentTotalEventPage: isAuthReady:", isAuthReady);
    console.log("CurrentTotalEventPage: db:", db);
    console.log("CurrentTotalEventPage: appId:", appId);

    if (!isAuthReady || !db) {
      console.log("CurrentTotalEventPage: Firebase Auth oder DB nicht bereit, warten...");
      // Fehler, falls Firebase-Abhängigkeiten fehlen
      // setError(t('firebaseNotReady')); // Kommentar: Fehler hier nicht setzen, da wir noch warten
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // KORREKTUR: Verwende die modulare Syntax für collection
        // Annahme: Events sind direkt unter der App-ID gespeichert
        const eventsCollectionRef = collection(db, 'applications', appId, 'events');
        // Beispiel-Query: Hole Events, die noch nicht abgeschlossen sind, sortiert nach Datum
        // Du könntest hier auch where-Klauseln hinzufügen, z.B. where("status", "==", "active")
        const q = query(eventsCollectionRef, orderBy("date", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const eventsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEvents(eventsList);
          setLoading(false);
          console.log("CurrentTotalEventPage: Events erfolgreich geladen.");
        }, (err) => {
          console.error("CurrentTotalEventPage: Fehler beim Laden der Events:", err);
          setError(t('errorLoadingData') + `: ${err.message}`);
          setLoading(false);
        });

        return () => unsubscribe(); // Cleanup-Funktion für den Listener
      } catch (e) {
        console.error("CurrentTotalEventPage: Fehler beim Einrichten des Listeners:", e);
        setError(t('errorLoadingData') + `: ${e.message}`);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [db, appId, isAuthReady, t]); // Abhängigkeiten aktualisiert

  if (loading) {
    return <Loader />; // Verwende die definierte Loader-Komponente
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-inter">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-center">
          <AlertCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">{error}</p>
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
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-green-400 text-center">
          {t('currentEventsTitle')}
        </h2>

        {/* Hier folgt der Inhalt zur Anzeige der Events */}
        {events.length === 0 ? (
          <p className="text-center text-gray-400">{t('noEventsForPeriod')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-600 text-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">{t('name')}</th>
                  <th className="py-3 px-4 text-left">{t('date')}</th>
                  <th className="py-3 px-4 text-left">{t('location')}</th>
                  <th className="py-3 px-4 text-left">{t('status')}</th>
                  <th className="py-3 px-4 text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-650">
                    <td className="py-3 px-4">{event.name}</td>
                    <td className="py-3 px-4">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{event.location}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'active' ? 'bg-green-500 text-white' :
                        event.status === 'completed' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-gray-900'
                      }`}>
                        {t(event.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* Annahme: 'eventDetails' ist eine Seite, die du noch erstellen könntest */}
                      <button
                        onClick={() => navigateTo('eventDetails', { eventId: event.id })}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => navigateTo('navigation')}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          <Home className="mr-2" size={24} /> {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default CurrentTotalEventPage;
