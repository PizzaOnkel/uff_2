import React, { useEffect, useRef, useState, useMemo } from "react";
import StickyBackButton from "../components/StickyBackButton";
// ...existing code...
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { mapToMainName } from "../utils/aliasMapping";
import { fallbackCategory, fallbackLevel, calculatePlayerNorms, isIgnoredChest, getChestPoints, chestMatchesLevel, stringsMatchTolerant, mapCategoryToPageName } from "../utils/logicZentrale";

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
  // Helper für Namens-Mapping (Bank Chests)
  const nameMap = {
    Wooden: "Wooden Chest",
    Bronze: "Bronze Chest",
    Silver: "Silver Chest",
    Golden: "Golden Chest",
    Precious: "Precious Chest",
    Magic: "Magic Chest"
  };
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
  t.troopStrength,
  t.amount,
  t.points,
  t.totalAmount,
  t.quickMarchChest,
  t.ancientsChest,
  t.rotaTotal,
  t.epicAncientSquad,
  t.easPoints,
  t.unionChest,
  t.unionTotal,
  t.jormungandrChests,
  t.jormungandrTotal
];


  const [players, setPlayers] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [norms, setNorms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [chestMappings, setChestMappings] = useState([]);
  const [mappingSource, setMappingSource] = useState('');
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
  const loadedPlayers = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const loadedTroops = troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const loadedMappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setPlayers(loadedPlayers);
  setTroopStrengths(loadedTroops);
  setChestMappings(loadedMappings);
  setMappingSource('firestore');
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
  // Store full results array and let calculatePlayerNorms handle flexible shapes and period filtering
  setResults(resultsArr);
      // Ignore-Liste aus Firestore
      const ignoreList = ignoreSnap.docs.map(doc => doc.data());
      setIgnoreChests(ignoreList);
      setLoading(false);
    // --- NEU: Daten global verfügbar machen ---
    window.chestMappings = loadedMappings;
    window.results = resultsArr;
    window.players = loadedPlayers;
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

  // Helper: tolerant category comparison (handles minor OCR/name diffs)
  function chestCategoryMatches(chest, catName) {
    // Strenge und exklusive Zuordnung für Citadel Chests
    const name = (chest.Name || chest.name || '').toLowerCase();
    const type = (chest.Type || chest.type || '').toLowerCase();
    const source = (chest.Source || chest.source || '').toLowerCase();
    let mappedCategory = (chest.category || chest.Category || '');
    const lvl = String(chest.level ?? chest.Level ?? '').trim();
    // Exklusive Regel: Cursed Citadel Chest mit Level 20/25 und Type/Source Citadel wird NUR als Cursed Chests gezählt
    if (
      name.includes('cursed') && (type.includes('citadel') || source.includes('citadel')) && (lvl === '20' || lvl === '25')
    ) {
      mappedCategory = 'Cursed Chests';
      // Niemals als Elven Chests oder andere Kategorien
      return stringsMatchTolerant(mappedCategory, catName);
    }
    // Exklusive Regel: Elven Citadel Chest mit Level 20/25 und Type/Source Citadel wird NUR als Elven Chests gezählt
    if (
      name.includes('elven') && (type.includes('citadel') || source.includes('citadel')) && (lvl === '20' || lvl === '25')
    ) {
      mappedCategory = 'Elven Chests';
      return stringsMatchTolerant(mappedCategory, catName);
    }
    // Sonstige Zuordnung wie gehabt
    if (name.includes('cursed')) {
      if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
      if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
    } else if (name.includes('elven')) {
      if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
      if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
    }
    return stringsMatchTolerant(mappedCategory, catName);
  }

  // --- Zentrale Auswertung mit calculatePlayerNorms aus logicZentrale.js ---
  // Nur Spieler anzeigen, die in den aktuellen results (JSON-Uploads) vorkommen
  // Extrahiere die Namen aus dem flachen results-Array
  // Extrahiere die Namen aus dem flachen results-Array
  const clanmateNamesRaw = results.map(r => (r.Clanmate || r.playerName || r.name || "").trim().toLowerCase()).filter(Boolean);
  const clanmateNames = Array.from(new Set(clanmateNamesRaw));
  // Debug: Zeige alle Namen aus der JSON (results)
  // Übergebe ALLE Spielerobjekte an die zentrale Auswertung, damit Aliase/Hauptnamen korrekt gemappt werden

  const auswertung = useMemo(() => calculatePlayerNorms({
    playersArr: players,
    resultsArr: results,
    chestMappings,
    normsArr: norms,
    ignoreChests,
    periodsArr: periods,
    currentPeriodId: periods.find(p => p.name === currentPeriodName)?.id || (periods[0]?.id ?? null)
  }), [players, results, chestMappings, norms, ignoreChests, periods, currentPeriodName]);
  // ...existing code...
  // ...existing code...

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
  // Nur eindeutige Spieler (nach Name) anzeigen
  const uniqueAuswertung = [];
  const seenNames = new Set();
  for (const row of auswertung) {
    const normName = (row.name || "").trim().toLowerCase();
    if (!seenNames.has(normName)) {
      uniqueAuswertung.push(row);
      seenNames.add(normName);
    }
  }

  uniqueAuswertung.sort((a, b) => {
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
  const tableRows = useMemo(() => {
    if (!chestMappings || chestMappings.length === 0) {
      return [{
        name: '',
        ist: 0,
        soll: 0,
        percent: 0,
        differenz: 0,
        chestDetails: [],
        info: 'Momentan keine Daten verfügbar (Firestore-Limit oder Verbindung?)'
      }];
    }
    const rows = [...uniqueAuswertung];
    rows.sort((a, b) => {
      const rankA = rankOrder.indexOf(a.rank);
      const rankB = rankOrder.indexOf(b.rank);
      // Unbekannte Ränge kommen ans Ende
      const isOtherA = rankA === -1;
      const isOtherB = rankB === -1;
      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;
      if (!isOtherA && !isOtherB) {
        if (rankA !== rankB) return rankA - rankB;
        if ([1, 5, 6, 7].includes(rankA)) {
          return Number(b.troopStrength) - Number(a.troopStrength);
        }
        return 0;
      }
      return Number(b.troopStrength) - Number(a.troopStrength);
    });
    return rows;
  }, [uniqueAuswertung, chestMappings]);

  // Setze tableRows im globalen Window-Objekt, damit du die Daten direkt in der Browser-Konsole inspizieren kannst.
    window.tableRows = tableRows;

  function renderPlayerModal(playerRow) {
    // Nur nicht-ignorierte Truhen anzeigen
    const visibleChests = (playerRow.chestDetails || []).filter(chest => {
      return !isIgnoredChest(chest);
    });
    // Zusammenfassen nach Kategorie+Level
    const grouped = {};
    visibleChests.forEach(chest => {
      // Korrigierte Zuordnung für Citadel Chests
      let mappedCategory = mapCategoryToPageName(chest.category, chest);
      const name = (chest.Name || chest.name || '').toLowerCase();
      const type = (chest.Type || chest.type || '').toLowerCase();
      const source = (chest.Source || chest.source || '').toLowerCase();
      if (name.includes('cursed') && (type.includes('citadel') || source.includes('citadel'))) {
        mappedCategory = 'Cursed Chests';
      } else if (name.includes('elven') && (type.includes('citadel') || source.includes('citadel'))) {
        mappedCategory = 'Elven Chests';
      } else if (name.includes('cursed')) {
        if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
        if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
      } else if (name.includes('elven')) {
        if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
        if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
      }
      const key = `${mappedCategory}__${chest.level ?? ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: mappedCategory,
          level: chest.level,
          count: 0,
          points: 0
        };
      }
      grouped[key].count += chest.count || 1;
      grouped[key].points += getChestPoints({ ...chest, category: mappedCategory }, chestMappings) * (chest.count || 1);
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
          <h3 className="text-2xl font-bold mb-4 text-blue-300" style={{fontSize:'1.25rem'}}>{mapToMainName(players, playerRow.name)}</h3>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.rank}: <b>{playerRow.rank}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.troopStrength}: <b>{playerRow.troopStrength}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.clanChests}: <b>{playerRow.chests}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.pointsTotalIst}: <b>{playerRow.ist}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.normSoll}: <b>{playerRow.soll}</b></div>
          <div className="mb-2" style={{fontSize:'0.95rem'}}>{t.difference}: <b>{playerRow.differenz}</b></div>
          <div className="mb-2 flex items-center gap-2">
            <span>{t.normFulfillment}:</span>
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
          <div className="mb-2">{t.timestamp}: <b>{playerRow.timestamp}</b></div>
          <hr className="my-3 border-gray-700" />
          <div>
            <h4 className="font-semibold mb-2 text-blue-200">{t.personalFulfillmentList}</h4>
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
                <div className="text-gray-400">{t.noChestData}</div>
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
        {/* Platz für weitere Buttons */}
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
        {/* Mapping source entfernt */}
        {loading ? (
          <p className="text-xl text-gray-300 mb-8 text-center">{t.loadingData}</p>
        ) : (
          <>
            <div className="mb-8 w-full max-w-2xl bg-gray-800 rounded p-4 flex flex-col items-center">
              <h3 className="text-2xl font-semibold mb-2 text-blue-300">{t.clanTotalResult}</h3>
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
          Anzahl Spieler: {tableRows.length}
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
                      <VerticalHeader>{t.name}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.rank}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.troopStrength}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.clanChests}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.pointsTotalIst}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.normSoll}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.difference}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2 norm-column" style={{ width: "120px", minWidth: "120px" }}>
                      <VerticalHeader>{t.normFulfillment}</VerticalHeader>
                    </th>
                    <th rowSpan="3" className="p-2">
                      <VerticalHeader>{t.timestamp}</VerticalHeader>
                    </th>
                    {chestCategories.map((cat, catIdx) => {
                      // Eindeutige dunkle Pastellfarben für jede Kategorie
                      const pastelColors = [
                        '#2c2f36', // Arena Chests
                        '#4b537a', // Common Chests
                        '#4a6b4a', // Rare Chests
                        '#6b5a4a', // Epic Chests
                        '#5a4a6b', // Chests of Tartaros
                        '#4a5a6b', // Elven Chests
                        '#4a6b6b', // Cursed Chests
                        '#6b4a4a', // Bank Chests
                        '#6b4a5a', // Runic Chests
                        '#3a3f4a', // Heroic Chests
                        '#3a4a3f', // Vault of the Ancients
                        '#3f3a4a', // Rise of the Ancients
                        '#4a3a3f', // Epic Ancient squad
                        '#3f4a3a', // EAs Punkte
                        '#4a3f3a', // Union Chest
                        '#3a4a4a', // Union Total
                        '#4a4a3a', // Jormungandr Chests
                        '#3a3a4a', // Jormungandr Total
                      ];
                      const catBg = pastelColors[catIdx];
                      if (cat.name === "Rise of the Ancients" && cat.subChests) {
                        return (
                          <th
                            key={cat.name}
                            colSpan={cat.subChests.length}
                            className="text-xs text-center"
                            style={{ verticalAlign: 'middle', background: catBg }}
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
                          className="text-xs text-center"
                          style={{ verticalAlign: 'middle', background: catBg }}
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
                              <VerticalHeader>
                                {cat.name === "Bank Chests" ? level : `LV ${level}`}
                              </VerticalHeader>
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
                  {tableRows.map((row, idx) => {
                    if (row.info) {
                      return (
                        <tr key={"info-row-" + idx}>
                          <td colSpan={chestCategories.length + 9} style={{ color: 'orange', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em' }}>
                            {row.info}
                          </td>
                        </tr>
                      );
                    }
                    return (
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
                            {mapToMainName(players, row.name)}
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
                        {chestCategories.flatMap((cat, catIdx) => {
                          // Gleiche dunkle Pastellfarbe wie die Überschrift
                          const pastelColors = [
                            '#2c2f36', // Arena Chests
                            '#4b537a', // Common Chests
                            '#4a6b4a', // Rare Chests
                            '#6b5a4a', // Epic Chests
                            '#5a4a6b', // Chests of Tartaros
                            '#4a5a6b', // Elven Chests
                            '#4a6b6b', // Cursed Chests
                            '#6b4a4a', // Bank Chests
                            '#6b4a5a', // Runic Chests
                            '#3a3f4a', // Heroic Chests
                            '#3a4a3f', // Vault of the Ancients
                            '#3f3a4a', // Rise of the Ancients
                            '#4a3a3f', // Epic Ancient squad
                            '#3f4a3a', // EAs Punkte
                            '#4a3f3a', // Union Chest
                            '#3a4a4a', // Union Total
                            '#4a4a3a', // Jormungandr Chests
                            '#3a3a4a', // Jormungandr Total
                          ];
                          const catColor = pastelColors[catIdx];
                          if (cat.levels && cat.levels.length > 0) {
                            return cat.levels.map((level, levelIdx) => {
                              // Anzahl und Punkte pro Level korrekt berechnen
                              const filteredChests = row.chestDetails
                                .filter(chest => chestCategoryMatches(chest, cat.name) && chestMatchesLevel(chest, level, cat.name));
                              const count = filteredChests.reduce((sum, chest) => sum + (chest.count || 1), 0);
                              // Punkte: für jede Chest das Level explizit setzen, damit getChestPoints korrekt mapped
                              const points = filteredChests.reduce((sum, chest) => {
                                // Mapping wie in der Debug-Tabelle suchen
                                const mapping = chestMappings.find(m => {
                                  const catA = (m.category||m.Category||'').toLowerCase();
                                  const catB = (chest.category||'').toLowerCase();
                                  const lvlA = String(m.level||m.Level||m.levelStart||m.levelEnd||'').toLowerCase();
                                  const lvlB = String(level||'').toLowerCase();
                                  const lvlStart = Number(m.levelStart||m.level||m.Level||0);
                                  const lvlEnd = Number(m.levelEnd||m.level||m.Level||0);
                                  const lvlNum = Number(level||0);
                                  const sourceA = (m.source||m.Source||'').toLowerCase();
                                  const sourceB = (chest.source||chest.Source||'').toLowerCase();
                                  const typeA = (m.type||m.Type||'').toLowerCase();
                                  const typeB = (chest.type||chest.Type||'').toLowerCase();
                                  if (catA !== catB) return false;
                                  if (lvlA && lvlB && lvlA === lvlB) return true;
                                  if (lvlStart && lvlEnd && lvlNum >= lvlStart && lvlNum <= lvlEnd) return true;
                                  if (sourceA && sourceB && sourceA !== sourceB) return false;
                                  if (typeA && typeB && typeA !== typeB) return false;
                                  return false;
                                });
                                return sum + (mapping ? mapping.points : 0) * (chest.count || 1);
                              }, 0);
                              // Debug-Tooltip: Zeige alle Chests, die in diese Zelle einfließen
                              const debugInfo = filteredChests.map(c => `Lvl:${c.level} Name:${c.Name||c.name||''} P:${getChestPoints({...c, level}, chestMappings)}`).join('\n');
                              return [
                                <td key={row.name + '-' + idx + '-' + cat.name + '-' + levelIdx + '-count'} className="p-2" title={debugInfo} style={{background:catColor}}>{count > 0 ? count : ''}</td>,
                                <td key={row.name + '-' + idx + '-' + cat.name + '-' + levelIdx + '-points'} className="p-2" title={debugInfo} style={{background:catColor}}>{count > 0 ? points : (count > 0 ? 0 : '')}</td>
                              ];
                            }).flat().concat([
                              // Summen-Spalte Anzahl gesamt
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sum'} className="p-2">
                                {
                                  (() => {
                                    const sum = row.chestDetails
                                      .filter(chest => chestCategoryMatches(chest, cat.name))
                                      .reduce((sum, chest) => sum + (chest.count || 1), 0);
                                    return sum > 0 ? <span style={{background:catColor, display:'block', width:'100%', height:'100%'}}>{sum}</span> : '';
                                  })()
                                }
                              </td>,
                              // Summen-Spalte Punkte gesamt
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sumPoints'} className="p-2">
                                {
                                  (() => {
                                    const sumPoints = row.chestDetails
                                      .filter(chest => chestCategoryMatches(chest, cat.name))
                                      .reduce((sum, chest) => {
                                        // Mapping wie in der Debug-Tabelle suchen
                                        const mapping = chestMappings.find(m => {
                                          const catA = (m.category||m.Category||'').toLowerCase();
                                          const catB = (chest.category||'').toLowerCase();
                                          const lvlA = String(m.level||m.Level||m.levelStart||m.levelEnd||'').toLowerCase();
                                          const lvlB = String(chest.level||'').toLowerCase();
                                          const lvlStart = Number(m.levelStart||m.level||m.Level||0);
                                          const lvlEnd = Number(m.levelEnd||m.level||m.Level||0);
                                          const lvlNum = Number(chest.level||0);
                                          const sourceA = (m.source||m.Source||'').toLowerCase();
                                          const sourceB = (chest.source||chest.Source||'').toLowerCase();
                                          const typeA = (m.type||m.Type||'').toLowerCase();
                                          const typeB = (chest.type||chest.Type||'').toLowerCase();
                                          if (catA !== catB) return false;
                                          if (lvlA && lvlB && lvlA === lvlB) return true;
                                          if (lvlStart && lvlEnd && lvlNum >= lvlStart && lvlNum <= lvlEnd) return true;
                                          if (sourceA && sourceB && sourceA !== sourceB) return false;
                                          if (typeA && typeB && typeA !== typeB) return false;
                                          return false;
                                        });
                                        return sum + (mapping ? mapping.points : 0) * (chest.count || 1);
                                      }, 0);
                                    return sumPoints > 0 ? <span style={{background:catColor, display:'block', width:'100%', height:'100%'}}>{sumPoints}</span> : '';
                                  })()
                                }
                              </td>
                            ]);
                          } else if (cat.name === "Rise of the Ancients" && cat.subChests) {
                            // Für Rise of the Ancients: 3 Subchests, jeweils eine Zelle
                            return cat.subChests.map((sub, subIdx) => {
                              const points = row.chestDetails
                                .filter(chest => chestCategoryMatches(chest, sub.name))
                                .reduce((sum, chest) => sum + getChestPoints(chest, chestMappings) * (chest.count || 1), 0);
                              return (
                                <td key={row.name + '-' + idx + '-' + cat.name + '-' + sub.name + '-' + subIdx} className="p-2">{points > 0 ? points : ''}</td>
                              );
                            });
                          } else {
                            // Einzelkategorie ohne Level (inkl. Arena Chests): Anzahl × Punkte anzeigen
                            const filteredChests = row.chestDetails.filter(chest => chestCategoryMatches(chest, cat.name));
                            const count = filteredChests.reduce((sum, chest) => sum + (chest.count || 1), 0);
                            const points = filteredChests.reduce((sum, chest) => sum + getChestPoints(chest, chestMappings) * (chest.count || 1), 0);
                            return (
                              <td key={row.name + '-' + idx + '-' + cat.name + '-single'} className="p-2" style={{background:catColor}}>{count > 0 ? `${count} × ${points}` : ''}</td>
                            );
                          }
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          {/* Debug-Tabelle: Zeigt alle Chests pro Spieler als Klartext */}
          <div className="w-full max-w-6xl mt-8 bg-gray-900 border border-gray-700 rounded p-4">
            <h4 style={{color:'#ffb300', fontWeight:'bold', marginBottom:8}}>DEBUG: Rohdaten aller Chests pro Spieler</h4>
            <table className="w-full text-xs bg-gray-800 rounded">
              <thead>
                <tr>
                  <th>Spieler</th>
                  <th>Kategorie</th>
                  <th>Level</th>
                  <th>Name</th>
                  <th>Punkte</th>
                  <th>Mapping</th>
                </tr>
              </thead>
              <tbody>
                {/* Alle Chests aus allen Spielern sammeln und nach Kategorie sortieren */}
                {(() => {
                  const allChests = [];
                  tableRows.forEach((row, idx) => {
                    (row.chestDetails||[]).forEach((chest, cidx) => {
                      // Strenge Zuordnung für Cursed Citadel Chest: Level tolerant prüfen
                      const name = (chest.Name || chest.name || '').toLowerCase();
                      const type = (chest.Type || chest.type || '').toLowerCase();
                      const source = (chest.Source || chest.source || '').toLowerCase();
                      let lvlRaw = chest.level ?? chest.Level ?? '';
                      let lvl = String(lvlRaw).trim();
                      // Level als Zahl für Vergleich
                      let lvlNum = Number(lvlRaw);
                      let mappedCategory;
                      if (
                        name.includes('cursed') && (type.includes('citadel') || source.includes('citadel')) && (lvl === '20' || lvl === '25' || lvlNum === 20 || lvlNum === 25)
                      ) {
                        mappedCategory = 'Cursed Chests';
                      } else if (
                        name.includes('elven') && (type.includes('citadel') || source.includes('citadel')) && (lvl === '20' || lvl === '25' || lvlNum === 20 || lvlNum === 25)
                      ) {
                        mappedCategory = 'Elven Chests';
                      } else if (name.includes('cursed')) {
                        if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
                        else if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
                        else mappedCategory = chest.category || chest.Category || '';
                      } else if (name.includes('elven')) {
                        if (type.includes('epic') || source.includes('epic')) mappedCategory = 'Epic Chests';
                        else if (type.includes('common') || source.includes('common')) mappedCategory = 'Common Chests';
                        else mappedCategory = chest.category || chest.Category || '';
                      } else {
                        mappedCategory = chest.category || chest.Category || '';
                      }
                      allChests.push({
                        rowIdx: idx,
                        chestIdx: cidx,
                        player: row.name,
                        category: mappedCategory,
                        level: chest.level,
                        name: chest.Name||chest.name||'',
                        chest,
                      });
                    });
                  });
                  // Nach Kategorie sortieren (alphabetisch)
                  allChests.sort((a, b) => {
                    const catA = (a.category||'').toLowerCase();
                    const catB = (b.category||'').toLowerCase();
                    if (catA < catB) return -1;
                    if (catA > catB) return 1;
                    return 0;
                  });
                  return allChests.map((item, idx) => {
                    // Mapping wie gehabt
                    const mapping = chestMappings.find(m => {
                      const catA = (m.category||m.Category||'').toLowerCase();
                      const catB = (item.category||'').toLowerCase();
                      const lvlA = String(m.level||m.Level||m.levelStart||m.levelEnd||'').toLowerCase();
                      const lvlB = String(item.level||'').toLowerCase();
                      const lvlStart = Number(m.levelStart||m.level||m.Level||0);
                      const lvlEnd = Number(m.levelEnd||m.level||m.Level||0);
                      const lvlNum = Number(item.level||0);
                      /* ...existing code... */
                    });
                    return (
                      <tr key={item.player+'-'+item.rowIdx+'-chest-'+item.chestIdx} style={{background: idx%2===0?'#222':'#333'}}>
                        <td>{item.player}</td>
                        <td>{item.category}</td>
                        <td>{item.level}</td>
                        <td>{item.name}</td>
                        <td>{mapping ? mapping.points : ''}</td>
                        <td>{mapping ? `${mapping.category} | ${mapping.levelStart||mapping.level||mapping.Level||''}-${mapping.levelEnd||mapping.level||mapping.Level||''} | ${mapping.points}` : 'kein Mapping'}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
            </div>
          </>
        )}
      </div>
      {selectedPlayer && renderPlayerModal(selectedPlayer)}
      <footer className="mt-auto text-gray-500 text-sm">{t.copyright}</footer>
    </div>
  );
// ...existing code...
}