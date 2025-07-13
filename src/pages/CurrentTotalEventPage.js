import React, { useEffect, useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [norms, setNorms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [playersSnap, ranksSnap, troopSnap, normsSnap, resultsSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "ranks")),
        getDocs(collection(db, "troopStrengths")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "results")),
      ]);
      setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setRanks(ranksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTroopStrengths(troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNorms(normsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setResults(resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchData();
  }, []);

  function getPlayerResult(playerId) {
    const res = results.find(r => r.data && r.data.playerId === playerId);
    return res ? res.data : {};
  }

  function getPlayerNorm(player) {
    const norm = norms.find(n => n.name === player.normName);
    return norm ? norm.value : 0;
  }

  let totalIst = 0;
  let totalSoll = 0;

  const tableRows = players.map(player => {
    const result = getPlayerResult(player.id);
    const ist = result.totalPoints || 0;
    const soll = getPlayerNorm(player);
    totalIst += ist;
    totalSoll += soll;
    const differenz = ist - soll;
    const percent = soll > 0 ? Math.round((ist / soll) * 100) : 0;
    return {
      name: player.name,
      rank: player.rank,
      troopStrength: player.troopStrength,
      chests: result.chests || 0,
      ist,
      soll,
      differenz,
      percent,
      timestamp: result.timestamp || "",
    };
  });

  tableRows.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank.localeCompare(b.rank);
    return b.troopStrength - a.troopStrength;
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <div className="w-full flex flex-col items-center">
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{t.currentTotalEventTitle}</h2>
        {loading ? (
          <p className="text-xl text-gray-300 mb-8 text-center">Lade Daten...</p>
        ) : (
          <>
            {/* Gesamtergebnis */}
            <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-2 text-blue-300">Clan-Gesamtergebnis</h3>
              <div className="w-full flex justify-between mb-2">
                <span>Ist: <b>{totalIst}</b></span>
                <span>Soll: <b>{totalSoll}</b></span>
                <span>Erfüllung: <b>{totalSoll > 0 ? Math.round((totalIst / totalSoll) * 100) : 0}%</b></span>
              </div>
              <div className="w-full bg-gray-700 rounded h-6 overflow-hidden">
                <div
                  className="bg-blue-500 h-6"
                  style={{ width: `${totalSoll > 0 ? Math.min(100, (totalIst / totalSoll) * 100) : 0}%` }}
                />
              </div>
            </div>
            {/* Tabelle */}
            <div className="w-full max-w-6xl overflow-x-auto">
              <table className="w-full text-sm bg-gray-800 rounded">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2">Name</th>
                    <th className="p-2">Rang</th>
                    <th className="p-2">Truppenstärke</th>
                    <th className="p-2">Clantruhen</th>
                    <th className="p-2">Punkte Total (Ist)</th>
                    <th className="p-2">Norm (Soll)</th>
                    <th className="p-2">Differenz</th>
                    <th className="p-2">Normerfüllung</th>
                    <th className="p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-700">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.rank}</td>
                      <td className="p-2">{row.troopStrength}</td>
                      <td className="p-2">{row.chests}</td>
                      <td className="p-2">{row.ist}</td>
                      <td className="p-2">{row.soll}</td>
                      <td className="p-2">{row.differenz}</td>
                      <td className="p-2">
                        <div className="w-full bg-gray-700 rounded h-4">
                          <div
                            className="bg-blue-500 h-4"
                            style={{ width: `${Math.min(100, row.percent)}%` }}
                          />
                        </div>
                        <span className="ml-2">{row.percent}%</span>
                      </td>
                      <td className="p-2">{row.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {/* Button immer am unteren Bildschirmrand */}
            <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 hover:scale-105 z-50"
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