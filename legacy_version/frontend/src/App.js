import React, { useState, useEffect } from "react";
import "./App.css";
import Camera from "./components/Camera";
import Temperature from "./components/Temperature";
import Command from "./components/Command";
import ConnectionStatus from "./components/ConnectionStatus";
import RobotStats from "./components/RobotStats";
import Header from "./components/Header";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [robotStats, setRobotStats] = useState({
    lastCommand: 'stop',
    commandCount: 0,
    uptime: 0
  });

  // Test de connexion au backend
  useEffect(() => {
    const testConnection = () => {
      fetch('http://192.168.1.127:5000/temperature')
        .then(response => {
          setIsConnected(response.ok);
        })
        .catch(() => {
          setIsConnected(false);
        });
    };

    testConnection();
    const interval = setInterval(testConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compteur d'uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = (command) => {
    setRobotStats(prev => ({
      ...prev,
      lastCommand: command,
      commandCount: prev.commandCount + 1
    }));
  };

  return (
    <div className="App">
      <Header />
      <ConnectionStatus isConnected={isConnected} />
      
      <main className="main-content">
        <div className="dashboard-grid">
          <div className="video-panel">
            <Camera />
          </div>
          
          <div className="control-panel">
            <div className="stats-section">
              <Temperature />
              <RobotStats stats={robotStats} />
            </div>
            
            <div className="command-section">
              <Command onCommand={updateStats} isConnected={isConnected} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
