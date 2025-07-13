import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function CreatePeriodPage({ t, setCurrentPage }) {
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState({
    start: "",
    end: "",
    name: ""
  });

  // Firestore: Veranstaltungsperioden automatisch laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "periods"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPeriods(list);
    });
    return () => unsub();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Veranstaltungsperiode zu Firestore hinzufügen
  const handleAddPeriod = async () => {
    if (!form.start || !form.end || !form.name) return;
    await addDoc(collection(db, "periods"), {
      name: form.name,
      start: form.start,
      end: form.end
    });
    setForm({ start: "", end: "", name: "" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-8">
      <h2 className="text-4xl font-bold mb-6 text-center text-red-400">{t.createPeriodTitle}</h2>
      <div className="mb-8 w-full max-w-xl">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name der Veranstaltungsperiode"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="datetime-local"
          name="start"
          value={form.start}
          onChange={handleChange}
          placeholder="Beginn"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <input
          type="datetime-local"
          name="end"
          value={form.end}
          onChange={handleChange}
          placeholder="Ende"
          className="mb-2 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
        <button
          onClick={handleAddPeriod}
          className="px-6 py-2 bg-red-600 rounded text-white font-semibold hover:bg-red-700 transition w-full"
        >
          Veranstaltungsperiode hinzufügen
        </button>
      </div>
      <div className="w-full max-w-xl mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-red-300">Bisherige Veranstaltungsperioden</h3>
        <ul>
          {periods.map((period) => (
            <li key={period.id} className="bg-gray-800 rounded p-2 mb-2 flex flex-col">
              <span><b>Name:</b> {period.name}</span>
              <span><b>Beginn:</b> {period.start}</span>
              <span><b>Ende:</b> {period.end}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => setCurrentPage(ROUTES.ADMIN_PANEL)}
        className="mt-8 text-red-300 underline"
      >
        {t.backToAdminPanel}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}