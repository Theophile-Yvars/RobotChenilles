import React, { useState } from "react";
import "./App.css";
// On garde tes composants de structure
import Header from "./components/Header";
import Camera from "./components/Camera";
import RobotStats from "./components/RobotStats";
// On utilise le nouveau Dashboard qui gère la logique ROS 2
import RobotDashboard from "./components/RobotDashboard";

function App() {
  // On garde un état pour les stats (optionnel, selon tes besoins)
  const [robotStats, setRobotStats] = useState({
    lastCommand: 'Arrêt',
    commandCount: 0,
    uptime: 0
  });

  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        <div className="dashboard-grid">
          
          {/* Colonne Gauche : Vision et Stats */}
          <div className="video-panel">
            <Camera />
            <div className="stats-section" style={{marginTop: '20px'}}>
               <RobotStats stats={robotStats} />
            </div>
          </div>
          
          {/* Colonne Droite : Contrôles et Température */}
          <div className="control-panel">
            <div className="command-section">
              <RobotDashboard />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;