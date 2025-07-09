// src/pages/ManageRanksPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
// NEU: orderBy zu den Firestore-Imports hinzufügen
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore'; 
import { Award, Plus, Trash2, Edit, Home, AlertCircle, Loader } from 'lucide-react'; // Benötigte Icons

const ManageRanksPage = ({ navigateTo, t, appId }) => {
  const { db, isAuthReady, auth } = useFirebase();
  const [ranks, setRanks] = useState([]);
  const [newRankName, setNewRankName] = useState('');
  const [editingRank, setEditingRank] = useState(null); // Speichert den Rang, der gerade bearbeitet wird
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // Für Erfolgs- oder Fehlermeldungen

  // Definition einer einfachen Loader-Komponente
  const Loader = () => (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">{t('loadingData')}</p>
    </div>
  );

  useEffect(() => {
    console.log("ManageRanksPage: useEffect gestartet.");
    console.log("ManageRanksPage: isAuthReady:", isAuthReady);
    console.log("ManageRanksPage: db:", db);
    console.log("ManageRanksPage: auth.currentUser:", auth?.currentUser);
    console.log("ManageRanksPage: appId:", appId);

    if (!isAuthReady || !db) {
      console.log("ManageRanksPage: Firebase Auth oder DB nicht bereit, warten...");
      return;
    }

    if (!auth.currentUser) {
      console.log("ManageRanksPage: Kein Benutzer angemeldet. Setze Fehler.");
      setError(t('notAuthorizedAdmin'));
      setLoading(false);
      return;
    }

    console.log("ManageRanksPage: Benutzer ist angemeldet und DB bereit. Lade Ränge.");
    const ranksCollectionRef = collection(db, 'applications', appId, 'ranks');
    // KORREKTUR: orderBy nach 'createdAt' in aufsteigender Reihenfolge, um Erstellungsreihenfolge zu gewährleisten
    const q = query(ranksCollectionRef, orderBy('createdAt', 'asc')); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ranksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRanks(ranksList);
      setLoading(false);
      console.log("ManageRanksPage: Ränge erfolgreich geladen.");
    }, (err) => {
      console.error("ManageRanksPage: Fehler beim Laden der Ränge:", err);
      setError(t('errorLoadingData') + `: ${err.message}`);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup-Funktion
  }, [db, appId, isAuthReady, auth, t]);

  const handleAddOrUpdateRank = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newRankName.trim()) {
      setMessage({ type: 'error', text: t('rankNameRequired') });
      return;
    }
    setLoading(true);
    try {
      if (editingRank) {
        // Rang aktualisieren
        const rankDocRef = doc(db, 'applications', appId, 'ranks', editingRank.id);
        await updateDoc(rankDocRef, {
          name: newRankName.trim(),
          updatedAt: new Date().toISOString(),
        });
        setMessage({ type: 'success', text: t('rankUpdateSuccess') });
        setEditingRank(null); // Bearbeitungsmodus beenden
      } else {
        // Neuen Rang hinzufügen
        await addDoc(collection(db, 'applications', appId, 'ranks'), {
          name: newRankName.trim(),
          createdAt: new Date().toISOString(), // Sicherstellen, dass createdAt gesetzt wird
        });
        setMessage({ type: 'success', text: t('rankAddSuccess') });
      }
      setNewRankName('');
    } catch (e) {
      console.error("Fehler beim Hinzufügen/Aktualisieren des Rangs:", e);
      setMessage({ type: 'error', text: t('rankActionFailed') + `: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (rank) => {
    setEditingRank(rank);
    setNewRankName(rank.name);
    setMessage('');
  };

  const handleDeleteRank = async (rankId) => {
    if (!window.confirm(t('confirmDeleteRank'))) { // Bestätigungsdialog
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'applications', appId, 'ranks', rankId));
      setMessage({ type: 'success', text: t('rankDeleteSuccess') });
    } catch (e) {
      console.error("Fehler beim Löschen des Rangs:", e);
      setMessage({ type: 'error', text: t('rankActionFailed') + `: ${e.message}` });
    } finally {
      setLoading(false);
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
          <button
            onClick={() => navigateTo('adminPanel')}
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
          <Award className="inline-block mr-3" size={32} />
          {t('manageRanksTitle')}
        </h2>

        {message && (
          <div className={`p-3 rounded-md mb-4 flex items-center justify-center ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAddOrUpdateRank} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder={t('rankNamePlaceholder')}
            value={newRankName}
            onChange={(e) => setNewRankName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 text-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={20} /> {t('loading')}
              </>
            ) : (
              <>
                {editingRank ? <Edit className="mr-2" size={24} /> : <Plus className="mr-2" size={24} />}
                {editingRank ? t('updateRankButton') : t('addRankButton')}
              </>
            )}
          </button>
          {editingRank && (
            <button
              type="button"
              onClick={() => { setEditingRank(null); setNewRankName(''); setMessage(''); }}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 text-lg flex items-center justify-center mt-2"
            >
              {t('cancelEdit')}
            </button>
          )}
        </form>

        <h3 className="text-2xl font-bold mb-4 text-gray-200">{t('existingRanks')}</h3>
        {ranks.length === 0 ? (
          <p className="text-center text-gray-400">{t('noRanksYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-600 text-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">{t('name')}</th>
                  <th className="py-3 px-4 text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map(rank => (
                  <tr key={rank.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-650">
                    <td className="py-3 px-4">{rank.name}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => handleEditClick(rank)}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('editRank')}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRank(rank.id)}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
                        title={t('deleteRank')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={() => navigateTo('adminPanel')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 text-lg flex items-center justify-center mx-auto"
        >
          <Home className="mr-2" size={24} /> {t('goBack')}
        </button>
      </div>
    </div>
  );
};

export default ManageRanksPage;
