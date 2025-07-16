import React, { useEffect, useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CurrentTotalEventPageSimple({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  // Debug-Funktion
  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log(`[DEBUG] ${message}`);
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      addDebugInfo(`Mobile: ${mobile}, Width: ${window.innerWidth}`);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Daten laden
  useEffect(() => {
    async function fetchData() {
      try {
        addDebugInfo("Fetching data...");
        
        const resultsSnap = await getDocs(collection(db, "results"));
        const playersSnap = await getDocs(collection(db, "players"));
        
        const resultsData = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        addDebugInfo(`Data loaded: ${resultsData.length} results, ${playersData.length} players`);
        
        if (resultsData.length === 0) {
          // Fallback auf Beispieldaten
          const exampleData = [
            {
              id: "1",
              Clanmate: "Max Mustermann",
              Points: 3456,
              chests: { "Arena Chests": { total: 2 }, "Common Chests": { "10": 3 } },
              timestamp: "2025-07-15T12:00:00"
            },
            {
              id: "2",
              Clanmate: "Erika Musterfrau",
              Points: 2800,
              chests: { "Arena Chests": { total: 1 }, "Common Chests": { "10": 2 } },
              timestamp: "2025-07-15T13:00:00"
            },
            {
              id: "3",
              Clanmate: "Hans Beispiel",
              Points: 4200,
              chests: { "Arena Chests": { total: 3 }, "Common Chests": { "10": 1, "15": 2 } },
              timestamp: "2025-07-15T14:00:00"
            }
          ];
          setResults(exampleData);
          addDebugInfo("Using example data");
        } else {
          setResults(resultsData);
        }
        
        setPlayers(playersData);
        
      } catch (err) {
        addDebugInfo(`Error: ${err.message}`);
        setError(err.message);
        
        // Fallback auf Beispieldaten bei Fehler
        const exampleData = [
          {
            id: "1",
            Clanmate: "Max Mustermann",
            Points: 3456,
            chests: { "Arena Chests": { total: 2 } },
            timestamp: "2025-07-15T12:00:00"
          },
          {
            id: "2",
            Clanmate: "Erika Musterfrau",
            Points: 2800,
            chests: { "Arena Chests": { total: 1 } },
            timestamp: "2025-07-15T13:00:00"
          }
        ];
        setResults(exampleData);
        addDebugInfo("Using fallback data due to error");
      } finally {
        setLoading(false);
        addDebugInfo("Data loading complete");
      }
    }
    
    fetchData();
  }, []);

  // Berechne Gesamtpunkte
  const totalPoints = results.reduce((sum, result) => sum + (result.Points || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-xl text-gray-300">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-4 pb-32">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          {t?.currentTotalEventTitle || "Aktuelle Gesamtveranstaltung"}
        </h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">⚠️ {error}</p>
            <p className="text-gray-400 text-sm">Verwende Beispieldaten für Demo-Zwecke</p>
          </div>
        )}
        
        {/* Gesamtergebnis */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Clan-Gesamtergebnis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{totalPoints}</div>
              <div className="text-sm text-gray-400">Gesamtpunkte</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{results.length}</div>
              <div className="text-sm text-gray-400">Teilnehmer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {results.length > 0 ? Math.round(totalPoints / results.length) : 0}
              </div>
              <div className="text-sm text-gray-400">Ø Punkte pro Spieler</div>
            </div>
          </div>
        </div>

        {/* Spieler-Liste */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Spieler-Ergebnisse</h2>
          
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {results.map((result, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white">{result.Clanmate}</h3>
                    <span className="text-lg font-bold text-green-400">{result.Points}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Punkte: {result.Points || 0}
                  </div>
                  {result.chests && (
                    <div className="text-sm text-gray-400">
                      Chests: {Object.keys(result.chests).join(", ")}
                    </div>
                  )}
                  {result.timestamp && (
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(result.timestamp).toLocaleString("de-DE")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-2 text-blue-300">Spieler</th>
                    <th className="p-2 text-blue-300">Punkte</th>
                    <th className="p-2 text-blue-300">Chests</th>
                    <th className="p-2 text-blue-300">Zeitstempel</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="p-2 font-semibold">{result.Clanmate}</td>
                      <td className="p-2 text-green-400 font-bold">{result.Points}</td>
                      <td className="p-2 text-sm text-gray-400">
                        {result.chests ? Object.keys(result.chests).length : 0} Kategorien
                      </td>
                      <td className="p-2 text-sm text-gray-400">
                        {result.timestamp ? new Date(result.timestamp).toLocaleString("de-DE") : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Debug Info (nur bei Fehlern) */}
        {error && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-300">Debug Info</h3>
            <pre className="text-xs text-gray-400 bg-gray-900 p-2 rounded overflow-auto max-h-40">
              {debugInfo}
            </pre>
          </div>
        )}
      </div>

      {/* Zurück Button */}
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 hover:scale-105"
      >
        <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t?.backToNavigation || "Zurück zur Navigation"}
      </button>
    </div>
  );
}
