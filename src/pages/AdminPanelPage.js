import React, { useEffect, useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function AdminPanelPage({ t, setCurrentPage }) {
  const [results, setResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { currentAdmin, hasPermission, logout } = useAuth();

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "results"));
      const allResults = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResults(allResults);
      
      // Gruppiere Ergebnisse nach Periode und Datum
      const groups = {};
      allResults.forEach(result => {
        const key = `${result.periodId}_${result.eventDate}`;
        if (!groups[key]) {
          groups[key] = {
            periodId: result.periodId,
            eventDate: result.eventDate,
            playerCount: 0,
            documentIds: []
          };
        }
        groups[key].playerCount++;
        groups[key].documentIds.push(result.id);
      });
      
      setGroupedResults(Object.values(groups));
      setLoading(false);
    }
    fetchResults();
  }, []);

  const handleDeleteResult = async () => {
    if (!selectedGroup) return;
    if (!window.confirm(`Möchtest du wirklich alle ${selectedGroup.playerCount} Spieler-Ergebnisse für ${selectedGroup.eventDate} löschen?`)) return;
    
    try {
      // Lösche alle Dokumente dieser Gruppe
      for (const docId of selectedGroup.documentIds) {
        await deleteDoc(doc(db, "results", docId));
      }
      
      // Aktualisiere die lokalen Daten
      setResults(results.filter(r => !selectedGroup.documentIds.includes(r.id)));
      setGroupedResults(groupedResults.filter(g => g !== selectedGroup));
      
      setShowDeleteDialog(false);
      setSelectedGroup(null);
      alert(`Alle ${selectedGroup.playerCount} Spieler-Ergebnisse wurden erfolgreich gelöscht!`);
    } catch (err) {
      alert("Fehler beim Löschen!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-900 text-gray-100 p-6 pb-8 w-full">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-center text-blue-400 mt-12">
            {t.adminPanelTitle}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-300 text-sm">Angemeldet als:</p>
              <p className="text-white font-semibold">{currentAdmin?.name}</p>
              <p className="text-gray-400 text-xs">
                {currentAdmin?.role === 'superAdmin' ? 'Super Admin' : 
                 currentAdmin?.role === 'contentAdmin' ? 'Content Admin' : 'Viewer'}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
        {/* ...deine bisherigen Buttons... */}
        {/* Button für Dateiverwaltung & Uploads (führt zu AdminDashboard2) */}
        <button
          onClick={() => setCurrentPage(ROUTES.ADMIN_DASHBOARD2)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-blue-900/30 hover:bg-blue-800/40 border-blue-800"
          style={{ minWidth: "260px" }}
        >
          <svg className="w-12 h-12 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="4" />
            <rect x="3" y="7" width="18" height="14" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">Dateiverwaltung & Uploads</span>
          <span className="text-sm text-gray-400 text-center">JSON-Dateien hochladen, löschen und aggregieren</span>
        </button>
        {/* ...weitere Buttons wie gehabt... */}
        {hasPermission('manage_players') && (
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
        )}
        {hasPermission('manage_ranks') && (
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
        )}
        {hasPermission('manage_troop_strengths') && (
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
        )}
        {hasPermission('manage_norms') && (
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
        )}
        {hasPermission('manage_chest_mapping') && (
          <button
            onClick={() => setCurrentPage(ROUTES.MANAGE_CHEST_MAPPING)}
            className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-cyan-900/30 hover:bg-cyan-800/40 border-cyan-800"
          >
            <svg className="w-12 h-12 text-cyan-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="text-xl font-semibold text-white text-center mb-1">Truhen-Zuordnungen</span>
            <span className="text-sm text-gray-400 text-center">Verwalte die Zuordnung von Truhen zu Kategorien und Punkten</span>
          </button>
        )}
        {hasPermission('manage_admin_requests') && (
          <button
            onClick={() => setCurrentPage(ROUTES.MANAGE_ADMIN_REQUESTS)}
            className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-emerald-900/30 hover:bg-emerald-800/40 border-emerald-800"
          >
            <svg className="w-12 h-12 text-emerald-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span className="text-xl font-semibold text-white text-center mb-1">Admin-Anfragen</span>
            <span className="text-sm text-gray-400 text-center">Verwalte Administrator-Registrierungsanfragen</span>
          </button>
        )}
        {hasPermission('manage_admin_requests') && (
          <button
            onClick={() => setCurrentPage(ROUTES.MANAGE_ADMINISTRATORS)}
            className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-cyan-900/30 hover:bg-cyan-800/40 border-cyan-800"
          >
            <svg className="w-12 h-12 text-cyan-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xl font-semibold text-white text-center mb-1">Administratoren</span>
            <span className="text-sm text-gray-400 text-center">Verwalte bestehende Administratoren und deren Berechtigungen</span>
          </button>
        )}
        {hasPermission('create_period') && (
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
        )}
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
        {/* E-Mail-Test-Seite für alle Admins */}
        <button
          onClick={() => setCurrentPage(ROUTES.EMAIL_TEST)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-indigo-900/30 hover:bg-indigo-800/40 border-indigo-800"
        >
          <svg className="w-12 h-12 text-indigo-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">E-Mail-Test</span>
          <span className="text-sm text-gray-400 text-center">Teste die E-Mail-Konfiguration</span>
        </button>
        {/* Admin-Debug-Seite für alle Admins */}
        <button
          onClick={() => setCurrentPage(ROUTES.ADMIN_DEBUG)}
          className="flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border bg-red-900/30 hover:bg-red-800/40 border-red-800"
        >
          <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="text-xl font-semibold text-white text-center mb-1">Admin Debug</span>
          <span className="text-sm text-gray-400 text-center">Admin-Requests & E-Mail-Debug</span>
        </button>
      </div>
      {/* Dialog zur Auswahl und Löschung */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg w-full max-w-xl">
            <h3 className="text-2xl font-semibold mb-4 text-white">Wähle eine Datei zum Löschen aus:</h3>
            {loading ? (
              <p className="text-gray-400">Lade Daten...</p>
            ) : groupedResults.length === 0 ? (
              <p className="text-gray-400">Keine Ergebnisdateien vorhanden.</p>
            ) : (
              <ul className="mb-6 max-h-96 overflow-y-auto">
                {groupedResults.map((group, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center border-b border-gray-700 py-3 cursor-pointer ${
                      selectedGroup === group ? "bg-red-900/40" : ""
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {group.eventDate}
                      </div>
                      <div className="text-sm text-gray-400">
                        Periode: {group.periodId} • {group.playerCount} Spieler
                      </div>
                    </div>
                    {selectedGroup === group && (
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
                disabled={!selectedGroup}
                className={`px-4 py-2 rounded font-semibold transition ${
                  selectedGroup
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