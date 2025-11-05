                            // Debug: Zeige alle relevanten chestDetails für diese Kategorie und Level
                            // (Logik direkt in die map-Funktion einbauen, z.B. vor der Rückgabe der Table-Zellen)


import React, { useEffect, useRef, useState } from "react";
import StickyBackButton from "../components/StickyBackButton";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { mapToMainName } from "../utils/aliasMapping";
import { getChestPoints, chestMatchesLevel, chestCategoryMatches } from "../utils/logicZentrale";
import { fallbackCategory, fallbackLevel, calculatePlayerNorms, isIgnoredChest } from "../utils/logicZentrale";

// Kategorien wie im Original, inkl. Tartaros
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
  { name: "Heroic Chests", levels: Array.from({ length: 30 }, (_, i) => 16 + i) },
  { name: "Vault of the Ancients", levels: ["10-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44"] },
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
    }}>{children}</div>
  );
}

export default function EventArchivePage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [norms, setNorms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [chestMappings, setChestMappings] = useState([]);
  const [ignoreChests, setIgnoreChests] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [currentPeriodName, setCurrentPeriodName] = useState("");
  const [currentPeriodStart, setCurrentPeriodStart] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");
  const tableContainerRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const playerRowRefs = useRef({});


  // 1. Lade alle Perioden und setze ggf. Default-Periode
  useEffect(() => {
    let ignore = false;
    async function fetchPeriodsOnly() {
      const periodsSnap = await getDocs(collection(db, "periods"));
      if (ignore) return;
      const periodsArr = periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const archivePeriods = periodsArr.filter(p => p.end && new Date(p.end) < new Date());
      setPeriods(archivePeriods);
      if (!selectedPeriodId && archivePeriods.length > 0) {
        setSelectedPeriodId(archivePeriods[archivePeriods.length - 1].id);
      }
    }
    fetchPeriodsOnly();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, []);

  // 2. Lade alle Daten, wenn Periode gesetzt ist
  useEffect(() => {
    if (!selectedPeriodId) return;
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      const [playersSnap, resultsSnap, chestMappingsSnap, normsSnap, periodsSnap, ignoreSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "periods")),
        getDocs(collection(db, "chestMappingIgnore")),
      ]);
      if (ignore) return;
      const playersArr = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersArr);
      setNorms(normsSnap.docs.map(doc => ({ troopStrength: doc.data().troopStrength, value: doc.data().value })));
      setChestMappings(chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIgnoreChests(ignoreSnap.docs.map(doc => doc.data()));
      const periodsArr = periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const archivePeriods = periodsArr.filter(p => p.end && new Date(p.end) < new Date());
      setPeriods(archivePeriods);
      const selectedPeriod = archivePeriods.find(p => p.id === selectedPeriodId);
      setCurrentPeriodName(selectedPeriod?.name || "");
      setCurrentPeriodStart(selectedPeriod?.start || "");
      setCurrentPeriodEnd(selectedPeriod?.end || "");
      const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredResults = selectedPeriod ? resultsArr.filter(r => r.periodId === selectedPeriod.id) : [];
      setResults(filteredResults);
      setLoading(false);
    }
    fetchData();
    return () => { ignore = true; };
    // eslint-disable-next-line
  }, [selectedPeriodId]);

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
    const mainName = mapToMainName(players, clanmate);
    return players.find(p => p.name === mainName);
  }

  function getNormPoints(troopStrengthName) {
    if (!troopStrengthName || troopStrengthName.trim() === '') {
      troopStrengthName = 'nicht definiert';
    }
    const norm = norms.find(n =>
      String(n.troopStrength).trim().toLowerCase() === String(troopStrengthName).trim().toLowerCase()
    );
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
    currentPeriodId: selectedPeriodId
  });
  // Debug: Zeige gefilterte Ergebnisse und gemappte Truhen im Browser
  if (window && window.console) {
  // ...existing code...
    if (auswertung && auswertung.length > 0) {
      auswertung.forEach((row, idx) => {
  // ...existing code...
      });
    }
  }
  let totalIst = auswertung.reduce((sum, row) => sum + row.ist, 0);
  let totalSoll = auswertung.reduce((sum, row) => sum + row.soll, 0);
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
  const tableRows = auswertung;

  function renderPlayerModal(playerRow) {
    const visibleChests = playerRow.chestDetails.filter(chest => {
      return !isIgnoredChest(chest);
    });
    const grouped = {};
    visibleChests.forEach(chest => {
      const key = `${chest.category}__${chest.level ?? ''}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: chest.category,
          level: chest.level,
          count: 0,
          points: 0,
          name: chest.Name // für Spezialanzeige
        };
      }
      grouped[key].count += chest.count || 1;
      grouped[key].points += getChestPoints(chest, chestMappings) * (chest.count || 1);
    });
    const groupedList = Object.values(grouped);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setSelectedPlayer(null)}>
        <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
          <button className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl" onClick={() => setSelectedPlayer(null)}>&times;</button>
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
              <div className={`h-5 ${playerRow.percent >= 100 ? 'bg-green-400' : playerRow.percent >= 80 ? 'bg-yellow-400' : 'bg-blue-400'}`} style={{ width: `${Math.min(100, playerRow.percent)}%`, transition: 'width 0.5s' }} />
              <span className="absolute left-2 top-0 text-xs text-white font-bold" style={{lineHeight:'1.8em'}}>{playerRow.percent}%</span>
            </div>
            <span style={{fontSize:'1.5em'}}>{playerRow.percent >= 100 ? '🏆' : playerRow.percent >= 80 ? '😃' : playerRow.percent >= 50 ? '🙂' : playerRow.percent > 0 ? '😐' : '😴'}</span>
          </div>
          <div className="mb-2">Timestamp: <b>{playerRow.timestamp}</b></div>
          <hr className="my-3 border-gray-700" />
          <div>
            <h4 className="font-semibold mb-2 text-blue-200">Persönliche Erfüllungsliste</h4>
            <div style={{maxHeight: '40vh',overflowY: 'auto',marginBottom: '8px',paddingRight: '4px'}}>
              {groupedList.length > 0 ? (
                <ul className="list-disc ml-5">
                  {groupedList.map((chest, idx) => {
                    let displayName = chest.category;
                    if (chest.category === "Epic Chests" && (chest.level === 0 || chest.level === "0")) {
                      displayName = chest.name || "Golden Guardian Epic Chest";
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
          </div>
        </div>
      </div>
    );
  }

  // Spieler mit "nicht definiert" in Rang oder Truppenstärke
  const undefinedPlayers = tableRows.filter(row =>
    !row.rank || row.rank.toLowerCase().includes('nicht definiert') ||
    !row.troopStrength || String(row.troopStrength).toLowerCase().includes('nicht definiert')
  );

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
          <StickyBackButton onClick={() => window.scrollTo({top:0, behavior:'smooth'})} label={"On Top"} style={{ background: '#1976d2', width:'100px', marginTop:'34px' }} />
        </div>
      </div>
      <div className="w-full flex flex-col items-center">
        {/* Auswahlmenü für abgeschlossene Perioden */}
        <div className="w-full flex flex-col items-center mb-4 mt-4">
          <label htmlFor="period-select" className="mb-1 text-lg text-blue-200 font-semibold">Eventperiode auswählen:</label>
          <select
            id="period-select"
            className="bg-gray-800 text-white px-4 py-2 rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            value={selectedPeriodId}
            onChange={e => setSelectedPeriodId(e.target.value)}
            style={{ minWidth: 220 }}
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.start} - {period.end})
              </option>
            ))}
          </select>
        </div>
        {/* Name und Zeitraum der aktuellen Veranstaltungsperiode */}
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
        <h2 className="text-4xl font-bold mb-6 text-center text-blue-400">Event-Archiv</h2>
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
                <div className={`h-6 ${totalSoll > 0 && (totalIst / totalSoll) >= 1 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${totalSoll > 0 ? Math.min(200, (totalIst / totalSoll) * 100) : 0}%` }} />
              </div>
              <div className="mt-2 text-center" style={{ color: '#ff6666', fontWeight: 500, fontSize: '1.1em' }}>{`Anzahl Spieler: ${tableRows.length}`}</div>
            </div>
            {/* Slider über der Tabelle */}
            <div className="w-full max-w-6xl mb-2">
              <input type="range" min={0} max={tableContainerRef.current ? tableContainerRef.current.scrollWidth - tableContainerRef.current.clientWidth : 100} value={sliderValue} onChange={handleSliderChange} className="w-full" style={{ accentColor: "#1976d2" }} />
            </div>
            <div className="w-full max-w-6xl overflow-x-auto" ref={tableContainerRef} onScroll={handleTableScroll} style={{ scrollBehavior: "smooth" }}>
              <table className="w-full text-sm bg-gray-800 rounded">
                <thead>
                  <tr className="bg-gray-700">
                    <th rowSpan="3" className="p-2"><VerticalHeader>Name</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Rang</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Truppenstärke</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Clantruhen</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Punkte Total (Ist)</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Norm (Soll)</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Differenz</VerticalHeader></th>
                    <th rowSpan="3" className="p-2 norm-column" style={{ width: "120px", minWidth: "120px" }}><VerticalHeader>Normerfüllung</VerticalHeader></th>
                    <th rowSpan="3" className="p-2"><VerticalHeader>Timestamp</VerticalHeader></th>
                    {chestCategories.map((cat, catIdx) => {
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
                          {cat.name}
                        </th>
                      ];
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
                  {tableRows.map((row, idx) => (
                    <tr key={row.name + '-' + row.troopStrength + '-' + row.rank + '-' + idx} ref={el => { playerRowRefs.current[row.name] = el; }} className={(selectedPlayer && selectedPlayer.name === row.name) ? 'bg-yellow-700 border-b border-yellow-400' : (idx % 2 === 0 ? "bg-gray-800 border-b border-gray-700" : "bg-gray-900 border-b border-gray-700") }>
                      <td className="p-2">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full w-32 h-10 flex items-center justify-center mx-auto transition-all duration-200" style={{ minWidth: "120px", minHeight: "40px" }} onClick={() => setSelectedPlayer(row)}>{row.name}</button>
                      </td>
                      <td className="p-2">{row.rank}</td>
                      <td className="p-2">{row.troopStrength}</td>
                      <td className="p-2">{row.chests}</td>
                      <td className="p-2">{row.ist}</td>
                      <td className="p-2">{row.soll}</td>
                      <td className="p-2">{row.differenz}</td>
                      <td className="p-2 norm-column" style={{ width: "120px", minWidth: "120px" }}>
                        <div className="w-full bg-gray-700 rounded h-4 overflow-hidden">
                          <div className={`h-4 ${row.percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, row.percent)}%`, transition: 'width 0.5s' }} />
                        </div>
                        <span className="ml-2">{row.percent}%</span>
                      </td>
                      <td className="p-2">{row.timestamp}</td>
                      {chestCategories.map((cat, catIdx) => {
                        let catBg;
                        if (cat.name === "EAs Total" || cat.name === "Jormungandr Total") catBg = 'bg-gray-800';
                        else if (cat.name === "Union Chest") catBg = 'bg-gray-700';
                        else catBg = catIdx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
                        if (cat.name === "Rise of the Ancients" && cat.subChests) {
                          return cat.subChests.map((sub, subIdx) => (
                            <td key={row.name + '-' + idx + '-' + cat.name + '-' + sub.name + '-' + subIdx} className={`p-2 ${catBg}`}>
                              {row.chestDetails.filter(chest => {
                                if (sub.name === "Quick March Chest") return chestCategoryMatches(chest, "Quick March Chest");
                                if (sub.name === "Ancients Chest") return chestCategoryMatches(chest, "Ancients Chest");
                                if (sub.name === "ROTA Total") return chestCategoryMatches(chest, "Quick March Chest") || chestCategoryMatches(chest, "Ancients Chest");
                                return false;
                              }).reduce((sum, chest) => sum + (chest.count || 0), 0)}
                            </td>
                          ));
                        } else if (Array.isArray(cat.levels) && cat.levels.length > 0) {
                          // Bank Chests: tolerant nach Kategorie und Name/Level
                          if (cat.name === "Bank Chests") {
                            const nameMap = {
                              Wooden: "Wooden Chest",
                              Bronze: "Bronze Chest",
                              Silver: "Silver Chest",
                              Golden: "Golden Chest",
                              Precious: "Precious Chest",
                              Magic: "Magic Chest"
                            };
                            return cat.levels.map((level, levelIdx) => [
                              <td key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-count-' + levelIdx} className={`p-2 ${catBg}`}>
                                {row.chestDetails.filter(chest => {
                                  const expectedName = nameMap[level] || level + " Chest";
                                  return (chest.category === "Bank Chests" && (chest.Name === expectedName || chest.name === expectedName || String(chest.level).toLowerCase() === String(level).toLowerCase()));
                                }).reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>,
                              <td key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-points-' + levelIdx} className={`p-2 ${catBg}`}>
                                {row.chestDetails.filter(chest => {
                                  const expectedName = nameMap[level] || level + " Chest";
                                  return (chest.category === "Bank Chests" && (chest.Name === expectedName || chest.name === expectedName || String(chest.level).toLowerCase() === String(level).toLowerCase()));
                                }).reduce((sum, chest) => sum + getChestPoints(chest, chestMappings), 0)}
                              </td>
                            ]).flat().concat([
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sum'} className={`p-2 font-semibold ${catBg}`}>
                                {row.chestDetails.filter(chest => chest.category === "Bank Chests").reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>,
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sumPoints'} className={`p-2 font-semibold ${catBg}`}>
                                {row.chestDetails.filter(chest => chest.category === "Bank Chests").reduce((sum, chest) => sum + getChestPoints(chest, chestMappings), 0)}
                              </td>
                            ]);
                          } else {
                            // Levelspalten: tolerant nach Zahl/String
                            return cat.levels.map((level, levelIdx) => [
                              <td key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-count-' + levelIdx} className={`p-2 ${catBg}`}>
                                {row.chestDetails.filter(chest => {
                                  return (chest.category === cat.name && chestMatchesLevel(chest, level, cat.name));
                                }).reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>,
                              <td key={row.name + '-' + idx + '-' + cat.name + '-' + level + '-points-' + levelIdx} className={`p-2 ${catBg}`}>
                                {row.chestDetails.filter(chest => {
                                  return (chest.category === cat.name && chestMatchesLevel(chest, level, cat.name));
                                }).reduce((sum, chest) => sum + getChestPoints(chest, chestMappings), 0)}
                              </td>
                            ]).flat().concat([
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sum'} className={`p-2 font-semibold ${catBg}`}>
                                {row.chestDetails.filter(chest => chest.category === cat.name).reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>,
                              <td key={row.name + '-' + idx + '-' + cat.name + '-sumPoints'} className={`p-2 font-semibold ${catBg}`}>
                                {row.chestDetails.filter(chest => chest.category === cat.name).reduce((sum, chest) => sum + getChestPoints(chest, chestMappings), 0)}
                              </td>
                            ]);
                          }
                        } else {
                          return (
                            <td key={row.name + '-' + idx + '-' + cat.name + '-single'} className={`p-2 ${catBg}`}>
                              {row.chestDetails.filter(chest => chest.category === cat.name).reduce((sum, chest) => sum + (chest.count || 0), 0)}
                            </td>
                          );
                        }
                        if (cat.name === "Jormungandr Total") {
                          return [<td key={row.name + '-' + idx + "-empty-after-jormungandr"} className="p-2 bg-gray-700"></td>];
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
      <footer className="mt-auto text-gray-500 text-sm">{t?.copyright}</footer>
    </div>
  );
}
