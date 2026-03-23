import React from 'react';
import '../styles/RobotStats.css';

function RobotStats({ stats }) {
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getCommandIcon = (command) => {
    switch(command) {
      case 'forward': return '⬆️';
      case 'backward': return '⬇️';
      case 'left': return '⬅️';
      case 'right': return '➡️';
      case 'cam_up': return '📹⬆️';
      case 'cam_down': return '📹⬇️';
      default: return '⏸️';
    }
  };

  const getCommandLabel = (command) => {
    switch(command) {
      case 'forward': return 'Avant';
      case 'backward': return 'Arrière';
      case 'left': return 'Gauche';
      case 'right': return 'Droite';
      case 'cam_up': return 'Caméra ↑';
      case 'cam_down': return 'Caméra ↓';
      default: return 'Arrêt';
    }
  };

  return (
    <div className="robot-stats-card">
      <div className="stats-header">
        <h3>Statistiques</h3>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <span className="stat-label">Uptime  :  </span>
            <span className="stat-value">{formatUptime(stats.uptime)}</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">🎮</div>
          <div className="stat-content">
            <span className="stat-label">Commandes  :  </span>
            <span className="stat-value">{stats.commandCount}</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">{getCommandIcon(stats.lastCommand)}</div>
          <div className="stat-content">
            <span className="stat-label">Dernière action  :  </span>
            <span className="stat-value">{getCommandLabel(stats.lastCommand)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RobotStats;