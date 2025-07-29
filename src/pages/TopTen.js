
import React, { useState, useEffect } from 'react';
import { mapToMainName } from '../utils/aliasMapping';
import { translations } from '../translations/translations';
import { ROUTES } from '../routes';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './TopTen.css';

// --- Tartaros-Logik aus CurrentTotalEventPage.js ---
function tartarosLevelFromChest(chest) {
  // Level explizit aus Name, Type oder Source extrahieren
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler);

const TopTen = ({ t, setCurrentPage }) => {
  const [data, setData] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPeriodId, setCurrentPeriodId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]); // Spieler für Alias-Mapping
  const [ignoreChests, setIgnoreChests] = useState([]); // Ignore-Liste aus Firestore
  // Startseite zeigt Gesamtsumme aller Kategorien
  const [selectedCategory, setSelectedCategory] = useState('ALL_CATEGORIES');
  const [topPlayers, setTopPlayers] = useState([]);

  const headerStyle = { fontSize: '2.2em', fontWeight: 'bold', color: '#ff3b3b', marginBottom: '12px', letterSpacing: '2px' };

  // Spieler laden (für Alias-Mapping)
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersSnap = await getDocs(collection(db, "players"));
        const list = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlayers(list);
      } catch (e) {
        setPlayers([]);
      }
    };
    // Ignore-Liste aus Firestore laden
    const fetchIgnoreList = async () => {
      try {
        const ignoreSnap = await getDocs(collection(db, "chestMappingIgnore"));
        const ignoreList = ignoreSnap.docs.map(doc => doc.data());
        setIgnoreChests(ignoreList);
      } catch (e) {
        setIgnoreChests([]);
      }
    };
    fetchPlayers();
    fetchIgnoreList();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lade alle Perioden
        const periodsSnap = await getDocs(collection(db, "periods"));
        const periodsArr = periodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPeriods(periodsArr);
        // Bestimme aktuelle Periode (wie in CurrentTotalEventPage.js)
        let now = new Date();
        let currentPeriod = null;
        let periodId = null;
        for (const p of periodsArr) {
          if (p.start && new Date(p.start) <= now && (!p.end || new Date(p.end) >= now)) {
            currentPeriod = p;
            periodId = p.id;
            break;
          }
        }
        if (!currentPeriod && periodsArr.length > 0) {
          currentPeriod = periodsArr.reduce((a, b) => (!a.start || (b.start && new Date(b.start) > new Date(a.start))) ? b : a);
          periodId = currentPeriod.id;
        }
        setCurrentPeriodId(periodId);
        // Lade alle Ergebnisse
        const resultsSnap = await getDocs(collection(db, "results"));
        const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filtere auf aktuelle Periode
        const filteredResults = resultsArr.filter(r => r.periodId === periodId);
        setData(filteredResults);
      } catch (error) {
        console.error('[TopTen] Fehler beim Laden der Firestore-Daten:', error);
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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

  // Noch robustere Aggregation: Spielernamen werden normalisiert (trim, lowercase), nur gewählte Kategorie, Top 10
  useEffect(() => {
    if (data.length > 0) {
      const playerMap = new Map();
      data.forEach(row => {
        if (!row.Clanmate || row.Clanmate.trim() === '') return;
        // Hauptnamen-Mapping anwenden
        const mainName = mapToMainName(players, row.Clanmate);
        const key = (row.playerId && String(row.playerId).trim() !== '')
          ? String(row.playerId).trim()
          : (mainName || '').trim().normalize('NFKC').toLowerCase();
        // Initialisiere alle Kategorien
        if (!playerMap.has(key)) {
          playerMap.set(key, {
            Clanmate: mainName,
            _aggKey: key,
            'Arena Total': 0,
            'Common Total': 0,
            'Rare Total': 0,
            'Epic Total': 0,
            'Tartaros Total': 0,
            'Elven Total': 0,
            'Cursed Total': 0,
            'Bank Total': 0,
            'Runic Total': 0,
            'Heroic Total': 0,
            'VotA Total': 0,
            'ROTA Total': 0,
            'EAs Total': 0,
            'Union Total': 0,
            'Jormungandr Total': 0,
            'ALL_CATEGORIES': 0
          });
        }
        const entry = playerMap.get(key);
        if (Array.isArray(row.chests)) {
          row.chests.filter(chest => !isIgnoredChest(chest)).forEach(chest => {
            let cat = '';
            const name = (chest.Name || '').toLowerCase();
            const type = (chest.Type || chest.Kategorie || chest.Category || '').toLowerCase();
            const source = (chest.Source || '').toLowerCase();
            // Heroic nur wenn Kategorie/Type/Category 'heroic monster' enthält
            if (type.includes('heroic monster')) {
              cat = 'Heroic Total';
            } else {
              // Elven und Cursed können gemeinsam gezählt werden
              let counted = false;
              if (name.includes('elven citadel chest')) {
                cat = 'Elven Total';
                if (cat && entry.hasOwnProperty(cat)) {
                  entry[cat] += Number(chest.count || 1);
                  entry['ALL_CATEGORIES'] += Number(chest.count || 1);
                  counted = true;
                }
              }
              if (name.includes('cursed citadel chest')) {
                cat = 'Cursed Total';
                if (cat && entry.hasOwnProperty(cat)) {
                  entry[cat] += Number(chest.count || 1);
                  entry['ALL_CATEGORIES'] += Number(chest.count || 1);
                  counted = true;
                }
              }
              // Wenn weder Elven noch Cursed, dann andere Kategorien prüfen
              if (!counted) {
                if (type.includes('arena') || source.includes('arena') || name.includes('arena')) cat = 'Arena Total';
                else if (name.includes('orc') || type.includes('common crypt')) cat = 'Common Total';
                else if (name.includes('rare dragon') || type.includes('rare crypt')) cat = 'Rare Total';
                else if ((name.includes('epic') && !name.includes('ancient squad')) || type.includes('epic') || name.includes('undead')) cat = 'Epic Total';
                else if (name.includes('tartaros') || type.includes('tartaros')) cat = 'Tartaros Total';
                else if (name.includes('bank') || type.includes('bank') || source.includes('bank')) cat = 'Bank Total';
                else if (name.includes('jormungandr') || type.includes('jormungandr') || source.includes('jormungandr')) cat = 'Jormungandr Total';
                else if (name.includes('runic') || type.includes('runic') || source.includes('runic')) cat = 'Runic Total';
                else if (name.includes('vault') || type.includes('vault') || source.includes('vault')) cat = 'VotA Total';
                else if (name.includes('rota') || type.includes('rota') || source.includes('rota')) cat = 'ROTA Total';
                else if (name.includes('epic ancient squad') || type.includes('epic ancient squad') || source.includes('epic ancient squad')) cat = 'EAs Total';
                else if (name.includes('union total') || type.includes('union total') || source.includes('union total')) cat = 'Union Total';
                if (cat && entry.hasOwnProperty(cat)) {
                  entry[cat] += Number(chest.count || 1);
                  entry['ALL_CATEGORIES'] += Number(chest.count || 1);
                }
              }
            }
            if (cat === 'Heroic Total' && entry.hasOwnProperty(cat)) {
              entry[cat] += Number(chest.count || 1);
              entry['ALL_CATEGORIES'] += Number(chest.count || 1);
            }
          });
        }
      });
      let aggArr = [];
      let sortKey = '';
      if (selectedCategory === 'Arena Total') {
        // Nur Arena-Truhen anzeigen
        aggArr = Array.from(playerMap.values()).filter(p => p['Arena Total'] > 0);
        sortKey = 'Arena Total';
      } else if (selectedCategory && playerMap.values().next().value?.hasOwnProperty(selectedCategory)) {
        // Einzelkategorie
        aggArr = Array.from(playerMap.values()).filter(p => p[selectedCategory] > 0);
        sortKey = selectedCategory;
      } else {
        // Startseite: Summe aller Kategorien
        aggArr = Array.from(playerMap.values()).filter(p => p['ALL_CATEGORIES'] > 0);
        sortKey = 'ALL_CATEGORIES';
      }
      const sorted = aggArr.sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 10);
      setTopPlayers(sorted);
    } else {
      setTopPlayers([]);
    }
  }, [data, selectedCategory, ignoreChests]);

  // Kategorien mit Routing-Information
  const categories = [
    { key: 'ALL_CATEGORIES', label: 'Alle Chests', icon: '🌈', color: '#FFD700', route: ROUTES.TOP_TEN },
    { key: 'Arena Total', label: 'Arena Chests', icon: '⚔️', color: '#7C3AED', route: ROUTES.TOP_TEN_ARENA },
    { key: 'Common Total', label: 'Common Chests', icon: '📦', color: '#10B981', route: ROUTES.TOP_TEN_COMMON },
    { key: 'Rare Total', label: 'Rare Chests', icon: '💎', color: '#3B82F6', route: ROUTES.TOP_TEN_RARE },
    { key: 'Epic Total', label: 'Epic Chests', icon: '👑', color: '#8B5CF6', route: ROUTES.TOP_TEN_EPIC },
    { key: 'Tartaros Total', label: 'Tartaros Chests', icon: '🔥', color: '#DC2626', route: ROUTES.TOP_TEN_TARTAROS },
    { key: 'Elven Total', label: 'Elven Chests', icon: '🧝', color: '#059669', route: ROUTES.TOP_TEN_ELVEN },
    { key: 'Cursed Total', label: 'Cursed Chests', icon: '🌙', color: '#6B46C1', route: ROUTES.TOP_TEN_CURSED },
    { key: 'Bank Total', label: 'Bank Chests', icon: '💰', color: '#D97706', route: ROUTES.TOP_TEN_BANK },
    { key: 'Runic Total', label: 'Runic Chests', icon: '🔮', color: '#F97316', route: ROUTES.TOP_TEN_RUNIC },
    { key: 'Heroic Total', label: 'Heroic Chests', icon: '🏆', color: '#EF4444', route: ROUTES.TOP_TEN_HEROIC },
    { key: 'VotA Total', label: 'Vault of the Ancients', icon: '🏛️', color: '#8B5CF6', route: ROUTES.TOP_TEN_VOTA },
    { key: 'ROTA Total', label: 'Rise of the Ancients', icon: '🌟', color: '#EC4899', route: ROUTES.TOP_TEN_ROTA },
    { key: 'EAs Total', label: 'Epic Ancient Squad', icon: '⚡', color: '#F59E0B', route: ROUTES.TOP_TEN_EAS },
    { key: 'Union Total', label: 'Union Chests', icon: '🤝', color: '#6366F1', route: ROUTES.TOP_TEN_UNION },
    { key: 'Jormungandr Total', label: 'Jormungandr Chests', icon: '🐉', color: '#059669', route: ROUTES.TOP_TEN_JORMUNGANDR },
  ];

  const getBarChartData = () => {
    const categoryInfo = categories.find(cat => cat.key === selectedCategory);
    const label = categoryInfo ? `${categoryInfo.label} (Anzahl Chests)` : selectedCategory;
    return {
      labels: topPlayers.map((player, idx) => `${mapToMainName(players, player.Clanmate)} (${player[selectedCategory]}) [${selectedCategory}] #${idx + 1}`),
      datasets: [{
        label: label,
        data: topPlayers.map(player => player[selectedCategory]),
        backgroundColor: topPlayers.map((_, index) => {
          const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#059669'];
          return colors[index] || '#6B7280';
        }),
        borderColor: '#1F2937',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  const getDoughnutData = () => {
    const top5 = topPlayers.slice(0, 5);
    const categoryInfo = categories.find(cat => cat.key === selectedCategory);
    const label = categoryInfo ? `${categoryInfo.label} (Anzahl Chests)` : selectedCategory;
    return {
      labels: top5.map((player, idx) => `${mapToMainName(players, player.Clanmate)} (${player[selectedCategory]}) [${selectedCategory}] #${idx + 1}`),
      datasets: [{
        label: label,
        data: top5.map(player => player[selectedCategory]),
        backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#8B5CF6', '#3B82F6'],
        borderColor: '#1F2937',
        borderWidth: 3,
        hoverOffset: 10
      }]
    };
  };

  const getRadarData = () => {
    const top5 = topPlayers.slice(0, 5);
    const radarCategories = ['VotA Total', 'Heroic Total', 'Common Total', 'Rare Total', 'Epic Total', 'Runic Total'];
    return {
      labels: radarCategories.map(cat => categories.find(c => c.key === cat)?.label || cat),
      datasets: top5.map((player, index) => ({
        label: `${mapToMainName(players, player.Clanmate)} (${player[selectedCategory]}) [${selectedCategory}] #${index + 1}`,
        data: radarCategories.map(cat => player[cat] || 0),
        backgroundColor: [`#FFD700`, `#C0C0C0`, `#CD7F32`, `#8B5CF6`, `#3B82F6`][index] + '40',
        borderColor: [`#FFD700`, `#C0C0C0`, `#CD7F32`, `#8B5CF6`, `#3B82F6`][index],
        borderWidth: 2,
        pointBackgroundColor: [`#FFD700`, `#C0C0C0`, `#CD7F32`, `#8B5CF6`, `#3B82F6`][index],
        pointBorderColor: '#1F2937',
        pointHoverBackgroundColor: '#1F2937',
        pointHoverBorderColor: [`#FFD700`, `#C0C0C0`, `#CD7F32`, `#8B5CF6`, `#3B82F6`][index]
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F9FAFB',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45
        },
        grid: {
          color: '#374151'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#F9FAFB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8
      }
    }
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F9FAFB',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151'
        },
        pointLabels: {
          color: '#F9FAFB',
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Verbesserte Statistik-Berechnung mit echten Daten
  const getStatistics = () => {
    const totalPlayers = data.filter(player => player.Clanmate && player.Clanmate.trim() !== '').length;
    const totalChests = data.reduce((sum, player) => sum + (player[selectedCategory] || 0), 0);
    const averageChests = totalPlayers > 0 ? Math.round(totalChests / totalPlayers) : 0;
    const topScore = topPlayers.length > 0 ? topPlayers[0][selectedCategory] : 0;
    const activePlayersCount = data.filter(player => 
      player.Clanmate && player.Clanmate.trim() !== '' && player[selectedCategory] > 0
    ).length;
    
    return {
      totalPlayers,
      totalChests,
      averageChests,
      topScore,
      activePlayersCount
    };
  };

  const stats = getStatistics();

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

  return (
    <div className="top-ten-container">
      <div style={headerStyle}></div>
      <div className="top-ten-header">
        <button
          onClick={() => setCurrentPage(ROUTES.NAVIGATION)}
          className="back-button"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
            color: '#F9FAFB',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4B5563 100%)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #1F2937 0%, #374151 100%)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.backToNavigation || 'Zurück zur Navigation'}
        </button>
        <h1 className="top-ten-title">
          <span className="crown-icon">👑</span>
          {t.topTenTitle}
          <span className="crown-icon">👑</span>
        </h1>
        <p className="top-ten-subtitle">Die Champions unseres Clans - Wähle eine Kategorie für detaillierte Auswertungen</p>
      </div>

      <div className="category-selector">
        <h3>Wähle eine Kategorie für detaillierte Auswertung:</h3>
        <div className="category-grid">
          {categories.map((category, idx) => (
            <button
              key={category.key + '-' + idx + '-' + (category.label || '')}
              className={`category-btn ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.key)}
              style={{ '--category-color': category.color }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="podium-section">
        <h2 className="section-title">🏆 Aktuelles Podium - {categories.find(cat => cat.key === selectedCategory)?.label}</h2>
        <div className="podium">
          {topPlayers.slice(0, 3).map((player, index) => (
            <div key={`${player._aggKey}-podium`} className={`podium-place place-${index + 1}`}>
              <div className="podium-medal">
                {index === 0 && <span className="medal gold">🥇</span>}
                {index === 1 && <span className="medal silver">🥈</span>}
                {index === 2 && <span className="medal bronze">🥉</span>}
              </div>
              <div className="podium-player">
                <div className="player-name">{player.Clanmate}</div>
                <div className="player-score">{player[selectedCategory].toLocaleString()}</div>
                <div className="player-category">{categories.find(cat => cat.key === selectedCategory)?.label}</div>
              </div>
              <div className="podium-base">
                <div className="podium-rank">{index + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">📊 Aktuelle Rangliste</h3>
          <div className="chart-wrapper">
            <Bar data={getBarChartData()} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">🍩 Top 5 Verteilung</h3>
          <div className="chart-wrapper">
            <Doughnut data={getDoughnutData()} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-container full-width">
          <h3 className="chart-title">🎯 Multi-Kategorie Vergleich (Top 5)</h3>
          <div className="chart-wrapper">
            <Radar data={getRadarData()} options={radarOptions} />
          </div>
        </div>
      </div>

      <div className="detailed-ranking">
        <h2 className="section-title">📋 Aktuelle Rangliste - {categories.find(cat => cat.key === selectedCategory)?.label}</h2>
        <div className="ranking-table">
          <div className="table-header">
            <div className="rank-col">Rang</div>
            <div className="player-col">Spieler</div>
            <div className="score-col">Wert</div>
            <div className="progress-col">Fortschritt</div>
          </div>
          {topPlayers.map((player, index) => {
            const maxScore = Math.max(...topPlayers.map(p => p[selectedCategory]));
            const percentage = (player[selectedCategory] / maxScore) * 100;
            return (
              <div key={`${player._aggKey}-table`} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                <div className="rank-col">
                  <span className="rank-number">{index + 1}</span>
                  {index < 3 && (
                    <span className="rank-medal">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </span>
                  )}
                </div>
                <div className="player-col">
                  <div className="player-info">
                    <div className="player-name">{player.Clanmate}</div>
                    <div className="player-badge">{categories.find(cat => cat.key === selectedCategory)?.icon}</div>
                  </div>
                </div>
                <div className="score-col">
                  <span className="score-value">{player[selectedCategory].toLocaleString()}</span>
                </div>
                <div className="progress-col">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="stats-overview">
        <h2 className="section-title">📈 Aktuelle Statistik-Übersicht</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.activePlayersCount}</div>
            <div className="stat-label">Aktive Spieler</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{stats.topScore.toLocaleString()}</div>
            <div className="stat-label">Höchster Wert</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.averageChests.toLocaleString()}</div>
            <div className="stat-label">Durchschnitt</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.totalChests.toLocaleString()}</div>
            <div className="stat-label">Gesamtsumme</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTen;
