import React, { useState, useEffect } from 'react';
import { translations } from '../translations/translations';
import { ROUTES } from '../routes';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import Papa from 'papaparse';
import './TopTen.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale);

const TopTen = ({ t, setCurrentPage }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Arena Total');
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/json-data/chest_aggregation_preview.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const processedData = results.data.map(row => ({
              ...row,
              // Konvertiere alle numerischen Werte entsprechend der CSV-Struktur
              'Arena Total': parseInt(row['Arena Total']) || 0,
              'Common Total': parseInt(row['Common Total']) || 0,
              'Rare Total': parseInt(row['Rare Total']) || 0,
              'Epic Total': parseInt(row['Epic Total']) || 0,
              'Tartaros Total': parseInt(row['Tartaros Total']) || 0,
              'Elven Total': parseInt(row['Elven Total']) || 0,
              'Cursed Total': parseInt(row['Cursed Total']) || 0,
              'Bank Total': parseInt(row['Bank Total']) || 0,
              'Runic Total': parseInt(row['Runic Total']) || 0,
              'Heroic Total': parseInt(row['Heroic Total']) || 0,
              'VotA Total': parseInt(row['VotA Total']) || 0,
              'ROTA Total': parseInt(row['ROTA Total']) || 0,
              'EAs Total': parseInt(row['EAs Total']) || 0,
              'Union Total': parseInt(row['Union Total']) || 0,
              'Jormungandr Total': parseInt(row['Jormungandr Total']) || 0,
              'Points': parseInt(row['Points']) || 0,
            }));
            
            setData(processedData);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const sortedData = [...data]
        .filter(player => player.Clanmate && player.Clanmate.trim() !== '')
        .sort((a, b) => b[selectedCategory] - a[selectedCategory])
        .slice(0, 10);
      setTopPlayers(sortedData);
    }
  }, [data, selectedCategory]);

  // Kategorien mit Routing-Information
  const categories = [
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
      labels: topPlayers.map(player => player.Clanmate),
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
      labels: top5.map(player => player.Clanmate),
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
        label: player.Clanmate,
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
          {categories.map(category => (
            <button
              key={category.key}
              className={`category-btn ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => setCurrentPage(category.route)}
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
            <div key={player.Clanmate} className={`podium-place place-${index + 1}`}>
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
              <div key={player.Clanmate} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
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
