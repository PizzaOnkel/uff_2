// src/pages/EventArchivePage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
import { Eye, Home, AlertCircle } from 'lucide-react'; // AlertCircle hinzugefügt

const EventArchivePage = ({ navigateTo, t, db, appId, userId }) => {
  const [archivedPeriods, setArchivedPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definition einer einfachen Loader-Komponente für diese Seite
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  useEffect(() => {
    const fetchArchivedPeriods = async () => {
      if (!db || !appId || !userId) {
        setLoading(false);
        setError(t('errorLoadingData'));
        console.error("Firebase oder App/User ID nicht verfügbar.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const periodsRef = db.collection('applications').doc(appId).collection('users').doc(userId).collection('periods');
        // Filter für archivierte Perioden, falls relevant (z.B. ein 'isArchived'-Feld)
        const snapshot = await periodsRef.where('isArchived', '==', true).get(); // Beispielfilter
        const fetchedPeriods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArchivedPeriods(fetchedPeriods);
      } catch (err) {
        console.error("Error fetching archived periods:", err);
        setError(t('errorLoadingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedPeriods();
  }, [db, appId, userId, t]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <AlertCircle className="inline-block mr-2" size={24} />
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
          {t('eventArchiveTitle')}
        </h2>

        {archivedPeriods.length === 0 ? (
          <p className="text-center text-gray-400">{t('noEventsForPeriod')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-600 text-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">{t('name')}</th>
                  <th className="py-3 px-4 text-left">{t('startDate')}</th>
                  <th className="py-3 px-4 text-left">{t('endDate')}</th>
                  <th className="py-3 px-4 text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {archivedPeriods.map(period => (
                  <tr key={period.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-650">
                    <td className="py-3 px-4">{period.name}</td>
                    <td className="py-3 px-4">{new Date(period.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(period.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigateTo('archivedPeriodDetails', { periodId: period.id })}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        <Eye size={20} /> {t('viewDetails')}
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

export default EventArchivePage;