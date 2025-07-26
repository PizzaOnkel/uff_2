
import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Doughnut } from "react-chartjs-2";
import "./TopTen.css";

const normCategories = [
  { min: 0, max: 25, label: "0% - 25%", color: "#ef4444", icon: "❌" },
  { min: 26, max: 50, label: "26% - 50%", color: "#f59e42", icon: "🟠" },
  { min: 51, max: 75, label: "51% - 75%", color: "#fbbf24", icon: "🟡" },
  { min: 76, max: 90, label: "76% - 90%", color: "#22d3ee", icon: "🟦" },
  { min: 91, max: 100, label: "91% - 100%", color: "#22c55e", icon: "✅" },
  { min: 101, max: 200, label: "101% - 200%", color: "#a21caf", icon: "💯" },
  { min: 201, max: 10000, label: "> 200%", color: "#f472b6", icon: "🚀" },
];

export default function StandardsEvaluationPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [norms, setNorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [categorizedPlayers, setCategorizedPlayers] = useState([]);

  const [ignoreChests, setIgnoreChests] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Spieler, Normen, Ergebnisse, ChestMappings, Ignore-Liste laden
      const [playersSnap, normsSnap, resultsSnap, chestMappingsSnap, ignoreSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "chestMappingIgnore")),
      ]);
      const playersArr = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const normsArr = normsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const chestMappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const ignoreList = ignoreSnap.docs.map(doc => doc.data());
      setIgnoreChests(ignoreList);

      // Aktuelle Veranstaltungsperiode bestimmen (letztes Ergebnis mit periodId)
      let aktuellePeriode = null;
      const periodIds = resultsArr.map(r => r.periodId).filter(Boolean);
      if (periodIds.length > 0) {
        aktuellePeriode = periodIds.sort().reverse()[0];
      }
      // Nur Ergebnisse der aktuellen Periode berücksichtigen
      const filteredResults = aktuellePeriode
        ? resultsArr.filter(r => r.periodId === aktuellePeriode)
        : resultsArr;

      // Hilfsfunktionen wie in CurrentTotalEventPage.js
      function getNormPoints(troopStrengthName) {
        if (!troopStrengthName || troopStrengthName.trim() === '') {
          troopStrengthName = 'nicht definiert';
        }
        const norm = normsArr.find(n => String(n.troopStrength).trim().toLowerCase() === String(troopStrengthName).trim().toLowerCase());
        return norm ? Number(norm.value) : 0;
      }
      function isArenaChest(chest) {
        return (
          (chest.category && chest.category === "Arena Chests") ||
          chest.Type === "Arena" ||
          chest.Source === "Arena"
        );
      }
      function isIgnoredChest(chest) {
        if (isArenaChest(chest)) return false;
        for (const ignore of ignoreList) {
          if (ignore.Name && ignore.Name.trim().toLowerCase() !== (chest.Name || "").trim().toLowerCase()) continue;
          if (ignore.Level && ignore.Level.trim() !== "" && String(ignore.Level).trim() !== String(chest.level ?? chest.Level ?? "").trim()) continue;
          if (ignore.Type && ignore.Type.trim() !== "") {
            if (!chest.Type) continue;
            const t1 = ignore.Type.trim().toLowerCase();
            const t2 = (chest.Type || "").trim().toLowerCase();
            if (!(t2.includes(t1))) continue;
          }
          if (ignore.Source && ignore.Source.trim() !== "") {
            if (!chest.Source) continue;
            const s1 = ignore.Source.trim().toLowerCase();
            const s2 = (chest.Source || "").trim().toLowerCase();
            if (!(s2.includes(s1))) continue;
          }
          return true;
        }
        return false;
      }

      // Spieler-Aggregation wie in CurrentTotalEventPage.js
      const playerMap = new Map();
      filteredResults.forEach(result => {
        const playerName = result.Clanmate;
        const player = playersArr.find(p => p.name === playerName || (Array.isArray(p.aliases) && p.aliases.includes(playerName)));
        let troopStrength = player?.troopStrength || result.troopStrength || '';
        if (!troopStrength || troopStrength.trim() === '') {
          troopStrength = 'nicht definiert';
        }
        const normPoints = getNormPoints(troopStrength);

        // Mapping-Logik für Chests
        const mappedChests = Array.isArray(result.chests)
          ? result.chests.map(chest => {
              if (!chest.category && chest.Type) chest.category = chest.Type;
              let points = 0;
              if (chestMappings.length > 0) {
                let bestMapping = null;
                let bestScore = -1;
                chestMappings.forEach(m => {
                  const typeA = (m.type || m.Type || "").trim().toLowerCase();
                  const typeB = (chest.Type || "").trim().toLowerCase();
                  const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
                  const nameB = (chest.Name || "").trim().toLowerCase();
                  const categoryA = (m.category || "").trim().toLowerCase();
                  const categoryB = (chest.category || "").trim().toLowerCase();
                  const sourceA = (m.source || m.Source || "").trim().toLowerCase();
                  const sourceB = (chest.Source || chest.source || "").trim().toLowerCase();
                  const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
                  const levelB = String(chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? "").trim().toLowerCase();
                  let score = 0;
                  if (nameA && nameA === nameB) score++;
                  if (categoryA && categoryA === categoryB) score++;
                  if (typeA && typeA === typeB) score++;
                  if (sourceA && sourceA === sourceB) score++;
                  if (levelA && (levelA === levelB || m.levelEnd === levelB)) score++;
                  let matches = true;
                  if (nameA && nameA !== nameB) matches = false;
                  if (categoryA && categoryA !== categoryB) matches = false;
                  if (typeA && typeA !== typeB) matches = false;
                  if (sourceA && sourceA !== sourceB) matches = false;
                  if (levelA && (levelA !== levelB && m.levelEnd !== levelB)) matches = false;
                  if (matches && score > bestScore) {
                    bestScore = score;
                    bestMapping = m;
                  }
                });
                if (bestMapping && bestMapping.points !== undefined) {
                  points = Number(bestMapping.points);
                }
              }
              return {
                ...chest,
                count: chest.count || 1,
                points
              };
            })
          : [];
        // Filtere ignorierte Truhen raus (außer Arena)
        const filteredChests = mappedChests.filter(chest => !isIgnoredChest(chest));
        const ist = filteredChests.reduce((sum, chest) => sum + (chest.points || 0), 0);

        if (playerMap.has(playerName)) {
          const entry = playerMap.get(playerName);
          entry.ist += ist;
        } else {
          playerMap.set(playerName, {
            name: playerName,
            troopStrength,
            ist,
            soll: normPoints,
            normErfuellung: 0,
          });
        }
      });

      // Normerfüllung berechnen
      playerMap.forEach(entry => {
        entry.normErfuellung = entry.soll > 0 ? Math.round((entry.ist / entry.soll) * 100) : 0;
      });
      const playerNormData = Array.from(playerMap.values());
      // Spieler in Kategorien einteilen
      const categorized = normCategories.map(cat => ({ ...cat, players: [] }));
      playerNormData.forEach(player => {
        const cat = categorized.find(c => player.normErfuellung >= c.min && player.normErfuellung <= c.max);
        if (cat) cat.players.push(player);
      });
      // Sortiere Spieler in jeder Kategorie nach Normerfüllung absteigend
      categorized.forEach(cat => {
        cat.players.sort((a, b) => b.normErfuellung - a.normErfuellung);
      });
      setPlayers(playerNormData);
      setNorms(normsArr);
      setCategoryCounts(categorized.map(c => c.players.length));
      setCategorizedPlayers(categorized);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Chart-Daten für Donut
  const donutData = {
    labels: normCategories.map(c => c.label),
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: normCategories.map(c => c.color),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="top-ten-container flex flex-col items-center min-h-screen pb-8 relative">
      {/* Zurück-Button oben links */}
      <button
        onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
        className="absolute top-4 left-4 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-base font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 z-20 flex items-center"
        style={{ minWidth: 0, minHeight: 0 }}
        title="Zurück zur Navigation"
      >
        <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t.backToAdminPanel}
      </button>

      <div className="top-ten-header">
        <span className="crown-icon">🏆</span>
        <h2 className="top-ten-title">Normenerfüllung der Spieler</h2>
        <div className="top-ten-subtitle">Wie gut erfüllen die Spieler ihre Normen?</div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Lade Daten ...</span>
        </div>
      ) : (
        <>
          <div className="w-full max-w-2xl mb-10">
            <Doughnut data={donutData} options={{
              plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#fff', font: { size: 16 } } },
                title: { display: true, text: 'Verteilung der Normenerfüllung', color: '#fff', font: { size: 20 } },
              },
              cutout: '70%',
              responsive: true,
              maintainAspectRatio: false,
            }} height={300} />
          </div>

          <div className="category-grid mb-12">
            {categorizedPlayers.map(cat => (
              <div key={cat.label} className="category-btn flex-col items-start justify-start text-left shadow-xl border-2 border-gray-700" style={{ background: cat.color + '22', borderColor: cat.color }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  <span className="font-bold text-lg" style={{ color: cat.color }}>{cat.label}</span>
                  <span className="ml-2 text-sm text-gray-300">({cat.players.length} Spieler)</span>
                </div>
                <ul className="pl-2">
                  {cat.players.map(player => (
                    <li key={player.id || player.name} className="mb-1 flex items-center gap-2">
                      <span className="font-semibold" style={{ color: cat.color }}>{player.name}</span>
                      <span className="text-xs text-gray-300">{player.normErfuellung}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}