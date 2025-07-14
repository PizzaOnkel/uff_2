import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";

export default function ManageRanksPage({ t, setCurrentPage }) {
  const [ranks, setRanks] = useState([]);
  const [newRank, setNewRank] = useState("");

  // Firestore: Ränge automatisch laden und nach Erstellungszeit sortieren
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ranks"), (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt || 0
        }))
        .sort((a, b) => a.createdAt - b.createdAt); // Sortiere nach Erstellungszeit
      setRanks(list);
    });
    return () => unsub();
  }, []);

  // Rang zu Firestore hinzufügen (mit Zeitstempel)
  const handleAddRank = async () => {
    if (!newRank.trim()) return;
    await addDoc(collection(db, "ranks"), { name: newRank.trim(), createdAt: Date.now() });
    setNewRank("");
  };

  // Rang aus Firestore löschen
  const handleDeleteRank = async (id) => {
    await deleteDoc(doc(db, "ranks", id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-yellow-400">{t.manageRanksTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="text"
          value={newRank}
          onChange={e => setNewRank(e.target.value)}
          placeholder="Neuer Rang (z.B. General)"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <button
          onClick={handleAddRank}
          className="px-6 py-2 bg-yellow-600 rounded text-white font-semibold hover:bg-yellow-700 transition w-full"
        >
          Rang hinzufügen
        </button>
      </div>
      <ul className="w-full max-w-xl">
        {ranks.map(rank => (
          <li key={rank.id} className="flex justify-between items-center bg-gray-800 rounded p-2 mb-2">
            <span>{rank.name}</span>
            <button
              onClick={() => handleDeleteRank(rank.id)}
              className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-yellow-300 underline"
      >
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}