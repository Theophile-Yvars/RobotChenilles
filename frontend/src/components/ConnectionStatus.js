import React from 'react';
import '../styles/ConnectionStatus.css';

function ConnectionStatus({ isConnected }) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="connection-indicator">
        <div className={`status-dot ${isConnected ? 'green' : 'red'}`}></div>
        <span className="status-text">
          {isConnected ? 'Connecté au robot' : 'Connexion perdue'}
        </span>
      </div>
      {!isConnected && (
        <div className="connection-warning">
          <span>⚠️ Vérifiez que le robot est allumé et connecté au réseau</span>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;