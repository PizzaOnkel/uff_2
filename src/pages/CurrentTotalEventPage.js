import React, { useEffect, useRef, useState } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const chestCategories = [
  { name: "Arena Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Common Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Rare Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Epic Chests", levels: [15, 20, 25, 30, 35] },
  { name: "Chests of Tartaros", levels: [10, 15, 20, 25, 30] },
  { name: "Citadel Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Citadel cursed Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Bank Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Runic Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Heroic Chests", levels: [10, 15, 20, 25, 30] },
  { name: "Vault of the Ancients", levels: [10, 15, 20, 25, 30, 35] },
  { name: "Quick March Chest", levels: [] },
  { name: "Ancients Chest", levels: [] },
  { name: "ROTA Total", levels: [] },
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

export default function CurrentTotalEventPage({ t, setCurrentPage }) {
  const [players, setPlayers] = useState([]);
  const [troopStrengths, setTroopStrengths] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const tableContainerRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [playersSnap, troopSnap, resultsSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "troopStrengths")),
        getDocs(collection(db, "results")),
      ]);
      setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTroopStrengths(troopSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setResults(resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    return players.find(
      p =>
        p.name === clanmate ||
        (Array.isArray(p.aliases) && p.aliases.includes(clanmate))
    );
  }

  function getNormPoints(troopStrengthName) {
    const troop = troopStrengths.find(ts => ts.name === troopStrengthName);
    // Debug: Logge die Truppenstärke-Daten
    console.log('Searching for troopStrength:', troopStrengthName);
    console.log('Available troopStrengths:', troopStrengths.map(ts => ts.name));
    console.log('Found troop:', troop);
    return troop?.norm?.points || 0;
  }

  let totalIst = 0;
  let totalSoll = 0;

  const tableRows = results.map((result) => {
    const player = findPlayer(result.Clanmate);
    const rank = player?.rank || "";
    const troopStrength = player?.troopStrength || "";
    const normPoints = getNormPoints(troopStrength);
    const ist = result.Points || 0;
    const soll = normPoints;
    totalIst += ist;
    totalSoll += soll;
    const differenz = ist - soll;
    const percent = soll > 0 ? Math.round((ist / soll) * 100) : 0;
    return {
      name: result.Clanmate,
      rank,
      troopStrength,
      chests: Array.isArray(result.chests) ? result.chests.length : 0,
      ist,
      soll,
      differenz,
      percent,
      timestamp: result.timestamp
        ? new Date(result.timestamp).toLocaleString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "",
      chestDetails: result.chests || [],
    };
  });

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
    if (rankA !== rankB) return rankA - rankB;
    if (["Vorgesetzter", "Offizier", "Veteran", "Soldat"].includes(a.rank)) {
      return Number(b.troopStrength) - Number(a.troopStrength);
    }
    return 0;
  });

  function renderPlayerModal(playerRow) {
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
          <div className="mb-2">Normerfüllung: <b>{playerRow.percent}%</b></div>
          <div className="mb-2">Timestamp: <b>{playerRow.timestamp}</b></div>
          <hr className="my-3 border-gray-700" />
          <div>
            <h4 className="font-semibold mb-2 text-blue-200">Persönliche Erfüllungsliste</h4>
            {playerRow.chestDetails.length > 0 ? (
              <ul className="list-disc ml-5">
                {playerRow.chestDetails.map((chest, idx) => (
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

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 pb-32">
      <div className="w-full flex flex-col items-center">
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
                    {chestCategories.map((cat) => (
                      <th
                        key={cat.name}
                        colSpan={cat.levels.length > 0 ? cat.levels.length * 2 + 1 : 1}
                        className="text-xs"
                      >
                        {verticalHeaders.includes(cat.name)
                          ? <VerticalHeader>{cat.name}</VerticalHeader>
                          : cat.name}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {chestCategories.map(cat =>
                      cat.levels.length > 0
                        ? cat.levels.map(level => (
                            <th key={cat.name + level} colSpan="2" className="text-xs">
                              <VerticalHeader>LV {level}</VerticalHeader>
                            </th>
                          )).concat(
                            <th key={cat.name + 'sum'} className="text-xs">
                              <VerticalHeader>Anzahl gesamt</VerticalHeader>
                            </th>
                          )
                        : <th key={cat.name + 'single'} className="text-xs"></th>
                    )}
                  </tr>
                  <tr>
                    {chestCategories.map(cat =>
                      cat.levels.length > 0
                        ? cat.levels.map(level => [
                            <th key={cat.name + level + 'count'} className="text-xs">
                              <VerticalHeader>Anzahl</VerticalHeader>
                            </th>,
                            <th key={cat.name + level + 'points'} className="text-xs">
                              <VerticalHeader>Punkte</VerticalHeader>
                            </th>
                          ]).flat().concat(
                            <th key={cat.name + 'sum2'} className="text-xs"></th>
                          )
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
                        <div className="w-full bg-gray-700 rounded h-4">
                          <div
                            className={`h-4 ${row.percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(200, row.percent)}%` }}
                          />
                        </div>
                        <span className="ml-2">{row.percent}%</span>
                      </td>
                      <td className="p-2">{row.timestamp}</td>
                      {chestCategories.map(cat =>
                        cat.levels.length > 0
                          ? cat.levels.map(level => [
                              <td
                                key={row.name + cat.name + level + 'count'}
                                className="p-2"
                              >
                                {row.chestDetails
                                  .filter(chest => chest.category === cat.name && chest.level === level)
                                  .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>,
                              <td
                                key={row.name + cat.name + level + 'points'}
                                className="p-2"
                              >
                                {row.chestDetails
                                  .filter(chest => chest.category === cat.name && chest.level === level)
                                  .reduce((sum, chest) => sum + (chest.points || 0), 0)}
                              </td>
                            ]).flat().concat(
                              <td
                                key={row.name + cat.name + 'sum'}
                                className="p-2"
                              >
                                {row.chestDetails
                                  .filter(chest => chest.category === cat.name)
                                  .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                              </td>
                            )
                          : <td
                              key={row.name + cat.name + 'single'}
                              className="p-2"
                            >
                              {row.chestDetails
                                .filter(chest => chest.category === cat.name)
                                .reduce((sum, chest) => sum + (chest.count || 0), 0)}
                            </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedPlayer && renderPlayerModal(selectedPlayer)}
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