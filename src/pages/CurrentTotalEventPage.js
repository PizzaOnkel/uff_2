// src/pages/CurrentTotalEventPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
import { Plus, Eye, Home } from 'lucide-react'; // Stelle sicher, dass alle benötigten Lucide Icons hier importiert sind

const CurrentTotalEventPage = ({ navigateTo, t, db, appId, userId, periodId, playerId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definition einer einfachen Loader-Komponente direkt in dieser Datei
  // Sie hat Zugriff auf 't' für die Übersetzung des Ladetextes
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  useEffect(() => {
    const fetchEvents = async () => {
      if (!db || !appId || !userId) {
        setLoading(false);
        // Fehler, falls Firebase-Abhängigkeiten fehlen
        setError(t('errorLoadingData')); 
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const eventsRef = db.collection('applications').doc(appId).collection('users').doc(userId).collection('events');
        const snapshot = await eventsRef.get();
        const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [db, appId, userId, t]); // 't' in die Abhängigkeitsliste aufnehmen

  if (loading) {
    return <Loader />; // Verwende die definierte Loader-Komponente
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>{error}</p>
        <button
          onClick={() => navigateTo('navigation')}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          {t('goBack')}
        </button>
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