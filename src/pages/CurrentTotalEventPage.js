
import React, { useEffect, useRef, useState } from "react";
import StickyBackButton from "../components/StickyBackButton";
import Papa from "papaparse";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { mapToMainName } from "../utils/aliasMapping";
import { fallbackCategory, fallbackLevel, calculatePlayerNorms, isIgnoredChest } from "../utils/logicZentrale";

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
// ...existing code...
const chestCategories = [
  { name: "Arena Chests", levels: [] },
  { name: "Common Chests", levels: [5, 10, 15, 20, 25] },
  { name: "Rare Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Epic Chests", levels: [15, 20, 25, 30, 35] },
  { name: "Chests of Tartaros", levels: ["10", "15", "20", "25", "30", "35"] },
  { name: "Elven Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Cursed Chests", levels: [20, 25] },
  { name: "Bank Chests", levels: ["Wooden", "Bronze", "Silver", "Golden", "Precious", "Magic"] },
  { name: "Runic Chests", levels: ["20-24", "25-29", "30-34", "35-39", "40-44", "45"] },
  { name: "Heroic Chests", levels: Array.from({ length: 30 }, (_, i) => 16 + i) }, // 16-45
  { name: "Vault of the Ancients", levels: ["10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44"] },
  // Neue Kategorie für die zweite Headerzeile
  { name: "Rise of the Ancients", subChests: [
    { name: "Quick March Chest" },
    { name: "Ancients Chest" },
    { name: "ROTA Total" }
  ] },
  { name: "Epic Ancient squad", levels: [] },
  { name: "EAs Punkte", levels: [] },
  { name: "Union Chest", levels: [] },
  { name: "Union Total", levels: [] },
  { name: "Jormungandr Chests", levels: [] },
  { name: "Jormungandr Total", levels: [] }
];

const verticalHeaders = [
  "Truppenstärke",
  "Anzahl",
  "Punkte",
  "Anzahl gesamt",
  "Quick March Chest",
  "Ancients Chest",
  "ROTA Total",
  "Epic Ancient squad",
  "EAs Punkte",
  "Union Chest",
  "Union Total",
  "Jormungandr Chests",
  "Jormungandr Total"
];


  const [players, setPlayers] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [norms, setNorms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [chestMappings, setChestMappings] = useState([]);
  const [uploadTimes, setUploadTimes] = useState({}); // periodId -> uploadtime
  const [periods, setPeriods] = useState([]); // Firestore-Perioden
  const [currentPeriodName, setCurrentPeriodName] = useState("");
  const [currentPeriodStart, setCurrentPeriodStart] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");

  const tableContainerRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);

  // State für Ignore-Liste
  const [ignoreChests, setIgnoreChests] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [playersSnap, troopSnap, resultsSnap, chestMappingsSnap, normsSnap, uploadTimesSnap, periodsSnap, ignoreSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "troopStrengths")),
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "uploadtime")),
        getDocs(collection(db, "periods")),
        getDocs(collection(db, "chestMappingIgnore")),
      ]);
      setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTroopStrengths(troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const loadedMappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChestMappings(loadedMappings);
      // Debug: Zeige alle Mapping-Namen/Kategorien im Browser an
      if (loadedMappings && loadedMappings.length > 0) {
        const mappingNames = loadedMappings.map(m => ({
          name: m.chestName || m.Name || '',
          category: m.category || '',
          type: m.type || m.Type || '',
          level: m.level || m.levelStart || m.Level || '',
        }));
        console.log('[DEBUG][MappingLoaded] Alle Mapping-Namen/Kategorien:', mappingNames);
        // Zeige explizit alle Citadel-relevanten Mappings
        const citadelMappings = mappingNames.filter(m => (m.name||'').toLowerCase().includes('citadel') || (m.category||'').toLowerCase().includes('citadel'));
        console.log('[DEBUG][MappingLoaded] Citadel-relevante Mappings:', citadelMappings);
      }
      setNorms(normsSnap.docs.map(doc => ({ troopStrength: doc.data().troopStrength, value: doc.data().value })));
      // Map: periodId -> uploadtime (neueste)
      const uploadMap = {};
      uploadTimesSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.periodId && data.uploadtime) {
          if (!uploadMap[data.periodId] || uploadMap[data.periodId] < data.uploadtime) {
            uploadMap[data.periodId] = data.uploadtime;
          }
        }
      });
      setUploadTimes(uploadMap);
      // Perioden laden
      const periodsArr = periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPeriods(periodsArr);
      // Aktuelle Periode bestimmen (neueste mit start <= jetzt und end >= jetzt oder end leer)
      let now = new Date();
      let currentPeriod = null;
      let currentPeriodId = null;
      // Finde die Periode, die aktuell ist (start <= jetzt && (end >= jetzt || end leer))
      for (const p of periodsArr) {
        if (p.start && new Date(p.start) <= now && (!p.end || new Date(p.end) >= now)) {
          currentPeriod = p;
          currentPeriodId = p.id;
          break;
        }
      }
      // Fallback: falls keine laufende Periode, nimm die mit dem neuesten start
      if (!currentPeriod && periodsArr.length > 0) {
        currentPeriod = periodsArr.reduce((a, b) => (!a.start || (b.start && new Date(b.start) > new Date(a.start))) ? b : a);
        currentPeriodId = currentPeriod.id;
      }
      const filteredResults = resultsArr.filter(r => r.periodId === currentPeriodId);
      setCurrentPeriodName(currentPeriod?.name || "");
      setCurrentPeriodStart(currentPeriod?.start || "");
      setCurrentPeriodEnd(currentPeriod?.end || "");
      setResults(filteredResults);
      // Ignore-Liste aus Firestore
      const ignoreList = ignoreSnap.docs.map(doc => doc.data());
      setIgnoreChests(ignoreList);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.scrollLeft = sliderValue;
    }
  }, [sliderValue]);

  function handleSliderChange(e) {
    setSliderValue(Number(e.target.value));
  }

  function handleTableScroll(e) {
    setSliderValue(e.target.scrollLeft);
  }

  function findPlayer(clanmate) {
    // Gibt das ganze Spielerobjekt zurück, aber mapToMainName gibt nur den Namen
    const mainName = mapToMainName(players, clanmate);
    return players.find(p => p.name === mainName);
  }

  function getNormPoints(troopStrengthName) {
    // Fallback für leere Truppenstärken
    if (!troopStrengthName || troopStrengthName.trim() === '') {
      troopStrengthName = 'nicht definiert';
    }
    // Suche in norms nach passender Truppenstärke
    const norm = norms.find(n =>
      String(n.troopStrength).trim().toLowerCase() === String(troopStrengthName).trim().toLowerCase()
    );
    // Wert als Zahl zurückgeben, falls vorhanden
    return norm ? Number(norm.value) : 0;
  }

  // --- Zentrale Auswertung mit calculatePlayerNorms aus logicZentrale.js ---
  const auswertung = calculatePlayerNorms({
    playersArr: players,
    resultsArr: results,
    chestMappings,
    normsArr: norms,
    ignoreChests,
    periodsArr: periods,
    currentPeriodId: periods.find(p => p.name === currentPeriodName)?.id || (periods[0]?.id ?? null)
  });

  // Summen für Gesamtergebnis berechnen
  let totalIst = auswertung.reduce((sum, row) => sum + row.ist, 0);
  let totalSoll = auswertung.reduce((sum, row) => sum + row.soll, 0);

  // Sortierung wie bisher
  const rankOrder = [
    "Clanführer",
    "Vorgesetzter",
    "Chest_Counter",
    "Clan_Bank",
    "Clan_Taxi",
    "Offizier",
    "Veteran",
    "Soldat"
  ];
  auswertung.sort((a, b) => {
    const rankA = rankOrder.indexOf(a.rank);
    const rankB = rankOrder.indexOf(b.rank);
    // Unbekannte Ränge kommen ans Ende
    const isOtherA = rankA === -1;
    const isOtherB = rankB === -1;
    if (isOtherA && !isOtherB) return 1;
    if (!isOtherA && isOtherB) return -1;
    if (!isOtherA && !isOtherB) {
      if (rankA !== rankB) return rankA - rankB;
      // Für bestimmte Ränge nach Truppenstärke absteigend sortieren
      if ([1, 5, 6, 7].includes(rankA)) { // Vorgesetzter, Offizier, Veteran, Soldat
        return Number(b.troopStrength) - Number(a.troopStrength);
      }
      return 0;
    }
    // Beide sind "andere" Ränge: nach Truppenstärke absteigend
    return Number(b.troopStrength) - Number(a.troopStrength);
  });
  const tableRows = auswertung;

  function renderPlayerModal(playerRow) {
    // Nur nicht-ignorierte Truhen anzeigen
    const visibleChests = playerRow.chestDetails.filter(chest => {
      return !isIgnoredChest(chest);
    });
    // Zusammenfassen nach Kategorie+Level
    const grouped = {};
    visibleChests.forEach(chest => {
      const key = `${chest.category}__${chest.level ?? ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: chest.category,
          level: chest.level,
          count: 0,
          points: 0
        };
      }
      grouped[key].count += chest.count || 1;
      grouped[key].points += (chest.points || 0) * (chest.count || 1);
    });
    const groupedList = Object.values(grouped);
    // Hilfsfunktion: Prüft, ob ein Mapping existiert
    function hasMapping(chest) {
      if (!chestMappings || chestMappings.length === 0) return false;
      return chestMappings.some(m => {
        const typeA = (m.type || m.Type || '').trim().toLowerCase();
        const typeB = (chest.Type || '').trim().toLowerCase();
        const nameA = (m.chestName || m.Name || '').trim().toLowerCase();
        const nameB = (chest.Name || '').trim().toLowerCase();
        const categoryA = (m.category || '').trim().toLowerCase();
        const categoryB = (chest.category || '').trim().toLowerCase();
        const sourceA = (m.source || m.Source || '').trim().toLowerCase();
        const sourceB = (chest.Source || chest.source || '').trim().toLowerCase();
        const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || '').trim().toLowerCase();
        const levelB = String(chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? '').trim().toLowerCase();
        let matches = true;
        if (nameA && nameA !== nameB) matches = false;
        if (categoryA && categoryA !== categoryB) matches = false;
        if (typeA && typeA !== typeB) matches = false;
        if (sourceA && sourceA !== sourceB) matches = false;
        if (levelA && (levelA !== levelB && m.levelEnd !== levelB)) matches = false;
        return matches;
      });
    }
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        onClick={() => setSelectedPlayer(null)}
      >
        <div
          className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            onClick={() => setSelectedPlayer(null)}
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold mb-4 text-blue-300" style={{fontSize:'1.25rem'}}>{playerRow.name}</h3>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Rang: <b>{playerRow.rank}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Truppenstärke: <b>{playerRow.troopStrength}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Clantruhen: <b>{playerRow.chests}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Punkte Total (Ist): <b>{playerRow.ist}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Norm (Soll): <b>{playerRow.soll}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>Differenz: <b>{playerRow.differenz}</b></div>
          <div className="mb-2 flex items-center gap-2">
            <span>Normerfüllung:</span>
            <div className="flex-1 min-w-[100px] max-w-[180px] bg-gray-700 rounded h-5 overflow-hidden relative" style={{marginRight:8}}>
              <div
                className={`h-5 ${playerRow.percent >= 100 ? 'bg-green-400' : playerRow.percent >= 80 ? 'bg-yellow-400' : 'bg-blue-400'}`}
                style={{ width: `${Math.min(100, playerRow.percent)}%`, transition: 'width 0.5s' }}
              />
              <span className="absolute left-2 top-0 text-xs text-white font-bold" style={{lineHeight:'1.8em'}}>
                {playerRow.percent}%
              </span>
            </div>
            <span style={{fontSize:'1.5em'}}>
              {playerRow.percent >= 100 ? '🏆' : playerRow.percent >= 80 ? '😃' : playerRow.percent >= 50 ? '🙂' : playerRow.percent > 0 ? '😐' : '😴'}
            </span>
          </div>
          <div className="mb-2">Timestamp: <b>{playerRow.timestamp}</b></div>
          <hr className="my-3 border-gray-700" />
          <div>
            <h4 className="font-semibold mb-2 text-blue-200">Persönliche Erfüllungsliste</h4>
            <div style={{
              maxHeight: '40vh',
              overflowY: 'auto',
              marginBottom: '8px',
              paddingRight: '4px'
            }}>
              {groupedList.length > 0 ? (
                <ul className="list-disc ml-5">
                  {groupedList.map((chest, idx) => {
                    let displayName = chest.category;
                    if (chest.category === "Epic Chests" && (chest.level === 0 || chest.level === "0")) {
                      displayName = "Golden Guardian Epic Chest";
                    }
                    return (
                      <li key={idx}>
                        {displayName} {chest.category === "Epic Chests" && (chest.level === 0 || chest.level === "0") ? "" : (chest.level ? `LV ${chest.level}` : "")}: {chest.count}x, {chest.points} Punkte
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-gray-400">Keine Truhen-Daten vorhanden.</div>
              )}
            </div>
            <hr className="my-3 border-gray-700" />
            {/* Rohdaten-Tabelle entfernt (Debug) */}
          </div>
        </div>
      </div>
    );
  }

  function VerticalHeader({ children }) {
    return (
      <div style={{
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        whiteSpace: "nowrap",
        fontSize: "0.8em",
        lineHeight: "1.1em",
        minHeight: "60px",
        minWidth: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {children}
      </div>
    );
  }

  // --- NEU: Spieler-Refs für Scrollfunktion ---
  const playerRowRefs = React.useRef({});

  // Spieler mit "nicht definiert" in Rang oder Truppenstärke
  const undefinedPlayers = tableRows.filter(row =>
    !row.rank || row.rank.toLowerCase().includes('nicht definiert') ||
    !row.troopStrength || String(row.troopStrength).toLowerCase().includes('nicht definiert')
  );

  // Scroll- und Select-Funktion für die Tabelle oben rechts
  function handleUndefinedPlayerClick(player) {
    const ref = playerRowRefs.current[player.name];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setSelectedPlayer(player);
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      {/* Fixierte Buttons: Zurück und On Top */}
      <div style={{position:'fixed', right:'24px', top:'50%', transform:'translateY(200%)', zIndex:1000, width:'200px', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto'}}>
        <div style={{width:'100%'}}>
          <StickyBackButton onClick={() => setCurrentPage(ROUTES.NAVIGATION)} label={t?.backToNavigation || "Zurück"} style={{width:'100px'}} />
        </div>
        <div style={{width:'100%'}}>
          <StickyBackButton
            onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
            label={"On Top"}
            style={{ background: '#1976d2', width:'100px', marginTop:'34px' }}
          />
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        {/* Name und Zeitraum der aktuellen Veranstaltungsperiode (aus Firestore-Perioden) */}
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
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">{t.currentTotalEventTitle}</h2>
        {loading ? (
          <p className="text-xl text-gray-300 mb-8 text-center">Lade Daten...</p>
        ) : (
          <>
            <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-2 text-blue-300">Clan-Gesamtergebnis</h3>
              <div className="w-full flex justify-between mb-2">
                <span>Ist: <b>{totalIst}</b></span>
                <span>Soll: <b>{totalSoll}</b></span>
                <span>Erfüllung: <b>{totalSoll > 0 ? Math.round((totalIst / totalSoll) * 100) : 0}%</b></span>
              </div>
              <div className="w-full bg-gray-700 rounded h-6 overflow-hidden">
                <div
                  className={`h-6 ${totalSoll > 0 && (totalIst / totalSoll) >= 1 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${totalSoll > 0 ? Math.min(200, (totalIst / totalSoll) * 100) : 0}%` }}
                />
              </div>
        <div className="mt-2 text-center" style={{ color: '#ff6666', fontWeight: 500, fontSize: '1.1em' }}>
          {`Anzahl Spieler: ${tableRows.length}`}
        </div>
            </div>
            {/* Slider über der Tabelle */}
            <div className="w-full max-w-6xl mb-2">
              <input
                type="range"
                min={0}
                max={tableContainerRef.current ? tableContainerRef.current.scrollWidth - tableContainerRef.current.clientWidth : 100}
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full"
                style={{ accentColor: "#1976d2" }}
              />
            </div>
            <div
              className="w-full max-w-6xl overflow-x-auto"
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              style={{ scrollBehavior: "smooth" }}
            >
              <table className="w-full text-sm bg-gray-800 rounded">
                <thead>
                  <tr className="bg-gray-700">
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Name</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Rang</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Truppenstärke</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Clantruhen</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Punkte Total (Ist)</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Norm (Soll)</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Differenz</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2 norm-column" style={{ width: "120px", minWidth: "120px" }}>
                      <VerticalHeader>Normerfüllung</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>Timestamp</VerticalHeader>
                    </th>
                    {chestCategories.map((cat, catIdx) => {
                      // Nach Jormungandr Total eine Leerspalte mit hellerer Farbe einfügen
                      // Für EAs Total und Jormungandr Total immer dunkle Farbe, für Union Chest immer hell
                      let catBg;
                      if (cat.name === "EAs Total" || cat.name === "Jormungandr Total") catBg = 'bg-gray-800';
                      else if (cat.name === "Union Chest") catBg = 'bg-gray-700';
                      else catBg = catIdx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
                      if (cat.name === "Rise of the Ancients" && cat.subChests) {
                        return (
                          <th
                            key={cat.name}
                            colSpan={cat.subChests.length}
                            className={`text-xs text-center ${catBg}`}
                            style={{ verticalAlign: 'middle' }}
                          >
                            {cat.name}
                          </th>
                        );
                      }
                      let colSpan = Array.isArray(cat.levels) && cat.levels.length > 0 ? cat.levels.length * 2 + 1 : 1;
                      if (cat.name === "Common Chests") colSpan += 1;
                      if (cat.name === "Rare Chests") colSpan += 1;
                      if (cat.name === "Epic Chests") colSpan += 1;
                      if (cat.name === "Chests of Tartaros") colSpan += 1;
                      if (cat.name === "Elven Chests") colSpan += 1;
                      if (cat.name === "Cursed Chests") colSpan += 1;
                      if (cat.name === "Bank Chests") colSpan += 1;
                      if (cat.name === "Runic Chests") colSpan += 1;
                      if (cat.name === "Heroic Chests") colSpan += 1;
                      if (cat.name === "Vault of the Ancients") colSpan += 1;
                      const cells = [
                        <th
                          key={cat.name}
                          colSpan={colSpan}
                          className={`text-xs text-center ${catBg}`}
                          style={{ verticalAlign: 'middle' }}
                        >
                          {verticalHeaders.includes(cat.name)
                            ? <VerticalHeader>{cat.name}</VerticalHeader>
                            : cat.name}
                        </th>
                      ];
                      // Leerspalte nach Jormungandr Total
                      if (cat.name === "Jormungandr Total") {
                        cells.push(
                          <th
                            key="empty-after-jormungandr"
                            className="text-xs text-center bg-gray-700"
                            style={{ verticalAlign: 'middle', width: '50px', minWidth: '50px', maxWidth: '50px' }}
                          >
                          </th>
                        );
                      }
                      return cells.flat();
                    })}
                  </tr>
                  <tr>
                    {chestCategories.map((cat, catIdx) => {
                      const catBg = catIdx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
                      if (cat.name === "Arena Chests") {
                        return (
                          <th key={cat.name + 'arenaTotal'} className="text-xs" colSpan={1}>
                            <VerticalHeader>Arena Total</VerticalHeader>
                          </th>
                        );
                      }
                      if (cat.name === "Rise of the Ancients" && cat.subChests) {
                        return cat.subChests.map(sub => (
                          <th key={cat.name + sub.name} className={`text-xs ${catBg}`}>
                            <VerticalHeader>{sub.name}</VerticalHeader>
                          </th>
                        ));
                      }
                      return Array.isArray(cat.levels) && cat.levels.length > 0
                        ? cat.levels.map(level => (
                            <th key={cat.name + level} colSpan="2" className="text-xs">
                              <VerticalHeader>LV {level}</VerticalHeader>
                            </th>
                          )).concat([
                            <th key={cat.name + 'sum'} className="text-xs">
                              <VerticalHeader>Anzahl gesamt</VerticalHeader>
                            </th>,
                            <th key={cat.name + 'sumPoints'} className="text-xs">
                              <VerticalHeader>Punkte gesamt</VerticalHeader>
                            </th>
                          ])
                        : <th key={cat.name + 'single'} className="text-xs"></th>;
                    })}
                  </tr>
                  <tr>
                    {chestCategories.map(cat =>
                      Array.isArray(cat.levels) && cat.levels.length > 0
                        ? cat.levels.map(level => [
                            <th key={cat.name + level + 'count'} className="text-xs">
                              <VerticalHeader>Anzahl</VerticalHeader>
                            </th>,
                            <th key={cat.name + level + 'points'} className="text-xs">
                              <VerticalHeader>Punkte</VerticalHeader>
                            </th>
                          ]).flat().concat([
                            <th key={cat.name + 'sum2'} className="text-xs"></th>,
                            <th key={cat.name + 'sumPoints2'} className="text-xs"></th>
                          ])
                        : <th key={cat.name + 'single2'} className="text-xs"></th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => (
                    <tr
                      key={row.name + '-' + row.troopStrength + '-' + row.rank + '-' + idx}
                      ref={el => { playerRowRefs.current[row.name] = el; }}
                      className={
                        (selectedPlayer && selectedPlayer.name === row.name)
                          ? 'bg-yellow-700 border-b border-yellow-400'
                          : (idx % 2 === 0 ? "bg-gray-800 border-b border-gray-700" : "bg-gray-900 border-b border-gray-700")
                      }
                    >
                      <td className="p-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full w-32 h-10 flex items-center justify-center mx-auto transition-all duration-200"
                          style={{ minWidth: "120px", minHeight: "40px" }}
                          onClick={() => setSelectedPlayer(row)}
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="p-2">{row.rank}</td>
                      <td className="p-2">{row.troopStrength}</td>
                      <td className="p-2">{row.chests}</td>
                      <td className="p-2">{row.ist}</td>
                      <td className="p-2">{row.soll}</td>
                      <td className="p-2">{row.differenz}</td>
                      <td className="p-2 norm-column" style={{ width: "120px", minWidth: "120px" }}>
                        <div className="w-full bg-gray-700 rounded h-4 overflow-hidden">
                          <div
                            className={`h-4 ${row.percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, row.percent)}%`, transition: 'width 0.5s' }}
                          />
                        </div>
                        <span className="ml-2">{row.percent}%</span>
                      </td>
                      <td className="p-2">{row.timestamp}</td>
                      {chestCategories.map((cat, catIdx) => {
                        // Für EAs Total und Jormungandr Total immer dunkle Farbe, für Union Chest immer hell
                        let catBg;
                        if (cat.name === "EAs Total" || cat.name === "Jormungandr Total") catBg = 'bg-gray-800';
                        else if (cat.name === "Union Chest") catBg = 'bg-gray-700';
                        else catBg = catIdx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
                        if (cat.name === "Rise of the Ancients" && cat.subChests) {
                          return cat.subChests.map((sub, subIdx) => (
                            <td
                              key={row.name + '-' + idx + '-' + cat.name + '-' + sub.name + '-' + subIdx}
                              className={`p-2 ${catBg}`}
                            >
                              {row.chestDetails
                                .filter(chest => {
                                  if (sub.name === "Quick March Chest") {
                                    return chest.category === "Quick March Chest";
                                  }
                                  if (sub.name === "Ancients Chest") {
                                    return chest.category === "Ancients Chest";
                                  }
                                  if (sub.name === "ROTA Total") {
                                    return chest.category === "Quick March Chest" || chest.category === "Ancients Chest";
                                  }
                                  return false;
                                })
                                .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                            </td>
                          ));
                        } else if (Array.isArray(cat.levels) && cat.levels.length > 0) {
                          return cat.levels.map((level, levelIdx) => {
                            // Levelbereich aus Spaltennamen extrahieren (z.B. "20-24")
                            let start = null, end = null;
                            if (typeof level === "string" && level.includes("-")) {
                              const parts = level.split("-");
                              start = parseInt(parts[0], 10);
                              end = parseInt(parts[1], 10);
                            }
                            const isRunic = cat.name === "Runic Chests" && start !== null && end !== null;
                            const isVault = cat.name === "Vault of the Ancients" && start !== null && end !== null;
                            const isBank = cat.name === "Bank Chests";
                            const isElven = cat.name === "Elven Chests";
                            const isCursed = cat.name === "Cursed Chests";
                            return [
                              <td
                                key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-count-' + levelIdx}
                                className={`p-2 ${catBg}`}
                              >
                                {cat.name === "Epic Ancient squad" || cat.name === "EAs Total"
                                  ? row.chestDetails
                                      .filter(chest => (
                                        chest.Name === "Golden Guardian Epic Chest" &&
                                        chest.Type === "Epic Ancient squad" &&
                                        chest.Source === "Epic Ancient squad"
                                      ))
                                      .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                  : (isVault || isRunic)
                                    ? row.chestDetails
                                        .filter(chest => {
                                          if (chest.category !== cat.name) return false;
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          return chestLevel >= start && chestLevel <= end;
                                        })
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                  : isBank
                                    ? row.chestDetails
                                        .filter(chest => chest.category === cat.name && String(chest.level ?? chest.Level ?? "").toLowerCase() === String(level).toLowerCase())
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                  : (isElven || isCursed)
                                    ? row.chestDetails
                                        .filter(chest => {
                                          // Akzeptiere auch Citadel-Chests mit passendem Namen für Elven/Cursed Spalten, aber prüfe Level!
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          if (cat.name === "Cursed Chests") {
                                            if (chest.category === "Cursed Chests" || (chest.category === "Citadel" && (chest.Name || "").toLowerCase().includes("cursed"))) {
                                              if (typeof level === "number") return chestLevel === level;
                                              if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                              return false;
                                            }
                                            return false;
                                          }
                                          if (cat.name === "Elven Chests") {
                                            if (chest.category === "Elven Chests" || (chest.category === "Citadel" && (chest.Name || "").toLowerCase().includes("elven"))) {
                                              if (typeof level === "number") return chestLevel === level;
                                              if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                              return false;
                                            }
                                            return false;
                                          }
                                          if (chest.category !== cat.name) return false;
                                          // Level exakt oder im Mapping-Range
                                          if (typeof level === "number") return chestLevel === level;
                                          if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                          return false;
                                        })
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                  : cat.name === "Epic Chests"
                                    ? row.chestDetails
                                        .filter(chest => {
                                          // Epic Chests, aber NICHT Epic Ancient squad
                                          const catName = (chest.category || "").toLowerCase();
                                          const typeName = (chest.Type || "").toLowerCase();
                                          if (catName !== "epic chests") return false;
                                          if (typeName === "epic ancient squad") return false;
                                          // Level tolerant vergleichen (Zahl/String)
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          const levelNum = Number(level);
                                          return chestLevel === levelNum;
                                        })
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                  : row.chestDetails
                                        .filter(chest => chest.category === cat.name && chest.level === level)
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                }
                              </td>,
                              <td
                                key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-points-' + levelIdx}
                                className={`p-2 ${catBg}`}
                              >
                                {cat.name === "Epic Ancient squad" || cat.name === "EAs Total"
                                  ? row.chestDetails
                                      .filter(chest => (
                                        chest.Name === "Golden Guardian Epic Chest" &&
                                        chest.Type === "Epic Ancient squad" &&
                                        chest.Source === "Epic Ancient squad"
                                      ))
                                      .reduce((sum, chest) => sum + (chest.points || 0), 0)
                                  : (isVault || isRunic)
                                    ? row.chestDetails
                                        .filter(chest => {
                                          if (chest.category !== cat.name) return false;
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          return chestLevel >= start && chestLevel <= end;
                                        })
                                        .reduce((sum, chest) => sum + (chest.points || 0), 0)
                                  : isBank
                                    ? row.chestDetails
                                        .filter(chest => chest.category === cat.name && String(chest.level ?? chest.Level ?? "").toLowerCase() === String(level).toLowerCase())
                                        .reduce((sum, chest) => {
                                          let points = chest.points;
                                          if (points === undefined || points === null || points === "") {
                                            // Fallback: Mapping suchen
                                            const mapping = chestMappings && chestMappings.find(m => {
                                              const typeA = (m.type || m.Type || "").trim().toLowerCase();
                                              const typeB = (chest.Type || "").trim().toLowerCase();
                                              const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
                                              const nameB = (chest.Name || "").trim().toLowerCase();
                                              const categoryA = (m.category || "").trim().toLowerCase();
                                              const categoryB = (chest.category || "").trim().toLowerCase();
                                              const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
                                              const levelB = String(chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? "").trim().toLowerCase();
                                              return (
                                                (!nameA || nameA === nameB) &&
                                                (!categoryA || categoryA === categoryB) &&
                                                (!typeA || typeA === typeB) &&
                                                (!levelA || levelA === levelB || m.levelEnd === levelB)
                                              );
                                            });
                                            if (mapping && mapping.points !== undefined) {
                                              points = Number(mapping.points);
                                            }
                                          }
                                          points = Number(points) || 0;
                                          return sum + points * (chest.count || 1);
                                        }, 0)
                                  : (isElven || isCursed)
                                    ? row.chestDetails
                                        .filter(chest => {
                                          // Akzeptiere auch Citadel-Chests mit passendem Namen für Elven/Cursed Spalten, aber prüfe Level!
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          if (cat.name === "Cursed Chests") {
                                            if (chest.category === "Cursed Chests" || (chest.category === "Citadel" && (chest.Name || "").toLowerCase().includes("cursed"))) {
                                              if (typeof level === "number") return chestLevel === level;
                                              if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                              return false;
                                            }
                                            return false;
                                          }
                                          if (cat.name === "Elven Chests") {
                                            if (chest.category === "Elven Chests" || (chest.category === "Citadel" && (chest.Name || "").toLowerCase().includes("elven"))) {
                                              if (typeof level === "number") return chestLevel === level;
                                              if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                              return false;
                                            }
                                            return false;
                                          }
                                          if (chest.category !== cat.name) return false;
                                          // Level exakt oder im Mapping-Range
                                          if (typeof level === "number") return chestLevel === level;
                                          if (start !== null && end !== null) return chestLevel >= start && chestLevel <= end;
                                          return false;
                                        })
                                        .reduce((sum, chest) => {
                                          let points = chest.points;
                                          let debugInfo = {};
                                          if (points === undefined || points === null || points === "") {
                                            // Tolerantes Mapping suchen
                                            const mapping = chestMappings && chestMappings.find(m => {
                                              const typeA = (m.type || m.Type || "").trim().toLowerCase();
                                              const typeB = (chest.Type || "").trim().toLowerCase();
                                              const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
                                              const nameB = (chest.Name || "").trim().toLowerCase();
                                              const categoryA = (m.category || "").trim().toLowerCase();
                                              const categoryB = (chest.category || "").trim().toLowerCase();
                                              const sourceA = (m.source || m.Source || "").trim().toLowerCase();
                                              const sourceB = (chest.Source || "").trim().toLowerCase();
                                              // Level-Matching tolerant: Zahl/String und Range akzeptieren
                                              const chestLevel = Number(chest.level ?? chest.Level ?? 0);
                                              // Akzeptiere auch levelStart/levelEnd als Fallback für level
                                              let levelStart = m.levelStart !== undefined ? Number(m.levelStart) : (m.level !== undefined ? Number(m.level) : (m.Level !== undefined ? Number(m.Level) : 0));
                                              if (levelStart === 0 && m.level !== undefined) levelStart = Number(m.level);
                                              if (levelStart === 0 && m.Level !== undefined) levelStart = Number(m.Level);
                                              let levelEnd = m.levelEnd !== undefined ? Number(m.levelEnd) : (m.level !== undefined ? Number(m.level) : (m.Level !== undefined ? Number(m.Level) : 0));
                                              if (levelEnd === 0 && m.level !== undefined) levelEnd = Number(m.level);
                                              if (levelEnd === 0 && m.Level !== undefined) levelEnd = Number(m.Level);
                                              if (isNaN(levelStart)) levelStart = 0;
                                              if (isNaN(levelEnd)) levelEnd = levelStart;
                                              // Toleranter Vergleich: Name, Kategorie, Typ, Source dürfen auch Teilstrings sein
                                              const nameMatch = !nameA || nameA === nameB || nameB.includes(nameA) || nameA.includes(nameB);
                                              // Kategorie-Matching: Citadel <-> Elven/Cursed Chests akzeptieren
                                              const catMatch = !categoryA || categoryA === categoryB || categoryB.includes(categoryA) || categoryA.includes(categoryB)
                                                || (["elven chests", "cursed chests"].includes(categoryB) && categoryA === "citadel")
                                                || (["elven chests", "cursed chests"].includes(categoryA) && categoryB === "citadel");
                                              const typeMatch = !typeA || typeA === typeB || typeB.includes(typeA) || typeA.includes(typeB);
                                              // Source-Matching: akzeptiere auch Teilstrings (z.B. 'Level 20 Citadel' matched 'Citadel')
                                              const sourceMatch = !sourceA || !sourceB || sourceA === sourceB || sourceB.includes(sourceA) || sourceA.includes(sourceB);
                                              const levelMatch = chestLevel >= levelStart && chestLevel <= levelEnd;
                                              debugInfo = {
                                                chest,
                                                mapping: m,
                                                nameA, nameB, nameMatch,
                                                categoryA, categoryB, catMatch,
                                                typeA, typeB, typeMatch,
                                                sourceA, sourceB, sourceMatch,
                                                chestLevel, levelStart, levelEnd, levelMatch
                                              };
                                              return (
                                                nameMatch &&
                                                catMatch &&
                                                typeMatch &&
                                                sourceMatch &&
                                                levelMatch
                                              );
                                            });
                                            if (!mapping) {
                                              // Kompaktes Debug-Log: pro Kategorie nur den ersten fehlgeschlagenen Mapping-Versuch loggen
                                              if (!window.__chestDebugged) window.__chestDebugged = {};
                                              const chestKey = ((chest.Name||"") + "|" + (chest.category||"Unbekannt")).toLowerCase();
                                              if (!window.__chestDebugged[chestKey]) {
                                                window.__chestDebugged[chestKey] = true;
                                                // eslint-disable-next-line no-console
                                                console.warn('[DEBUG][Punkte-Mapping] Chest:',
                                                  (chest.Name||"-") + " | " + (chest.category||"-") + " | " + (chest.Type||"-") + " | " + (chest.Source||"-") + " | " + (chest.level ?? chest.Level ?? "-")
                                                );
                                                // Detailliertes Level-Debug
                                                console.warn('[DEBUG][Level-Mapping] Kein Mapping gefunden:', {
                                                  chestLevel: chest.level ?? chest.Level,
                                                  mappingLevel: debugInfo.levelStart,
                                                  mappingLevelEnd: debugInfo.levelEnd,
                                                  chestLevelType: typeof (chest.level ?? chest.Level),
                                                  mappingLevelType: typeof debugInfo.levelStart,
                                                  mappingLevelEndType: typeof debugInfo.levelEnd,
                                                  chest,
                                                  mappingTried: debugInfo.mapping
                                                });
                                              }
                                            } else if (mapping && mapping.points !== undefined) {
                                              points = Number(mapping.points);
                                              // eslint-disable-next-line no-console
                                              console.info('[DEBUG][Punkte-Mapping] Mapping gefunden:', { chest, mapping });
                                            }
                                          }
                                          points = Number(points) || 0;
                                          return sum + points * (chest.count || 1);
                                        }, 0)
                                  : cat.name === "Epic Chests"
                                    ? row.chestDetails
                                        .filter(chest => {
                                          // Epic Chests, aber NICHT Epic Ancient squad
                                          const catName = (chest.category || "").toLowerCase();
                                          const typeName = (chest.Type || "").toLowerCase();
                                          if (catName !== "epic chests") return false;
                                          if (typeName === "epic ancient squad") return false;
                                          // Level tolerant vergleichen (Zahl/String)
                                          const chestLevel = Number(chest.level ?? chest.Level ?? "");
                                          const levelNum = Number(level);
                                          return chestLevel === levelNum;
                                        })
                                        .reduce((sum, chest) => {
                                          let points = chest.points;
                                          if (points === undefined || points === null || points === "") {
                                            // Fallback: Mapping suchen (tolerant)
                                            const mapping = chestMappings && chestMappings.find(m => {
                                              const typeA = (m.type || m.Type || "").trim().toLowerCase();
                                              const typeB = (chest.Type || "").trim().toLowerCase();
                                              const nameA = (m.chestName || m.Name || "").trim().toLowerCase();
                                              const nameB = (chest.Name || "").trim().toLowerCase();
                                              const categoryA = (m.category || "").trim().toLowerCase();
                                              const categoryB = (chest.category || "").trim().toLowerCase();
                                              const levelA = String(m.levelStart || m.level || m.Level || m.levelEnd || "").trim().toLowerCase();
                                              const levelB = String(chest.level ?? chest.Level ?? chest.levelStart ?? chest.levelEnd ?? "").trim().toLowerCase();
                                              return (
                                                (!nameA || nameA === nameB) &&
                                                (!categoryA || categoryA === categoryB) &&
                                                (!typeA || typeA === typeB) &&
                                                (!levelA || levelA === levelB || m.levelEnd === levelB)
                                              );
                                            });
                                            if (mapping && mapping.points !== undefined) {
                                              points = Number(mapping.points);
                                            }
                                          }
                                          points = Number(points) || 0;
                                          return sum + points * (chest.count || 1);
                                        }, 0)
                                  : row.chestDetails
                                        .filter(chest => chest.category === cat.name && chest.level === level)
                                        .reduce((sum, chest) => {
                                          if (typeof chest.points === "number") return sum + chest.points * (chest.count || 1);
                                          return sum;
                                        }, 0)
                                }
                              </td>
                            ];
                          }).flat().concat([
                            <td
                              key={row.name + '-' + idx + '-' + cat.name + '-sum'}
                              className={`p-2 font-semibold ${catBg}`}
                            >
                              {(cat.name === "Epic Ancient squad" || cat.name === "EAs Total")
                                ? row.chestDetails
                                    .filter(chest => (
                                      chest.Name === "Golden Guardian Epic Chest" &&
                                      chest.Type === "Epic Ancient squad" &&
                                      chest.Source === "Epic Ancient squad"
                                    ))
                                    .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                : cat.name === "Bank Chests"
                                    ? row.chestDetails
                                        .filter(chest => chest.category === cat.name)
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                                    : row.chestDetails
                                        .filter(chest => chest.category === cat.name)
                                        .reduce((sum, chest) => sum + (chest.count || 0), 0)
                              }
                            </td>,
                            <td
                              key={row.name + '-' + idx + '-' + cat.name + '-sumPoints'}
                              className={`p-2 font-semibold ${catBg}`}
                            >
                              {(cat.name === "Epic Ancient squad" || cat.name === "EAs Total")
                                ? row.chestDetails
                                    .filter(chest => (
                                      chest.Name === "Golden Guardian Epic Chest" &&
                                      chest.Type === "Epic Ancient squad" &&
                                      chest.Source === "Epic Ancient squad"
                                    ))
                                    .reduce((sum, chest) => sum + (chest.points || 0), 0)
                                : cat.name === "Bank Chests"
                                    ? row.chestDetails
                                        .filter(chest => chest.category === cat.name)
                                        .reduce((sum, chest) => {
                                          if (typeof chest.points === "number") return sum + chest.points * (chest.count || 1);
                                          return sum;
                                        }, 0)
                                    : row.chestDetails
                                        .filter(chest => chest.category === cat.name)
                                        .reduce((sum, chest) => sum + (chest.points || 0), 0)
                              }
                            </td>
                          ]);
                        } else {
                          // Spezialfall: EAs Total und Epic Ancient squad ohne Levels
                        if (cat.name === "Epic Ancient squad") {
                            return (
                              <td
                                key={row.name + '-' + idx + '-' + cat.name + '-single'}
                                className={`p-2 ${catBg}`}
                              >
                                {row.chestDetails
                                  .filter(chest => (
                                    chest.Name === "Golden Guardian Epic Chest" &&
                                    chest.Type === "Epic Ancient squad" &&
                                    chest.Source === "Epic Ancient squad"
                                  ))
                                  .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>
                            );
                        }
                        if (cat.name === "EAs Punkte") {
                            return (
                              <td
                                key={row.name + '-' + idx + '-' + cat.name + '-single'}
                                className={`p-2 ${catBg}`}
                              >
                                {row.chestDetails
                                  .filter(chest => (
                                    chest.Name === "Golden Guardian Epic Chest" &&
                                    chest.Type === "Epic Ancient squad" &&
                                    chest.Source === "Epic Ancient squad"
                                  ))
                                  .reduce((sum, chest) => sum + (chest.points || 0), 0)}
                              </td>
                            );
                        }
                          // Standardfall für Einzelspalte
                      // Spezialfall: Common Chests tolerant filtern (auch "Common Chest", "common chests", etc.)
                      if (cat.name === "Common Chests") {
                        return (
                          <td
                            key={row.name + '-' + idx + '-' + cat.name + '-single'}
                            className={`p-2 ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => {
                                const catA = (chest.category || "").toLowerCase();
                                const nameA = (chest.Name || chest.name || "").toLowerCase();
                                const typeA = (chest.Type || chest.type || "").toLowerCase();
                                // Akzeptiere alles, was "common chest" oder "common crypt" enthält (Kategorie, Name oder Typ)
                                return (
                                  catA.includes("common chest") ||
                                  catA.includes("common crypt") ||
                                  nameA.includes("common chest") ||
                                  nameA.includes("common crypt") ||
                                  typeA.includes("common chest") ||
                                  typeA.includes("common crypt")
                                );
                              })
                              .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                          </td>
                        );
                      }
                      // Standardfall für Einzelspalte
                      return (
                        <td
                          key={row.name + '-' + idx + '-' + cat.name + '-single'}
                          className={`p-2 ${catBg}`}
                        >
                          {row.chestDetails
                            .filter(chest => chest.category === cat.name)
                            .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                        </td>
                      );
                        }
                        // Leerspalte nach Jormungandr Total
                        if (cat.name === "Jormungandr Total") {
                          return [
                            (
                              <td
                                key={row.name + '-' + idx + "-empty-after-jormungandr"}
                                className="p-2 bg-gray-700"
                              >
                              </td>
                            )
                          ];
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedPlayer && renderPlayerModal(selectedPlayer)}
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
}