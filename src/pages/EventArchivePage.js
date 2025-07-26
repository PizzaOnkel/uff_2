
import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { mapToMainName } from "../utils/aliasMapping";

export default function EventArchivePage({ t, setCurrentPage }) {
  // --- wie CurrentTotalEventPage, aber mit Perioden-Auswahl ---
  const chestCategories = [
    { name: "Arena Chests", levels: [] },
    { name: "Common Chests", levels: [5, 10, 15, 20, 25] },
    { name: "Rare Chests", levels: [10, 15, 20, 25, 30] },
    { name: "Epic Chests", levels: [15, 20, 25, 30, 35] },
    { name: "Chests of Tartaros", levels: [15, 20, 25, 30, 35] },
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
    { name: "EAs Total", levels: [] },
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
    "EAs Total",
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
  const [uploadTimes, setUploadTimes] = useState({});
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [ignoreChests, setIgnoreChests] = useState([]);
  const tableContainerRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [currentPeriodName, setCurrentPeriodName] = useState("");
  const [currentPeriodStart, setCurrentPeriodStart] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [playersSnap, troopSnap, resultsSnap, chestMappingsSnap, normsSnap, uploadTimesSnap, periodsSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "troopStrengths")),
        getDocs(collection(db, "results")),
        getDocs(collection(db, "chestMappings")),
        getDocs(collection(db, "norms")),
        getDocs(collection(db, "uploadtime")),
        getDocs(collection(db, "periods")),
      ]);
      setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTroopStrengths(troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setChestMappings(chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      // Finde aktuelle Periode (start <= jetzt && (end >= jetzt || end leer))
      let now = new Date();
      let currentPeriodId = null;
      for (const p of periodsArr) {
        if (p.start && new Date(p.start) <= now && (!p.end || new Date(p.end) >= now)) {
          currentPeriodId = p.id;
          break;
        }
      }
      // Archiv-Perioden: nur vergangene Perioden (end < jetzt), aber nicht die aktuelle
      const archivePeriods = periodsArr.filter(p => p.end && new Date(p.end) < now && p.id !== currentPeriodId);
      setPeriods(archivePeriods);
      // Periode setzen, falls noch nicht gesetzt oder nicht mehr gültig
      if (!selectedPeriodId || !archivePeriods.some(p => p.id === selectedPeriodId)) {
        if (archivePeriods.length > 0) {
          setSelectedPeriodId(archivePeriods[archivePeriods.length - 1].id);
        } else {
          setSelectedPeriodId("");
        }
      }
      // Periodeninfo für Anzeige
      const selectedPeriod = archivePeriods.find(p => p.id === selectedPeriodId);
      setCurrentPeriodName(selectedPeriod?.name || "");
      setCurrentPeriodStart(selectedPeriod?.start || "");
      setCurrentPeriodEnd(selectedPeriod?.end || "");
      // Ergebnisse für gewählte Periode filtern
      const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredResults = resultsArr.filter(r => r.periodId === selectedPeriodId);
      setResults(filteredResults);
      setLoading(false);
    }
    // Ignore-Liste aus public/json-data laden
    async function loadIgnoreList() {
      try {
        const resp = await fetch(process.env.PUBLIC_URL + "/json-data/chest-mapping-ignore.csv");
        if (!resp.ok) throw new Error("CSV nicht gefunden");
        const csvText = await resp.text();
        const parsed = Papa.parse(csvText, { header: true, delimiter: ";", skipEmptyLines: true });
        setIgnoreChests(parsed.data);
      } catch (e) {
        setIgnoreChests([]);
      }
    }
    fetchData();
    loadIgnoreList();
    // eslint-disable-next-line
  }, [selectedPeriodId]);

  // --- Hilfsfunktionen und Aggregation wie CurrentTotalEventPage, aber alle Daten laufen über results (bereits gefiltert) ---

  function findPlayer(clanmate) {
    // Gibt das ganze Spielerobjekt zurück, aber mapToMainName gibt nur den Namen
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

  let totalIst = 0;
  let totalSoll = 0;

  const playerMap = new Map();
  const allowedCategories = chestCategories.map(cat => cat.name);

  function fallbackCategory(chest) {
    if (chest.category) return chest.category;
    if (chest.Type) return chest.Type;
    if (chest.Name) return chest.Name;
    if (chest.Source) return chest.Source;
    return 'Unbekannt';
  }
  function fallbackLevel(chest) {
    return chest.level ?? chest.Level ?? 0;
  }

  results.forEach(result => {
    const playerName = result.Clanmate;
    const player = findPlayer(playerName);
    const rank = player?.rank || "";
    let troopStrength = player?.troopStrength || "";
    if (!troopStrength || troopStrength.trim() === '') {
      troopStrength = 'nicht definiert';
    }
    const normPoints = getNormPoints(troopStrength);

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

    const mappedChests = Array.isArray(result.chests)
      ? result.chests.map(chest => {
          if (!chest.category && chest.Type) {
            chest.category = chest.Type;
          }
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
          let category = "Unbekannt";
          let level = chest.level ?? chest.Level ?? 0;
          if ((chest.Type||"").toLowerCase().includes("arena") || (chest.Source||"").toLowerCase().includes("arena") || (chest.Name||"").toLowerCase().includes("arena")) {
            category = "Arena Chests";
            level = "total";
          }
          else if ((chest.Name||"").toLowerCase().includes("orc") || (chest.Type||"").toLowerCase().includes("common crypt")) {
            category = "Common Chests";
          } else if ((chest.Name||"").toLowerCase().includes("elven citadel chest")) {
            category = "Elven Chests";
          } else if ((chest.Name||"").toLowerCase().includes("cursed citadel chest")) {
            category = "Cursed Chests";
          } else if (((chest.Type||chest.Kategorie||chest.Category||"").toLowerCase().includes("heroic monster"))) {
            category = "Heroic Chests";
          }
          else if ((chest.Name||"").toLowerCase().includes("rare dragon") || (chest.Type||"").toLowerCase().includes("rare crypt")) {
            category = "Rare Chests";
          }
          else if ((chest.Name||"").toLowerCase().includes("epic") || (chest.Type||"").toLowerCase().includes("epic") || (chest.Name||"").toLowerCase().includes("undead")) {
            category = "Epic Chests";
          }
          else if ((chest.Name||"").toLowerCase().includes("elven") || (chest.Name||"").toLowerCase().includes("citadel") || (chest.Type||"").toLowerCase().includes("elven") || (chest.Type||"").toLowerCase().includes("citadel") || (chest.Source||"").toLowerCase().includes("elven") || (chest.Source||"").toLowerCase().includes("citadel")) {
          // entfernt, Mapping jetzt weiter oben
          }
          else if (
            (chest.Name||"").toLowerCase().includes("bank") ||
            (chest.Type||"").toLowerCase().includes("bank") ||
            (chest.Source||"").toLowerCase().includes("bank") ||
            ["wooden","bronze","silver","golden","precious","magic"].some(lvl => (chest.Name||"").toLowerCase().includes(lvl) || (chest.Type||"").toLowerCase().includes(lvl))
          ) {
            category = "Bank Chests";
            const bankLevels = ["Wooden","Bronze","Silver","Golden","Precious","Magic"];
            let foundLevel = bankLevels.find(lvl =>
              (chest.Name||"").toLowerCase().includes(lvl.toLowerCase()) ||
              (chest.Type||"").toLowerCase().includes(lvl.toLowerCase()) ||
              (chest.level||"").toString().toLowerCase() === lvl.toLowerCase() ||
              (chest.Level||"").toString().toLowerCase() === lvl.toLowerCase()
            );
            if (!foundLevel && (chest.level || chest.Level)) {
              const num = Number(chest.level ?? chest.Level);
              if (!isNaN(num) && num >= 1 && num <= 6) {
                foundLevel = bankLevels[num-1];
              }
            }
            if (!foundLevel) foundLevel = "Unbekannt";
            level = foundLevel;
          }
          else if ((chest.Name||"").toLowerCase().includes("jormungandr") || (chest.Type||"").toLowerCase().includes("jormungandr") || (chest.Source||"").toLowerCase().includes("jormungandr")) {
            category = "Jormungandr Chests";
            level = "total";
          }
          else if ((chest.Name||"").toLowerCase().includes("cursed") || (chest.Type||"").toLowerCase().includes("cursed") || (chest.Source||"").toLowerCase().includes("cursed")) {
          // entfernt, Mapping jetzt weiter oben
          }
          else if ((chest.Name||"").toLowerCase().includes("authority") || (chest.Type||"").toLowerCase().includes("authority") || (chest.Source||"").toLowerCase().includes("authority")) {
            category = "Union Chest";
            level = "total";
          }
          else if ((chest.Name||"").toLowerCase().includes("runic") || (chest.Type||"").toLowerCase().includes("runic") || (chest.Source||"").toLowerCase().includes("runic")) {
            category = "Runic Chests";
          }
          else if ((chest.Name||"").toLowerCase().includes("heroic") || (chest.Type||"").toLowerCase().includes("heroic") || (chest.Source||"").toLowerCase().includes("heroic")) {
          // entfernt, Mapping jetzt weiter oben
          }
          else if ((chest.Name||"").toLowerCase().includes("vault") || (chest.Type||"").toLowerCase().includes("vault") || (chest.Source||"").toLowerCase().includes("vault")) {
            category = "Vault of the Ancients";
          }
          else if ((chest.Name||"").toLowerCase().includes("quick march") || (chest.Type||"").toLowerCase().includes("quick march") || (chest.Source||"").toLowerCase().includes("quick march")) {
            category = "Quick March Chest";
          }
          else if ((chest.Name||"").toLowerCase().includes("ancients chest") || (chest.Type||"").toLowerCase().includes("ancients chest") || (chest.Source||"").toLowerCase().includes("ancients chest")) {
            category = "Ancients Chest";
          }
          else if ((chest.Name||"").toLowerCase().includes("rota") || (chest.Type||"").toLowerCase().includes("rota") || (chest.Source||"").toLowerCase().includes("rota")) {
            category = "ROTA Total";
          }
          else if ((chest.Name||"").toLowerCase().includes("epic ancient squad") || (chest.Type||"").toLowerCase().includes("epic ancient squad") || (chest.Source||"").toLowerCase().includes("epic ancient squad")) {
            category = "Epic Ancient squad";
          }
          else if ((chest.Name||"").toLowerCase().includes("eas total") || (chest.Type||"").toLowerCase().includes("eas total") || (chest.Source||"").toLowerCase().includes("eas total")) {
            category = "EAs Total";
          }
          else if ((chest.Name||"").toLowerCase().includes("union total") || (chest.Type||"").toLowerCase().includes("union total") || (chest.Source||"").toLowerCase().includes("union total")) {
            category = "Union Total";
          }
          if (category === "Unbekannt") {
            category = chest.category || fallbackCategory(chest);
          }
          return {
            ...chest,
            category,
            level,
            count: chest.count || 1,
            points
          };
        })
      : [];
    const filteredChests = mappedChests.filter(chest => !isIgnoredChest(chest));
    const chestsCount = filteredChests.reduce((sum, chest) => sum + (chest.count || 0), 0);
    const ist = filteredChests.reduce((sum, chest) => sum + (chest.points || 0), 0);
    const timestamp = result.timestamp
      ? new Date(result.timestamp).toLocaleString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "";
    if (playerMap.has(playerName)) {
      const entry = playerMap.get(playerName);
      entry.chests += chestsCount;
      entry.ist += ist;
      entry.chestDetails = entry.chestDetails.concat(filteredChests);
      entry.timestamps.push(timestamp);
    } else {
      playerMap.set(playerName, {
        name: playerName,
        rank,
        troopStrength,
        chests: chestsCount,
        ist,
        soll: normPoints,
        differenz: 0,
        percent: 0,
        timestamps: [timestamp],
        chestDetails: filteredChests
      });
    }
  });

  const tableRows = Array.from(playerMap.values()).map(row => {
    row.differenz = row.ist - row.soll;
    row.percent = row.soll > 0 ? Math.round((row.ist / row.soll) * 100) : 0;
    let uploadTimestamp = "";
    if (results.length > 0) {
      const resultEntry = results.find(r => r.Clanmate === row.name);
      if (resultEntry && resultEntry.periodId && uploadTimes[resultEntry.periodId]) {
        const d = new Date(uploadTimes[resultEntry.periodId]);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        uploadTimestamp = `${yyyy}/${mm}/${dd}-${hh}:${min}`;
      }
    }
    row.timestamp = uploadTimestamp;
    return row;
  });

  totalIst = tableRows.reduce((sum, row) => sum + row.ist, 0);
  totalSoll = tableRows.reduce((sum, row) => sum + row.soll, 0);

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
  tableRows.sort((a, b) => {
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

  function renderPlayerModal(playerRow) {
    const grouped = {};
    playerRow.chestDetails.forEach(chest => {
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
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        onClick={() => setSelectedPlayer(null)}
      >
        <div
          className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            onClick={() => setSelectedPlayer(null)}
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold mb-4 text-blue-300">{playerRow.name}</h3>
          <div className="mb-2">Rang: <b>{playerRow.rank}</b></div>
          <div className="mb-2">Truppenstärke: <b>{playerRow.troopStrength}</b></div>
          <div className="mb-2">Clantruhen: <b>{playerRow.chests}</b></div>
          <div className="mb-2">Punkte Total (Ist): <b>{playerRow.ist}</b></div>
          <div className="mb-2">Norm (Soll): <b>{playerRow.soll}</b></div>
          <div className="mb-2">Differenz: <b>{playerRow.differenz}</b></div>
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
            {groupedList.length > 0 ? (
              <ul className="list-disc ml-5">
                {groupedList.map((chest, idx) => (
                  <li key={idx}>
                    {chest.category} {chest.level ? `LV ${chest.level}` : ""}: {chest.count}x, {chest.points} Punkte
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">Keine Truhen-Daten vorhanden.</div>
            )}
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

  // --- Render-Block: Dropdown GANZ OBEN, dann wie CurrentTotalEventPage ---
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      {/* ...TopTen-Liste entfernt... */}
      {/* Zurück-Button ganz oben */}
      <div className="w-full flex justify-start mb-4">
        <button
          onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
          style={{ minWidth: 120 }}
        >
          &larr; Zurück
        </button>
      </div>
      {/* Dropdown für Eventperiode */}
      <div className="mb-4 w-full max-w-2xl flex flex-col items-center">
        <label className="mr-2 text-lg font-semibold text-purple-200">Eventperiode:</label>
        <select
          value={selectedPeriodId}
          onChange={e => setSelectedPeriodId(e.target.value)}
          className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600"
        >
          {periods.filter(p => p.end && new Date(p.end) < new Date()).map(period => (
            <option key={period.id} value={period.id}>
              {period.name} {period.start ? `(${new Date(period.start).toLocaleDateString('de-DE')}` : ''}{period.end ? ` – ${new Date(period.end).toLocaleDateString('de-DE')})` : ''}
            </option>
          ))}
        </select>
      </div>
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
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "#1976d2" }}
            />
          </div>
          <div
            className="w-full max-w-6xl overflow-x-auto"
            ref={tableContainerRef}
            onScroll={e => setSliderValue(e.target.scrollLeft)}
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
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-800 border-b border-gray-700" : "bg-gray-900 border-b border-gray-700"}
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
                      let catBg;
                      if (cat.name === "EAs Total" || cat.name === "Jormungandr Total") catBg = 'bg-gray-800';
                      else if (cat.name === "Union Chest") catBg = 'bg-gray-700';
                      else catBg = catIdx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
                      if (cat.name === "Rise of the Ancients" && cat.subChests) {
                        return cat.subChests.map(sub => (
                          <td
                            key={row.name + cat.name + sub.name}
                            className={`p-2 ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === sub.name)
                              .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                          </td>
                        ));
                      } else if (Array.isArray(cat.levels) && cat.levels.length > 0) {
                        return cat.levels.map(level => [
                          <td
                            key={row.name + cat.name + level + 'count'}
                            className={`p-2 ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === cat.name && chest.level === level)
                              .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                          </td>,
                          <td
                            key={row.name + cat.name + level + 'points'}
                            className={`p-2 ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === cat.name && chest.level === level)
                              .reduce((sum, chest) => sum + (chest.points || 0), 0)}
                          </td>
                        ]).flat().concat([
                          <td
                            key={row.name + cat.name + 'sum'}
                            className={`p-2 font-semibold ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === cat.name)
                              .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                          </td>,
                          <td
                            key={row.name + cat.name + 'sumPoints'}
                            className={`p-2 font-semibold ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === cat.name)
                              .reduce((sum, chest) => sum + (chest.points || 0), 0)}
                          </td>
                        ]);
                      } else {
                        return (
                          <td
                            key={row.name + cat.name + 'single'}
                            className={`p-2 ${catBg}`}
                          >
                            {row.chestDetails
                              .filter(chest => chest.category === cat.name)
                              .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                          </td>
                        );
                      }
                      if (cat.name === "Jormungandr Total") {
                        return [
                          (
                            <td
                              key={row.name + "empty-after-jormungandr"}
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
      {/* Zurück-Button ganz unten als echter Button */}
      <div className="w-full flex justify-start mt-8 mb-2">
        <button
          onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
          className="px-6 py-2 bg-blue-600 rounded text-white font-semibold text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
          style={{ minWidth: 120 }}
        >
          &larr; Zurück
        </button>
      </div>
      {selectedPlayer && renderPlayerModal(selectedPlayer)}
      <footer className="mt-auto text-gray-500 text-sm">{t?.copyright}</footer>
    </div>
  );
}