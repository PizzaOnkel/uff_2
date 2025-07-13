import React, { useEffect, useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function AdminPanelPage({ t, setCurrentPage }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "results"));
      setResults(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchResults();
  }, []);

  const handleDeleteResult = async () => {
    if (!selectedResultId) return;
    if (!window.confirm("Möchtest du diese JSON-Datei wirklich löschen?")) return;
    try {
      await deleteDoc(doc(db, "results", selectedResultId));
      setResults(results.filter(r => r.id !== selectedResultId));
      setShowDeleteDialog(false);
      setSelectedResultId(null);
      alert("Datei erfolgreich gelöscht!");
    } catch (err) {
      alert("Fehler beim Löschen!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-6 pb-8 w-full">
      <h2 className="text-4xl font-bold mb-10 text-center text-blue-400 mt-12">
        {t.adminPanelTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        {/* ...deine bisherigen Buttons... */}
        {/* ... */}
        {/* Hochladen- und Lösch-Button nebeneinander */}
        <div className="flex flex-col md:flex-row gap-6 col-span-1 md:col-span-2 lg:col-span-3">
          <button
            onClick={() => setCurrentPage(ROUTES.UPLOAD_RESULTS)}
            className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-orange-900/30 hover:bg-orange-800/40 border-orange-800"
            style={{ minWidth: "260px" }}
          >
            <svg className="w-12 h-12 text-orange-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-xl font-semibold text-white text-center mb-1">{t.uploadResults}</span>
            <span className="text-sm text-gray-400 text-center">{t.uploadResultsDesc}</span>
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-red-900/30 hover:bg-red-800/40 border-red-800"
            style={{ minWidth: "260px" }}
          >
            <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 6h18" />
              <path d="M19 6l-2 14H7L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="text-xl font-semibold text-white text-center mb-1">
              Eine hochgeladene Json-Datei löschen
            </span>
            <span className="text-sm text-gray-400 text-center">
              Löscht eine ausgewählte Json-Datei und damit Spieler-Ergebnisse aus Firestore.
            </span>
          </button>
        </div>
        {/* ...weitere Buttons wie gehabt... */}
        <button
          onClick={() => setCurrentPage(ROUTES.MANAGE_PLAYERS)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-green-900/30 hover:bg-green-800/40 border-green-800"
        >
          <svg className="w-12 h-12 text-green-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.managePlayers}</span>
          <span className="text-sm text-gray-400 text-center">{t.managePlayersDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.MANAGE_RANKS)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-yellow-900/30 hover:bg-yellow-800/40 border-yellow-800"
        >
          <svg className="w-12 h-12 text-yellow-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.manageRanks}</span>
          <span className="text-sm text-gray-400 text-center">{t.manageRanksDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.MANAGE_TROOP_STRENGTHS)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-blue-900/30 hover:bg-blue-800/40 border-blue-800"
        >
          <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14.5 17.5L3 6V3h3L18.5 16.5" />
            <path d="M13 19l6-6" />
            <path d="M16 16l4 4" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.manageTroopStrengths}</span>
          <span className="text-sm text-gray-400 text-center">{t.manageTroopStrengthsDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.MANAGE_NORMS)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-purple-900/30 hover:bg-purple-800/40 border-purple-800"
        >
          <svg className="w-12 h-12 text-purple-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.manageNorms}</span>
          <span className="text-sm text-gray-400 text-center">{t.manageNormsDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.CREATE_PERIOD)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-red-900/30 hover:bg-red-800/40 border-red-800"
        >
          <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.createPeriod}</span>
          <span className="text-sm text-gray-400 text-center">{t.createPeriodDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.CURRENT_TOTAL_EVENT_ADMIN)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-teal-900/30 hover:bg-teal-800/40 border-teal-800"
        >
          <svg className="w-12 h-12 text-teal-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.currentTotalEvent}</span>
          <span className="text-sm text-gray-400 text-center">{t.currentTotalEventDesc}</span>
        </button>
        <button
          onClick={() => setCurrentPage(ROUTES.EVENT_ARCHIVE_ADMIN)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-indigo-900/30 hover:bg-indigo-800/40 border-indigo-800"
        >
          <svg className="w-12 h-12 text-indigo-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="4" />
            <rect x="3" y="7" width="18" height="14" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">{t.eventArchiveAdmin}</span>
          <span className="text-sm text-gray-400 text-center">{t.eventArchiveAdminDesc}</span>
        </button>
      </div>
      {/* Dialog zur Auswahl und Löschung */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-xl">
            <h3 className="text-2xl font-semibold mb-4 text-white">Wähle eine Datei zum Löschen aus:</h3>
            {loading ? (
              <p className="text-gray-400">Lade Daten...</p>
            ) : results.length === 0 ? (
              <p className="text-gray-400">Keine Ergebnisdateien vorhanden.</p>
            ) : (
              <ul className="mb-6">
                {results.map(result => (
                  <li
                    key={result.id}
                    className={`flex justify-between items-center border-b border-gray-700 py-2 cursor-pointer ${
                      selectedResultId === result.id ? "bg-red-900/40" : ""
                    }`}
                    onClick={() => setSelectedResultId(result.id)}
                  >
                    <span>
                      <b>Periode:</b> {result.periodId} &nbsp;
                      <b>Timestamp:</b> {result.timestamp}
                    </span>
                    {selectedResultId === result.id && (
                      <span className="ml-2 text-red-400 font-bold">Ausgewählt</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white font-semibold hover:bg-gray-700 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteResult}
                disabled={!selectedResultId}
                className={`px-4 py-2 rounded font-semibold transition ${
                  selectedResultId
                    ? "bg-red-700 text-white hover:bg-red-800"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-xl font-semibold rounded-full shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 mb-12"
      >
        <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t.backToNavigation}
      </button>
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}