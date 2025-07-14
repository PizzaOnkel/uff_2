import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";

export default function ManageNormsPage({ t, setCurrentPage }) {
  const [norms, setNorms] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [selectedTroopStrength, setSelectedTroopStrength] = useState("");
  const [newNormValue, setNewNormValue] = useState("");

  // Normen automatisch laden und nach Erstellungszeit sortieren
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "norms"), (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          troopStrength: doc.data().troopStrength,
          value: doc.data().value,
          createdAt: doc.data().createdAt || 0
        }))
        .sort((a, b) => a.createdAt - b.createdAt);
      setNorms(list);
    });
    return () => unsub();
  }, []);

  // Truppenstärken laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "troopStrengths"), (snapshot) => {
      setTroopStrengths(snapshot.docs.map(doc => doc.data().name));
    });
    return () => unsub();
  }, []);

  // Norm zu Firestore hinzufügen (mit Zeitstempel)
  const handleAddNorm = async () => {
    if (!selectedTroopStrength || !newNormValue.trim()) return;
    await addDoc(collection(db, "norms"), {
      troopStrength: selectedTroopStrength,
      value: newNormValue.trim(),
      createdAt: Date.now()
    });
    setSelectedTroopStrength("");
    setNewNormValue("");
  };

  // Norm aus Firestore löschen
  const handleDeleteNorm = async (id) => {
    await deleteDoc(doc(db, "norms", id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">{t.manageNormsTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <select
          value={selectedTroopStrength}
          onChange={e => setSelectedTroopStrength(e.target.value)}
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        >
          <option value="">Truppenstärke auswählen</option>
          {troopStrengths.map(strength => (
            <option key={strength} value={strength}>{strength}</option>
          ))}
        </select>
        <input
          type="text"
          value={newNormValue}
          onChange={e => setNewNormValue(e.target.value)}
          placeholder="Norm-Wert (z.B. 100)"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <button
          onClick={handleAddNorm}
          className="px-6 py-2 bg-purple-600 rounded text-white font-semibold hover:bg-purple-700 transition w-full"
        >
          Norm hinzufügen
        </button>
      </div>
      <ul className="w-full max-w-xl">
        {norms.map(norm => (
          <li key={norm.id} className="flex justify-between items-center bg-gray-800 rounded p-2 mb-2">
            <span>{norm.troopStrength} ({norm.value})</span>
            <button
              onClick={() => handleDeleteNorm(norm.id)}
              className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-purple-300 underline"
      >
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}