import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";

export default function ManageTroopStrengthsPage({ t, setCurrentPage }) {
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [newStrength, setNewStrength] = useState("");

  // Firestore: Truppenstärken automatisch laden und nach Erstellungszeit sortieren
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "troopStrengths"), (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt || 0
        }))
        .sort((a, b) => a.createdAt - b.createdAt); // Sortiere nach Erstellungszeit
      setTroopStrengths(list);
    });
    return () => unsub();
  }, []);

  // Truppenstärke zu Firestore hinzufügen (mit Zeitstempel)
  const handleAddStrength = async () => {
    if (!newStrength.trim()) return;
    await addDoc(collection(db, "troopStrengths"), { name: newStrength.trim(), createdAt: Date.now() });
    setNewStrength("");
  };

  // Truppenstärke aus Firestore löschen
  const handleDeleteStrength = async (id) => {
    await deleteDoc(doc(db, "troopStrengths", id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{t.manageTroopStrengthsTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="text"
          value={newStrength}
          onChange={e => setNewStrength(e.target.value)}
          placeholder="Neue Truppenstärke (z.B. 100000)"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <button
          onClick={handleAddStrength}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition w-full"
        >
          Truppenstärke hinzufügen
        </button>
      </div>
      <ul className="w-full max-w-xl">
        {troopStrengths.map(strength => (
          <li key={strength.id} className="flex justify-between items-center bg-gray-800 rounded p-2 mb-2">
            <span>{strength.name}</span>
            <button
              onClick={() => handleDeleteStrength(strength.id)}
              className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-blue-300 underline"
      >
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}