// src/pages/ManagePlayersPage.js

import React, { useState, useEffect } from 'react';
import { useFirebase } from '../FirebaseContext.js';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { User, Plus, Trash2, Edit, Home, AlertCircle, Loader } from 'lucide-react'; // Benötigte Icons

const ManagePlayersPage = ({ navigateTo, t, appId }) => {
  const { db, isAuthReady, auth } = useFirebase();
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAlias, setNewPlayerAlias] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null); // Speichert den Spieler, der gerade bearbeitet wird
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
    if (!isAuthReady || !db || !auth.currentUser) {
      console.log("ManagePlayersPage: Firebase Auth oder DB nicht bereit oder nicht angemeldet.");
      setError(t('notAuthorizedAdmin')); // Oder eine spezifischere Meldung
      setLoading(false);
      return;
    }

    const playersCollectionRef = collection(db, 'applications', appId, 'players');
    const q = query(playersCollectionRef, orderBy('name', 'asc')); // Spieler nach Namen sortieren

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playersList);
      setLoading(false);
      console.log("ManagePlayersPage: Spieler erfolgreich geladen.");
    }, (err) => {
      console.error("ManagePlayersPage: Fehler beim Laden der Spieler:", err);
      setError(t('errorLoadingData') + `: ${err.message}`);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup-Funktion
  }, [db, appId, isAuthReady, auth, t]); // auth in Abhängigkeiten hinzugefügt

  const handleAddOrUpdatePlayer = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newPlayerName.trim()) {
      setMessage({ type: 'error', text: t('playerNameRequired') });
      return;
    }
    setLoading(true);
    try {
      if (editingPlayer) {
        // Spieler aktualisieren
        const playerDocRef = doc(db, 'applications', appId, 'players', editingPlayer.id);
        await updateDoc(playerDocRef, {
          name: newPlayerName.trim(),
          alias: newPlayerAlias.trim(),
          // Hier könnten später Rang und Truppenstärke hinzugefügt werden
          updatedAt: new Date().toISOString(),
        });
        setMessage({ type: 'success', text: t('playerUpdateSuccess') });
        setEditingPlayer(null); // Bearbeitungsmodus beenden
      } else {
        // Neuen Spieler hinzufügen
        await addDoc(collection(db, 'applications', appId, 'players'), {
          name: newPlayerName.trim(),
          alias: newPlayerAlias.trim(),
          createdAt: new Date().toISOString(),
          // Hier könnten später Rang und Truppenstärke hinzugefügt werden
        });
        setMessage({ type: 'success', text: t('playerAddSuccess') });
      }
      setNewPlayerName('');
      setNewPlayerAlias('');
    } catch (e) {
      console.error("Fehler beim Hinzufügen/Aktualisieren des Spielers:", e);
      setMessage({ type: 'error', text: t('playerActionFailed') + `: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setNewPlayerAlias(player.alias || '');
    setMessage('');
  };

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm(t('confirmDeletePlayer'))) { // Bestätigungsdialog
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'applications', appId, 'players', playerId));
      setMessage({ type: 'success', text: t('playerDeleteSuccess') });
    } catch (e) {
      console.error("Fehler beim Löschen des Spielers:", e);
      setMessage({ type: 'error', text: t('playerActionFailed') + `: ${e.message}` });
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
          <User className="inline-block mr-3" size={32} />
          {t('managePlayersTitle')}
        </h2>

        {message && (
          <div className={`p-3 rounded-md mb-4 flex items-center justify-center ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAddOrUpdatePlayer} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder={t('playerNamePlaceholder')}
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder={t('playerAliasPlaceholder')}
            value={newPlayerAlias}
            onChange={(e) => setNewPlayerAlias(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Hier würden später Dropdowns für Rang und Truppenstärke hinkommen */}
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
                {editingPlayer ? <Edit className="mr-2" size={24} /> : <Plus className="mr-2" size={24} />}
                {editingPlayer ? t('updatePlayerButton') : t('addPlayerButton')}
              </>
            )}
          </button>
          {editingPlayer && (
            <button
              type="button"
              onClick={() => { setEditingPlayer(null); setNewPlayerName(''); setNewPlayerAlias(''); setMessage(''); }}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 text-lg flex items-center justify-center mt-2"
            >
              {t('cancelEdit')}
            </button>
          )}
        </form>

        <h3 className="text-2xl font-bold mb-4 text-gray-200">{t('existingPlayers')}</h3>
        {players.length === 0 ? (
          <p className="text-center text-gray-400">{t('noPlayersYet')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-600 text-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">{t('name')}</th>
                  <th className="py-3 px-4 text-left">{t('alias')}</th>
                  <th className="py-3 px-4 text-left">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b border-gray-600 last:border-b-0 hover:bg-gray-650">
                    <td className="py-3 px-4">{player.name}</td>
                    <td className="py-3 px-4">{player.alias || '-'}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => handleEditClick(player)}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                        title={t('editPlayer')}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
                        title={t('deletePlayer')}
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

export default ManagePlayersPage;
