import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState([]);

  // Debug-Funktion
  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugMessage = `[${timestamp}] ${message}`;
    setDebugInfo(prev => [...prev, debugMessage]);
    console.log(debugMessage);
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      addDebug(`Mobile: ${mobile}, Width: ${window.innerWidth}`);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      addDebug("Starting data fetch...");
      
      try {
        addDebug("Checking Firebase connection...");
        
        if (!db) {
          throw new Error("Firebase not initialized");
        }
        
        addDebug("Fetching from Firebase collections...");
        const [playersSnap, troopSnap, resultsSnap] = await Promise.all([
          getDocs(collection(db, "players")),
          getDocs(collection(db, "troopStrengths")),
          getDocs(collection(db, "results")),
        ]);
        
        const playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const troopData = troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const resultsData = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        addDebug(`Firebase data: ${playersData.length} players, ${troopData.length} troops, ${resultsData.length} results`);
        
        // Setze Daten
        setPlayers(playersData);
        setTroopStrengths(troopData);
        setResults(resultsData);
        
        // Fallback auf Beispieldaten
        if (resultsData.length === 0) {
          addDebug("No results found, using example data");
          const exampleResults = [
            {
              id: "example1",
              Clanmate: "Max Mustermann",
              Points: 3456,
              chests: {
                "Arena Chests": { total: 2 },
                "Common Chests": { "10": 3, "15": 1 }
              },
              eventDate: "2025-07-15",
              timestamp: "2025-07-15T12:00:00"
            },
            {
              id: "example2",
              Clanmate: "Erika Musterfrau",
              Points: 2800,
              chests: {
                "Arena Chests": { total: 1 },
                "Epic Chests": { "20": 1 }
              },
              eventDate: "2025-07-15",
              timestamp: "2025-07-15T12:00:00"
            }
          ];
          setResults(exampleResults);
        }
        
        if (playersData.length === 0) {
          addDebug("No players found, using example data");
          const examplePlayers = [
            { id: "player1", name: "Max Mustermann", rank: "Clanführer", troopStrength: "Stark" },
            { id: "player2", name: "Erika Musterfrau", rank: "Offizier", troopStrength: "Mittel" }
          ];
          setPlayers(examplePlayers);
        }
        
        if (troopData.length === 0) {
          addDebug("No troop data found, using example data");
          const exampleTroops = [
            { id: "troop1", name: "Stark", points: 4000 },
            { id: "troop2", name: "Mittel", points: 3000 },
            { id: "troop3", name: "nicht definiert", points: 2000 }
          ];
          setTroopStrengths(exampleTroops);
        }
        
        addDebug("Data fetch completed successfully");
        
      } catch (error) {
        addDebug(`Error: ${error.message}`);
        setError(`Fehler beim Laden: ${error.message}`);
        
        // Fallback Beispieldaten
        setResults([
          {
            id: "fallback1",
            Clanmate: "Fallback Player",
            Points: 1000,
            chests: { "Arena Chests": { total: 1 } },
            eventDate: "2025-07-15",
            timestamp: "2025-07-15T12:00:00"
          }
        ]);
        setPlayers([
          { id: "fallback_player", name: "Fallback Player", rank: "Mitglied", troopStrength: "nicht definiert" }
        ]);
        setTroopStrengths([
          { id: "fallback_troop", name: "nicht definiert", points: 1000 }
        ]);
        
        addDebug("Fallback data set");
      }
      
      setLoading(false);
      addDebug("Loading finished");
    }
    
    fetchData();
  }, []);

  // Einfache Berechnungen
  const findPlayer = (clanmate) => {
    return players.find(p => p.name === clanmate) || { rank: "Unbekannt", troopStrength: "nicht definiert" };
  };

  const getNormPoints = (troopStrengthName) => {
    if (!troopStrengthName || troopStrengthName.trim() === '') {
      troopStrengthName = 'nicht definiert';
    }
    const troop = troopStrengths.find(ts => ts.name === troopStrengthName);
    return troop?.points || 0;
  };

  let totalIst = 0;
  let totalSoll = 0;

  const tableRows = results.map((result, index) => {
    const player = findPlayer(result.Clanmate);
    const normPoints = getNormPoints(player.troopStrength);
    const ist = result.Points || 0;
    const soll = normPoints;
    totalIst += ist;
    totalSoll += soll;
    const differenz = ist - soll;
    const percent = soll > 0 ? Math.round((ist / soll) * 100) : 0;
    
    return {
      key: `row-${index}`,
      name: result.Clanmate,
      rank: player.rank,
      troopStrength: player.troopStrength,
      ist,
      soll,
      differenz,
      percent,
      timestamp: result.timestamp || "Keine Angabe",
      chests: Object.keys(result.chests || {}).length
    };
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32 mobile-safe-area">
      <div className="w-full flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center text-blue-400">
          {t?.currentTotalEventTitle || "Aktuelle Veranstaltung"}
        </h2>
        
        {/* Debug-Informationen für Mobile */}
        {isMobile && (
          <div className="w-full max-w-md mb-4 bg-gray-800 rounded p-3 text-xs">
            <h3 className="text-yellow-400 font-semibold mb-2">Debug-Info (Mobile):</h3>
            <div className="max-h-32 overflow-y-auto text-gray-300">
              {debugInfo.map((info, idx) => (
                <div key={idx} className="mb-1">{info}</div>
              ))}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-xl text-gray-300">Lade Daten...</p>
          </div>
        ) : error ? (
          <div className="w-full max-w-md mb-4 bg-red-900/20 border border-red-500 rounded p-4">
            <p className="text-red-400 mb-2">⚠️ {error}</p>
            <p className="text-gray-400 text-sm">Verwende Beispieldaten</p>
          </div>
        ) : null}
        
        {!loading && (
          <>
            {/* Gesamtergebnis */}
            <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4">
              <h3 className="text-xl font-semibold mb-2 text-blue-300">Clan-Gesamtergebnis</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-400">Ist</div>
                  <div className="text-lg font-bold text-green-400">{totalIst}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Soll</div>
                  <div className="text-lg font-bold text-blue-400">{totalSoll}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Erfüllung</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {totalSoll > 0 ? Math.round((totalIst / totalSoll) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="w-full max-w-md mx-auto space-y-4">
              {tableRows.map((row) => (
                <div key={row.key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-blue-300">{row.name}</h3>
                      <p className="text-sm text-gray-400">{row.rank}</p>
                    </div>
                    <span className={`text-lg font-bold ${row.percent >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {row.percent}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <div className="text-gray-400">Punkte</div>
                      <div className="font-semibold text-green-400">{row.ist}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Norm</div>
                      <div className="font-semibold text-blue-400">{row.soll}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Truhen</div>
                      <div className="font-semibold text-purple-400">{row.chests}</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded h-2">
                    <div
                      className={`h-2 rounded ${row.percent >= 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(100, row.percent)}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {row.timestamp}
                  </div>
                </div>
              ))}
            </div>
            
            {tableRows.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>Keine Daten verfügbar</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Zurück Button */}
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
      >
        <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t?.backToNavigation || "Zurück"}
      </button>
    </div>
  );
}
