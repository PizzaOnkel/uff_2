import React, { useState, useEffect } from "react";
import { getDocs, collection, query, where, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ROUTES } from "../routes";
import { db } from "../firebase";


export default function CreatePeriodPage({ t, setCurrentPage }) {

  // Öffnet Modal und prüft, ob noch Ergebnisse für diese Periode existieren
  const handleDeletePeriod = async (id) => {
    setDeleteLoading(true);
    // Prüfe, ob noch Ergebnisse mit dieser periodId existieren
    const q = query(collection(db, "results"), where("periodId", "==", id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setDeleteWarning("Achtung: Zu dieser Veranstaltungsperiode existieren noch Ergebnisdaten! Bitte lösche zuerst die zugehörige Eventdatei im Admin-Dashboard. Erst dann kann die Periode gelöscht werden.");
    } else {
      setDeleteWarning("");
    }
    setDeletePeriodId(id);
    setShowDeleteModal(true);
    setDeleteLoading(false);
  };

  // Bestätigtes Löschen
  const confirmDeletePeriod = async () => {
    if (!deletePeriodId) return;
    setDeleteLoading(true);
    await deleteDoc(doc(db, "periods", deletePeriodId));
    setShowDeleteModal(false);
    setDeletePeriodId(null);
    setDeleteWarning("");
    setDeleteLoading(false);
  };

  // Modal schließen
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePeriodId(null);
    setDeleteWarning("");
  };
  const [periods, setPeriods] = useState([]);
  const [form, setForm] = useState({
    start: "",
    end: "",
    name: ""
  });
  // Modal-Dialog State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePeriodId, setDeletePeriodId] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

// ...existing code...

  // Firestore: Veranstaltungsperioden automatisch laden
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "periods"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Nach Startdatum sortieren (aufsteigend)
      list.sort((a, b) => {
        if (!a.start) return 1;
        if (!b.start) return -1;
        return new Date(a.start) - new Date(b.start);
      });
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
            <li key={period.id} className="bg-gray-800 rounded p-2 mb-2 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span><b>Name:</b> {period.name}</span><br />
                <span><b>Beginn:</b> {period.start}</span><br />
                <span><b>Ende:</b> {period.end}</span>
              </div>
              <button
                onClick={async () => await handleDeletePeriod(period.id)}
                className="mt-2 md:mt-0 px-4 py-1 bg-red-700 hover:bg-red-900 text-white rounded shadow"
                disabled={deleteLoading}
              >
                Löschen
              </button>
      {/* Modal-Dialog für sicheres Löschen */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg max-w-md w-full border border-red-500">
            <h4 className="text-xl font-bold mb-2 text-red-400">Veranstaltungsperiode löschen</h4>
            {deleteWarning ? (
              <div className="mb-4 text-yellow-300 font-semibold">
                {deleteWarning}
                <div className="mt-2 text-sm text-gray-300">Bitte lösche zuerst die zugehörige Eventdatei im Admin-Dashboard.<br/>Hast du das erledigt, schließe dieses Fenster und versuche es erneut.</div>
              </div>
            ) : (
              <div className="mb-4 text-gray-200">Möchtest du diese Veranstaltungsperiode wirklich löschen?</div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-700"
                disabled={deleteLoading}
              >Abbrechen</button>
              <button
                onClick={confirmDeletePeriod}
                className={`px-4 py-2 rounded text-white font-semibold ${deleteWarning ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-900'}`}
                disabled={!!deleteWarning || deleteLoading}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
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
