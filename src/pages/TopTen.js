import React, { useState, useEffect } from 'react';
import StickyBackButton from '../components/StickyBackButton';
import { mapToMainName } from '../utils/aliasMapping';
import { getChestPoints, isIgnoredChest, fallbackCategory, fallbackLevel } from '../utils/logicZentrale';
import { translations } from '../translations/translations';
import { ROUTES } from '../routes';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './TopTen.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale, Filler);

const TopTen = ({ t, setCurrentPage }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]); // Spieler für Alias-Mapping
  const [selectedCategory, setSelectedCategory] = useState('ALL_CATEGORIES');
  const [topPlayers, setTopPlayers] = useState([]);

  // ChestMappings für Punkteberechnung
  const [chestMappings, setChestMappings] = useState([]);

  const headerStyle = { fontSize: '2.2em', fontWeight: 'bold', color: '#ff3b3b', marginBottom: '12px', letterSpacing: '2px' };

  // Spieler und ChestMappings laden (für Alias-Mapping und ggf. Punkte)
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
    fetchPlayers();
    // ChestMappings laden
    const fetchChestMappings = async () => {
      try {
        const chestMappingsSnap = await getDocs(collection(db, "chestMappings"));
        const mappings = chestMappingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChestMappings(mappings);
      } catch (e) {
        setChestMappings([]);
      }
    };
    fetchChestMappings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resultsSnap = await getDocs(collection(db, "results"));
        const resultsArr = resultsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(resultsArr);
      } catch (error) {
        console.error('[TopTen] Fehler beim Laden der Firestore-Daten:', error);
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Noch robustere Aggregation: Spielernamen werden normalisiert (trim, lowercase), nur gewählte Kategorie, Top 10
  const [allAggregatedPlayers, setAllAggregatedPlayers] = useState([]);
  useEffect(() => {
    if (data.length > 0) {
      const playerMap = new Map();
      // Kategorien wie in HallOfChampionsPage.js
      const categoriesList = [
        'Arena Total', 'Common Total', 'Rare Total', 'Epic Total', 'Tartaros Total',
        'Elven Total', 'Cursed Total', 'Bank Total', 'Runic Total', 'Heroic Total',
        'VotA Total', 'ROTA Total', 'EAs Total', 'Union Total', 'Jormungandr Total', 'ALL_CATEGORIES'
      ];
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
            ...Object.fromEntries(categoriesList.map(c => [c, 0]))
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
      // Aggregation für Statistik und Top 10 bereitstellen
      const allPlayersArr = Array.from(playerMap.values());
      setAllAggregatedPlayers(allPlayersArr);
      let aggArr = [];
      let sortKey = '';
      if (selectedCategory === 'Arena Total') {
        aggArr = allPlayersArr.filter(p => p['Arena Total'] > 0);
        sortKey = 'Arena Total';
      } else if (selectedCategory && allPlayersArr[0]?.hasOwnProperty(selectedCategory)) {
        aggArr = allPlayersArr.filter(p => p[selectedCategory] > 0);
        sortKey = selectedCategory;
      } else {
        aggArr = allPlayersArr.filter(p => p['ALL_CATEGORIES'] > 0);
        sortKey = 'ALL_CATEGORIES';
      }
      const sorted = aggArr.sort((a, b) => b[sortKey] - a[sortKey]).slice(0, 10);
      setTopPlayers(sorted);
    } else {
      setTopPlayers([]);
      setAllAggregatedPlayers([]);
    }
  }, [data, selectedCategory, players]);

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
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8
      }]
    };
  };
  
  // Chart Optionen für Bar-Chart
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F9FAFB',
          font: { size: 12 }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#F9FAFB' },
        grid: { color: '#374151' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#F9FAFB' },
        grid: { color: '#374151' }
      }
    }
  };
  
  // Chart Optionen für Doughnut-Chart
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#F9FAFB',
          font: { size: 12 }
        }
      }
    }
  };
  
  // Daten für Doughnut-Chart (Top 5)
  const getDoughnutData = () => {
    const top5 = topPlayers.slice(0, 5);
    return {
      labels: top5.map(player => mapToMainName(players, player.Clanmate)),
      datasets: [{
        data: top5.map(player => player[selectedCategory]),
        backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#8B5CF6', '#3B82F6'],
        borderColor: '#1F2937',
        borderWidth: 2
      }]
    };
  };
  
  // Daten für Radar-Chart (Multi-Kategorie Vergleich Top 5)
  const getRadarData = () => {
    const top5 = topPlayers.slice(0, 5);
    const radarLabels = categories.map(cat => cat.label);
    return {
      labels: radarLabels,
      datasets: top5.map((player, idx) => ({
        label: mapToMainName(players, player.Clanmate),
        data: categories.map(cat => player[cat.key] || 0),
        backgroundColor: `rgba(56, 189, 248, 0.2)`,
        borderColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#8B5CF6', '#3B82F6'][idx] || '#6B7280',
        borderWidth: 2
      }))
    };
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

  // Verbesserte Statistik-Berechnung auf Basis der Aggregation
  const getStatistics = () => {
    const relevantPlayers = allAggregatedPlayers.filter(player => player[selectedCategory] > 0);
    const totalPlayers = relevantPlayers.length;
    const totalChests = relevantPlayers.reduce((sum, player) => sum + (player[selectedCategory] || 0), 0);
    const averageChests = totalPlayers > 0 ? Math.round(totalChests / totalPlayers) : 0;
    const topScore = topPlayers.length > 0 ? topPlayers[0][selectedCategory] : 0;
    const activePlayersCount = totalPlayers;
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
    <div className="top-ten-container" style={{ minHeight: '100vh', position: 'relative' }}>
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
      <div style={headerStyle}></div>
      <div className="top-ten-header">
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
