import React from 'react';
import './App.css';
import Header from './components/Header';
import RobotDashboard from './components/RobotDashboard';

function App() {
  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        {/* On affiche uniquement le Dashboard car il contient déjà 
            la vidéo, les contrôles et les statistiques intégrées */}
        <RobotDashboard />
      </main>
    </div>
  );
}

export default App;