
import React, { useEffect, useState } from "react";
import StickyBackButton from '../components/StickyBackButton';
import { ROUTES } from "../routes";
import { getChestPoints, isIgnoredChest, fallbackCategory, fallbackLevel } from "../utils/logicZentrale";
import { mapToMainName } from "../utils/aliasMapping";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Doughnut } from "react-chartjs-2";
import "./TopTen.css";

const normCategories = [
  { min: 0,   max: 25,   label: "0% - 25%",    color: "#ef4444", icon: "❌" },
  { min: 26,  max: 50,   label: "26% - 50%",   color: "#f59e42", icon: "🟠" },
  { min: 51,  max: 75,   label: "51% - 75%",   color: "#fbbf24", icon: "🟡" },
  { min: 76,  max: 90,   label: "76% - 90%",   color: "#22d3ee", icon: "🟦" },
  { min: 91,  max: 100,  label: "91% - 100%",  color: "#22c55e", icon: "✅" },
  { min: 101, max: 200,  label: "101% - 200%", color: "#a21caf", icon: "💯" },
  { min: 201, max: 10000,label: "> 200%",      color: "#f472b6", icon: "🚀" }
];

export default function StandardsArchivePage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [norms, setNorms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [categorizedPlayers, setCategorizedPlayers] = useState([]);

  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [currentPeriodName, setCurrentPeriodName] = useState("");
  const [currentPeriodStart, setCurrentPeriodStart] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      // Spieler, Normen, Ergebnisse, ChestMappings, Perioden, Ignore-Liste laden
      const [playersSnap, normsSnap, resultsSnap, chestMappingsSnap, periodsSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "periods")),
      ]);
      const playersArr = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const normsArr = normsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const chestMappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
      const periodsArr = periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Ignore-Liste laden (aus public/json-data/chest_mapping_ignore.csv)
      let ignoreChests = [];
      try {
        const resp = await fetch("/json-data/chest-mapping-ignore.csv");
        if (resp.ok) {
          const text = await resp.text();
          ignoreChests = text.split("\n").map(line => {
            const [Name, Level, Type, Source] = line.split(",");
            return { Name: Name?.trim(), Level: Level?.trim(), Type: Type?.trim(), Source: Source?.trim() };
          }).filter(x => x.Name || x.Type || x.Source);
        }
      } catch (e) {}

      setPeriods(periodsArr);
      // Nur abgeschlossene Perioden (wie in den anderen Archivseiten)
      const archivePeriods = periodsArr.filter(p => p.end && new Date(p.end) < new Date());
      if (!selectedPeriodId && archivePeriods.length > 0) {
        setSelectedPeriodId(archivePeriods[archivePeriods.length - 1].id);
      }
      // Periodeninfo für Anzeige
      const selectedPeriod = periodsArr.find(p => p.id === selectedPeriodId);
      setCurrentPeriodName(selectedPeriod?.name || "");
      setCurrentPeriodStart(selectedPeriod?.start || "");
      setCurrentPeriodEnd(selectedPeriod?.end || "");
      // Nur Ergebnisse der gewählten Periode berücksichtigen
      const filteredResults = resultsArr.filter(r => r.periodId === selectedPeriodId);

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
        let ignored = false;
        for (const ignore of ignoreChests) {
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
          ignored = true;
          break;
        }
        return ignored;
      }

      // Zentrale Normberechnung wie in CurrentTotalEventPage.js
      const { calculatePlayerNorms } = await import("../utils/logicZentrale");
      const playerNormData = calculatePlayerNorms({
        playersArr,
        resultsArr,
        chestMappings,
        normsArr,
        ignoreChests,
        periodsArr,
        currentPeriodId: selectedPeriodId
      });
      // Nur eindeutige Hauptnamen zulassen (wie in CurrentTotalEventPage.js)
      const seenMainNames = new Set();
      const uniquePlayers = playerNormData.filter(player => {
        if (seenMainNames.has(player.name)) return false;
        seenMainNames.add(player.name);
        return true;
      });
      // Spieler in exakt abgegrenzte Kategorien einteilen (keine Überschneidungen)
      const categorized = normCategories.map(cat => ({ ...cat, players: [] }));
      uniquePlayers.forEach(player => {
        let cat = null;
        for (let i = 0; i < categorized.length; i++) {
          const c = categorized[i];
          if (i === 0 && player.normErfuellung >= c.min && player.normErfuellung <= c.max) {
            cat = c;
            break;
          }
          else if (i > 0 && i < categorized.length - 1 && player.normErfuellung >= c.min && player.normErfuellung <= c.max) {
            cat = c;
            break;
          }
          else if (i === categorized.length - 1 && player.normErfuellung > categorized[i].min) {
            cat = c;
            break;
          }
        }
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
      {/* --- Auswahlmenü für Eventperioden (Dropdown) --- */}
      <div className="w-full flex flex-col items-center mb-4 mt-4">
        <label htmlFor="period-select" className="mb-1 text-lg text-blue-200 font-semibold">Eventperiode auswählen:</label>
        <select
          id="period-select"
          className="bg-gray-800 text-white px-4 py-2 rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          value={selectedPeriodId}
          onChange={e => setSelectedPeriodId(e.target.value)}
          style={{ minWidth: 220 }}
        >
          {periods
            .filter(p => p.end && new Date(p.end) < new Date())
            .map(period => (
              <option key={period.id} value={period.id}>
                {period.name} {period.start ? `(${new Date(period.start).toLocaleDateString('de-DE')}` : ''}{period.end ? ` - ${new Date(period.end).toLocaleDateString('de-DE')})` : ''}
              </option>
            ))}
        </select>
      </div>
      <div className="w-full flex flex-col items-center">
        {!loading && currentPeriodName && (
          <div className="mb-2 text-2xl font-bold text-purple-300 text-center">
            {currentPeriodName}
            {(currentPeriodStart || currentPeriodEnd) && (
              <span className="block text-lg font-normal text-purple-200 mt-1">
                {currentPeriodStart ? new Date(currentPeriodStart).toLocaleDateString('de-DE') : ''}
                {currentPeriodStart && currentPeriodEnd ? ' – ' : ''}
                {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString('de-DE') : ''}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Fixierte Buttons rechts mittig */}
      <div style={{position:'fixed', right:'24px', top:'50%', transform:'translateY(-50%)', zIndex:1000, width:'200px', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto'}}>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => setCurrentPage(ROUTES.NAVIGATION)} label={t?.backToNavigation || 'Zurück'} style={{width:'100px'}} />
        </div>
        <div style={{width:'100%'}}>
          <StickyBackButton
            onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            label={"On Top"}
            style={{ background: '#1976d2', width:'100px', marginTop:'34px' }}
          />
        </div>
      </div>

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