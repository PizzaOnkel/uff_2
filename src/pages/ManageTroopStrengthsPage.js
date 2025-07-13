import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { doc } from "firebase/firestore";

export default function ManageTroopStrengthsPage({ t, setCurrentPage }) {
  const [strengths, setStrengths] = useState([]);
  const [newStrength, setNewStrength] = useState("");

  // Firestore: Truppenstärken automatisch laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "troopStrengths"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        value: doc.data().value
      }));
      setStrengths(list);
    });
    return () => unsub();
  }, []);

  // Truppenstärke zu Firestore hinzufügen
  const handleAddStrength = async () => {
    if (!newStrength.trim()) return;
    await addDoc(collection(db, "troopStrengths"), { value: newStrength.trim() });
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
          placeholder="Neue Truppenstärke (z.B. 5000)"
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
        {strengths.map(strength => (
          <li key={strength.id} className="flex justify-between items-center bg-gray-800 rounded p-2 mb-2">
            <span>{strength.value}</span>
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