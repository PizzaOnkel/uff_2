import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { doc } from "firebase/firestore";

export default function ManageNormsPage({ t, setCurrentPage }) {
  const [norms, setNorms] = useState([]);
  const [form, setForm] = useState({ name: "", value: "" });

  // Firestore: Normen automatisch laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "norms"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        value: doc.data().value
      }));
      setNorms(list);
    });
    return () => unsub();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Norm zu Firestore hinzufügen
  const handleAddNorm = async () => {
    if (!form.name.trim() || !form.value.trim()) return;
    await addDoc(collection(db, "norms"), {
      name: form.name.trim(),
      value: Number(form.value)
    });
    setForm({ name: "", value: "" });
  };

  // Norm aus Firestore löschen
  const handleDeleteNorm = async (id) => {
    await deleteDoc(doc(db, "norms", id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-purple-400">{t.manageNormsTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Normenname (z.B. Clantruhen)"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="number"
          name="value"
          value={form.value}
          onChange={handleChange}
          placeholder="Normwert (z.B. 10)"
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
            <span>{norm.name}: {norm.value}</span>
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