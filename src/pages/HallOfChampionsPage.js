import React, { useState, useEffect, useRef } from "react";
import { ROUTES } from "../routes";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { mapToMainName } from "../utils/aliasMapping";
import { getChestPoints, isIgnoredChest, fallbackCategory, fallbackLevel } from "../utils/logicZentrale";
import "./TopTen.css";
import StickyBackButton from "../components/StickyBackButton";

// --- Tartaros-Logik aus CurrentTotalEventPage.js ---
function tartarosLevelFromChest(chest) {
  let tartarosMatch = (chest.Name||"").match(/tartaros crypt level (\d+)/i);
  if (!tartarosMatch && chest.Type) {
    tartarosMatch = (chest.Type||"").match(/tartaros crypt level (\d+)/i);
  }
  if (!tartarosMatch && chest.Source) {
    tartarosMatch = (chest.Source||"").match(/tartaros crypt level (\d+)/i);
  }
  if (tartarosMatch) {
    return Number(tartarosMatch[1]);
  } else if ([15,20,25,30,35].includes(Number(chest.level ?? chest.Level))) {
    return Number(chest.level ?? chest.Level);
  } else {
    return Number(chest.level ?? chest.Level ?? 0);
  }
}

function isTartarosChest(chest) {
  return (
    (chest.category === "Chests of Tartaros") ||
    (chest.Name||"").toLowerCase().includes("tartaros") ||
    (chest.Type||"").toLowerCase().includes("tartaros") ||
    (chest.Source||"").toLowerCase().includes("tartaros")
  );
}

function isArenaChest(chest) {
  return (
    (chest.category && chest.category === "Arena Chests") ||
    chest.Type === "Arena" ||
    chest.Source === "Arena"
  );
}
// --- Ende Tartaros-Logik ---

// Kategorien wie in TopTen.js
const categories = [
  { key: 'ALL_CATEGORIES', label: 'Alle Chests', icon: '🌈', color: '#FFD700' },
  { key: 'Arena Total', label: 'Arena Chests', icon: '⚔️', color: '#7C3AED' },
  { key: 'Common Total', label: 'Common Chests', icon: '📦', color: '#10B981' },
  { key: 'Rare Total', label: 'Rare Chests', icon: '💎', color: '#3B82F6' },
  { key: 'Epic Total', label: 'Epic Chests', icon: '👑', color: '#8B5CF6' },
  { key: 'Tartaros Total', label: 'Tartaros Chests', icon: '🔥', color: '#DC2626' },
  { key: 'Elven Total', label: 'Elven Chests', icon: '🧝', color: '#059669' },
  { key: 'Cursed Total', label: 'Cursed Chests', icon: '🌙', color: '#6B46C1' },
  { key: 'Bank Total', label: 'Bank Chests', icon: '💰', color: '#D97706' },
  { key: 'Runic Total', label: 'Runic Chests', icon: '🔮', color: '#F97316' },
  { key: 'Heroic Total', label: 'Heroic Chests', icon: '🏆', color: '#EF4444' },
  { key: 'VotA Total', label: 'Vault of the Ancients', icon: '🏛️', color: '#8B5CF6' },
  { key: 'ROTA Total', label: 'Rise of the Ancients', icon: '🌟', color: '#EC4899' },
  { key: 'EAs Total', label: 'Epic Ancient Squad', icon: '⚡', color: '#F59E0B' },
  { key: 'Union Total', label: 'Union Chests', icon: '🤝', color: '#6366F1' },
  { key: 'Jormungandr Total', label: 'Jormungandr Chests', icon: '🐉', color: '#059669' },
];

export default function HallOfChampionsPage({ t, setCurrentPage }) {
  const [data, setData] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [top3ByCategory, setTop3ByCategory] = useState({});
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [ignoreChests, setIgnoreChests] = useState([]);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  // Kategorie automatisch wechseln wie ein Spielautomat
  useEffect(() => {
    if (loading) return;
    intervalRef.current = setInterval(() => {
      setCurrentCategoryIdx(idx => (idx + 1) % categories.length);
    }, 10000); // alle 10 Sekunden
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lade alle Ergebnisse, Spieler, Ignore-Liste
        const [resultsSnap, playersSnap, ignoreSnap, chestMappingsSnap] = await Promise.all([
          getDocs(collection(db, "results")),
          getDocs(collection(db, "players")),
          getDocs(collection(db, "chestMappingIgnore")),
          getDocs(collection(db, "chestMappings")),
        ]);
        const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const playersArr = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const ignoreList = ignoreSnap.docs.map(doc => doc.data());
        const chestMappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(resultsArr); // ALLE Ergebnisse, keine Filterung auf Periode
        setPlayers(playersArr);
        setIgnoreChests(ignoreList);
        setChestMappings(chestMappings);
      } catch (error) {
        setData([]);
        setPlayers([]);
        setIgnoreChests([]);
        setChestMappings([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Aggregiere für jede Kategorie die Top 3 Spieler (über alle Daten)
  // Ignore-Logik wie in StandardsEvaluationPage.js
  function isIgnoredChest(chest) {
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
      return true;
    }
    return false;
  }

  // Mapping-/Filter-/Aggregation-Logik wie in CurrentTotalEventPage.js
  const [chestMappings, setChestMappings] = useState([]);
  useEffect(() => {
    if (data.length === 0 || players.length === 0) return;
    const playerMap = new Map();
    data.forEach(row => {
      if (!row.Clanmate || row.Clanmate.trim() === '') return;
      const mainName = mapToMainName(players, row.Clanmate);
      const key = (row.playerId && String(row.playerId).trim() !== '')
        ? String(row.playerId).trim()
        : (mainName || '').trim().normalize('NFKC').toLowerCase();
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          Clanmate: mainName,
          _aggKey: key,
          ...Object.fromEntries(categories.map(c => [c.key, 0]))
        });
      }
      const entry = playerMap.get(key);
      if (Array.isArray(row.chests)) {
        row.chests.forEach(chest => {
          const cat = fallbackCategory(chest);
          if (cat && entry.hasOwnProperty(cat)) {
            entry[cat] += Number(chest.count || 1);
            entry['ALL_CATEGORIES'] += Number(chest.count || 1);
          }
        });
      }
    });
    // Für jede Kategorie Top 3 berechnen
    const result = {};
    categories.forEach(cat => {
      const arr = Array.from(playerMap.values()).filter(p => p[cat.key] > 0);
      result[cat.key] = arr.sort((a, b) => b[cat.key] - a[cat.key]).slice(0, 3);
    });
    setTop3ByCategory(result);
  }, [data, players, ignoreChests, chestMappings]);

  // Musikplayer-Logik
  // Audio nur stoppen
  const handleAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setAudioPlaying(false);
  };

  // Audio beim Laden automatisch abspielen
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setAudioPlaying(true);
    const onEnded = () => setAudioPlaying(false);
    audioRef.current.addEventListener('ended', onEnded);
    return () => audioRef.current.removeEventListener('ended', onEnded);
  }, []);

  if (loading) {
    return (
      <div className="top-ten-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Lade Champions...</p>
        </div>
      </div>
    );
  }


  // Aktuelle Kategorie für das Podium
  const currentCategory = categories[currentCategoryIdx];

  return (
    <div className="top-ten-container" style={{ minHeight: '100vh', paddingBottom: 0 }}>
      <StickyBackButton onClick={() => setCurrentPage(ROUTES.NAVIGATION)} label={t?.backToNavigation || 'Zurück zur Navigation'} />
      <div className="top-ten-header" style={{ marginBottom: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10,
          }}>
            <button
              onClick={() => {
                setCurrentPage(ROUTES.NAVIGATION);
                setTimeout(() => {
                  const el = document.querySelector('.top-ten-container');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 50);
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px #0007';
              }}
              aria-label={t.backToNavigation || 'Zurück zur Navigation'}
            >
              <svg width="32" height="32" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" fill="#23223a" stroke="#8B5CF6" strokeWidth="2" />
                <path d="M16 12H8M12 16l-4-4 4-4" />
              </svg>
            </button>
            <span style={{
              color: '#b0b0b0',
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 0.2,
              userSelect: 'none',
              textShadow: 'none',
              whiteSpace: 'nowrap',
              paddingLeft: 2,
              paddingRight: 8,
            }}>{t.backToNavigation || 'Zurück zur Navigation'}</span>
          </div>
          <h1 className="top-ten-title" style={{ fontSize: '3.5rem', marginTop: 30, textShadow: 'none', color: '#e0e0e0' }}>
            <span className="crown-icon">👑</span> Hall of Champions <span className="crown-icon">👑</span>
          </h1>
          <p className="top-ten-subtitle" style={{ fontSize: '1.5rem', marginBottom: 0, textShadow: 'none', color: '#b0b0b0' }}>Die ewigen Legenden unseres Clans – Kategorie für 10 Sekunden im Rampenlicht!</p>
          <div style={{ marginTop: 24, marginBottom: 0 }}>
            <button onClick={handleAudio} className="category-btn" style={{ fontSize: 22, padding: '12px 32px', background: audioPlaying ? '#FFD700' : '#374151', color: audioPlaying ? '#1a1f2e' : '#FFD700', border: '2px solid #FFD700', borderRadius: 16, marginRight: 12 }} disabled={!audioPlaying}>
              {'⏸️ Fanfare stoppen'}
            </button>
            <audio ref={audioRef} src={process.env.PUBLIC_URL + "/fanfare.mp3"} preload="auto" autoPlay />
          </div>
        </div>

        <div style={{ marginTop: 32, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="slot-machine-frame" style={{
            background: 'radial-gradient(circle at 50% 0%, #1a1f2e 0%, #2d1b69 60%, #0f1419 100%)',
            border: '8px solid #8B5CF6',
            borderRadius: 40,
            boxShadow: '0 0 16px 2px #2d1b69cc',
            padding: 32,
            minWidth: 600,
            maxWidth: '90vw',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 32,
            transition: 'box-shadow 0.5s',
          }}>
            <div className="slot-machine-lights" style={{
              position: 'absolute',
              top: -24,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              zIndex: 10,
              pointerEvents: 'none',
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i % 2 === 0 ? '#bfae5a' : '#6d4bb6',
                  boxShadow: 'none',
                  opacity: 0.5,
                  margin: '0 2px',
                  animation: `slotLightBlink 1.2s linear infinite`,
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))}
            </div>
            <section key={currentCategory.key} id={`podium-${currentCategory.key}`} style={{ marginBottom: 0, width: '100%', transition: 'all 0.7s cubic-bezier(.4,2,.6,1)' }}>
              <h2 className="section-title" style={{ fontSize: '2.2rem', color: currentCategory.color, textAlign: 'center', marginBottom: 16, marginTop: 32, letterSpacing: 1, textShadow: 'none' }}>{currentCategory.icon} {currentCategory.label}</h2>
              <div className="podium-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 32, minHeight: 220, transition: 'all 0.7s cubic-bezier(.4,2,.6,1)' }}>
                {top3ByCategory[currentCategory.key] && top3ByCategory[currentCategory.key].length > 0 ? (
                  top3ByCategory[currentCategory.key].map((player, idx) => {
                    // Reduziere Kronen und Glanz
                    const bg = idx === 0
                      ? 'linear-gradient(135deg, #e0c770 70%, #2d1b69 100%)'
                      : idx === 1
                      ? 'linear-gradient(135deg, #b0b0b0 70%, #23223a 100%)'
                      : 'linear-gradient(135deg, #a97a50 70%, #23223a 100%)';
                    const crown = idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉';
                    return (
                      <div key={player._aggKey + '-' + idx} className={`podium-place place-${idx + 1}`} style={{
                        background: bg,
                        borderRadius: 20,
                        boxShadow: '0 2px 4px 0 rgba(0,0,0,0.10)',
                        minWidth: 150,
                        minHeight: idx === 0 ? 170 : 120,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                        position: 'relative',
                        transform: idx === 0 ? 'scale(1.04)' : 'scale(1)',
                        zIndex: 3 - idx,
                        transition: 'all 0.7s cubic-bezier(.4,2,.6,1)'
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 4, filter: 'none' }}>{crown}</div>
                        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 2, textShadow: 'none', color: '#e0e0e0' }}>{mapToMainName(players, player.Clanmate)}</div>
                        <div style={{ fontSize: 18, color: '#bbb', fontWeight: 600, marginBottom: 4 }}>{player[currentCategory.key].toLocaleString()}</div>
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{currentCategory.label}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#aaa', fontSize: 20, textAlign: 'center', width: '100%' }}>Noch keine Daten für diese Kategorie.</div>
                )}
              </div>
            </section>
          </div>
        </div>



      <footer className="mt-auto text-gray-500 text-sm" style={{ marginTop: 64, textAlign: 'center' }}>{t.copyright}</footer>
    </div>
  );
}