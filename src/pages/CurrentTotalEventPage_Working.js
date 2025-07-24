import React, { useState, useEffect } from "react";
import { ROUTES } from "../routes";

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading time
    setTimeout(() => setLoading(false), 1000);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Einfache Beispieldaten
  const exampleData = [
    {
      id: 1,
      name: "Max Mustermann",
      rank: "Clanführer",
      troopStrength: "12345",
      totalChests: 12,
      totalPoints: 3456,
      norm: 4000,
      timestamp: "15.07.2025, 12:34:56"
    },
    {
      id: 2,
      name: "Erika Musterfrau",
      rank: "Offizier",
      troopStrength: "11000",
      totalChests: 8,
      totalPoints: 2800,
      norm: 3500,
      timestamp: "15.07.2025, 13:45:12"
    },
    {
      id: 3,
      name: "Hans Beispiel",
      rank: "Mitglied",
      troopStrength: "9500",
      totalChests: 15,
      totalPoints: 4200,
      norm: 3000,
      timestamp: "15.07.2025, 14:22:33"
    }
  ];

  // Berechne Gesamtwerte
  const totalPoints = exampleData.reduce((sum, player) => sum + player.totalPoints, 0);
  const totalNorm = exampleData.reduce((sum, player) => sum + player.norm, 0);
  const totalFulfillment = totalNorm > 0 ? Math.round((totalPoints / totalNorm) * 100) : 0;

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
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          {t?.currentTotalEventTitle || "Aktuelle Gesamtveranstaltung"}
        </h1>
        
        {/* Gesamtergebnis */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Clan-Gesamtergebnis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{totalPoints}</div>
              <div className="text-sm text-gray-400">Ist-Punkte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalNorm}</div>
              <div className="text-sm text-gray-400">Soll-Punkte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalFulfillment}%</div>
              <div className="text-sm text-gray-400">Erfüllung</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${totalFulfillment >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, totalFulfillment)}%` }}
            />
          </div>
        </div>

        {/* Spieler-Ergebnisse */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Spieler-Ergebnisse</h2>
          
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {exampleData.map((player) => (
                <div key={player.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{player.name}</h3>
                      <p className="text-sm text-gray-400">{player.rank}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">{player.totalPoints}</div>
                      <div className="text-sm text-gray-400">Punkte</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Truppenstärke:</span>
                      <div className="font-semibold">{player.troopStrength}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Truhen:</span>
                      <div className="font-semibold">{player.totalChests}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Norm:</span>
                      <div className="font-semibold text-blue-400">{player.norm}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Erfüllung:</span>
                      <div className="font-semibold text-yellow-400">
                        {Math.round((player.totalPoints / player.norm) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    {player.timestamp}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="p-3 text-blue-300">Name</th>
                    <th className="p-3 text-blue-300">Rang</th>
                    <th className="p-3 text-blue-300">Truppenstärke</th>
                    <th className="p-3 text-blue-300">Truhen</th>
                    <th className="p-3 text-blue-300">Punkte (Ist)</th>
                    <th className="p-3 text-blue-300">Norm (Soll)</th>
                    <th className="p-3 text-blue-300">Differenz</th>
                    <th className="p-3 text-blue-300">Erfüllung</th>
                    <th className="p-3 text-blue-300">Zeitstempel</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleData.map((player) => {
                    const diff = player.totalPoints - player.norm;
                    const fulfillment = Math.round((player.totalPoints / player.norm) * 100);
                    return (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="p-3 font-semibold">{player.name}</td>
                        <td className="p-3">{player.rank}</td>
                        <td className="p-3">{player.troopStrength}</td>
                        <td className="p-3">{player.totalChests}</td>
                        <td className="p-3 text-green-400 font-bold">{player.totalPoints}</td>
                        <td className="p-3 text-blue-400">{player.norm}</td>
                        <td className={`p-3 font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {diff >= 0 ? '+' : ''}{diff}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${fulfillment >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, fulfillment)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{fulfillment}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-400">{player.timestamp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
