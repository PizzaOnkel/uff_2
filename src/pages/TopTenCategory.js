import React, { useState, useEffect } from 'react';
import { translations } from '../translations/translations';
import { ROUTES } from '../routes';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import Papa from 'papaparse';
import './TopTen.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, RadialLinearScale);

const TopTenCategory = ({ t, setCurrentPage, category, categoryInfo }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

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
            
            // Filtere nur gültige Spieler
            const validPlayers = processedData.filter(player => 
              player.Clanmate && player.Clanmate.trim() !== '' && player[category] > 0
            );
            
            // Sortiere nach der gewählten Kategorie
            const sortedData = [...validPlayers].sort((a, b) => b[category] - a[category]);
            
            setData(processedData);
            setAllPlayers(sortedData);
            setTopPlayers(sortedData.slice(0, 10));
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const getBarChartData = () => {
    return {
      labels: topPlayers.map(player => player.Clanmate),
      datasets: [{
        label: `${categoryInfo.label} (Anzahl Chests)`,
        data: topPlayers.map(player => player[category]),
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
    
    return {
      labels: top5.map(player => player.Clanmate),
      datasets: [{
        label: `${categoryInfo.label} (Anzahl Chests)`,
        data: top5.map(player => player[category]),
        backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#8B5CF6', '#3B82F6'],
        borderColor: '#1F2937',
        borderWidth: 3,
        hoverOffset: 10
      }]
    };
  };

  const getLineChartData = () => {
    // Zeige Progression über die Top 20 (falls vorhanden)
    const top20 = topPlayers.slice(0, 20);
    
    return {
      labels: top20.map((_, index) => `Rang ${index + 1}`),
      datasets: [{
        label: `${categoryInfo.label} Progression`,
        data: top20.map(player => player[category]),
        borderColor: categoryInfo.color,
        backgroundColor: categoryInfo.color + '20',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: categoryInfo.color,
        pointBorderColor: '#1F2937',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
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

  const lineOptions = {
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
        cornerRadius: 8
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
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151'
        }
      }
    }
  };

  // Berechne Statistiken
  const getStatistics = () => {
    const totalPlayers = allPlayers.length;
    const totalChests = allPlayers.reduce((sum, player) => sum + player[category], 0);
    const averageChests = totalPlayers > 0 ? Math.round(totalChests / totalPlayers) : 0;
    const topScore = topPlayers.length > 0 ? topPlayers[0][category] : 0;
    const activePlayersCount = allPlayers.filter(player => player[category] > 0).length;
    
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
          onClick={() => setCurrentPage(ROUTES.TOP_TEN)}
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
          Zurück zur Übersicht
        </button>
        <h1 className="top-ten-title" style={{ color: categoryInfo.color }}>
          <span className="crown-icon">{categoryInfo.icon}</span>
          Top 10 - {categoryInfo.label}
          <span className="crown-icon">{categoryInfo.icon}</span>
        </h1>
        <p className="top-ten-subtitle">Die besten Spieler in der Kategorie {categoryInfo.label} - sortiert nach Anzahl der Chests</p>
      </div>

      <div className="podium-section">
        <h2 className="section-title">🏆 Das Podium</h2>
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
                <div className="player-score">{player[category].toLocaleString()}</div>
                <div className="player-category">{categoryInfo.label}</div>
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
          <h3 className="chart-title">📊 Top 10 Rangliste</h3>
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
          <h3 className="chart-title">📈 Leistungskurve (Top 20)</h3>
          <div className="chart-wrapper">
            <Line data={getLineChartData()} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="detailed-ranking">
        <h2 className="section-title">📋 Komplette Rangliste</h2>
        <div className="ranking-table">
          <div className="table-header">
            <div className="rank-col">Rang</div>
            <div className="player-col">Spieler</div>
            <div className="score-col">Chests</div>
            <div className="progress-col">Anteil</div>
          </div>
          {allPlayers.map((player, index) => {
            const maxScore = Math.max(...allPlayers.map(p => p[category]));
            const percentage = maxScore > 0 ? (player[category] / maxScore) * 100 : 0;
            
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
                    <div className="player-badge">{categoryInfo.icon}</div>
                  </div>
                </div>
                <div className="score-col">
                  <span className="score-value">{player[category].toLocaleString()}</span>
                </div>
                <div className="progress-col">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%`, backgroundColor: categoryInfo.color }}
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
        <h2 className="section-title">📈 Statistik-Übersicht</h2>
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

export default TopTenCategory;
