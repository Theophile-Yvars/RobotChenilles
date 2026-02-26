import React, { useEffect, useState, useCallback } from "react";
import "../styles/Command.css";

function Command({ onCommand, isConnected }) {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [activeButtons, setActiveButtons] = useState(new Set());
  const [lastCommandTime, setLastCommandTime] = useState(Date.now());

  const sendCommand = useCallback((endpoint, method = "POST") => {
    if (!isConnected) {
      console.warn('Robot non connecté');
      return;
    }
    
    fetch(`http://192.168.1.127:5000/${endpoint}`, { method })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur: ${res.status}`);
        setLastCommandTime(Date.now());
        // Extraire le nom de la commande pour les stats
        const commandName = endpoint.includes('/move/') ? endpoint.split('/')[1] : endpoint;
        onCommand && onCommand(commandName);
      })
      .catch((err) => console.error(err));
  }, [isConnected, onCommand]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "a", "q"].includes(key)) {
        e.preventDefault();
        setPressedKeys((prevKeys) => new Set(prevKeys).add(key));
      }
    };
    const handleKeyUp = (e) => {
      const { key } = e;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "a", "q"].includes(key)) {
        setPressedKeys((prevKeys) => {
          const newKeys = new Set(prevKeys);
          newKeys.delete(key);
          return newKeys;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);


  // Gestion des contrôles tactiles
  const handleButtonPress = (command) => {
    setActiveButtons(prev => new Set(prev).add(command));
    if (command === 'cam_up' || command === 'cam_down') {
      sendCommand(command, 'GET');
    } else {
      sendCommand(`move/${command}`);
    }
  };

  const handleButtonRelease = (command) => {
    setActiveButtons(prev => {
      const newSet = new Set(prev);
      newSet.delete(command);
      return newSet;
    });
    if (command !== 'cam_up' && command !== 'cam_down') {
      sendCommand('move/stop');
    }
  };

  useEffect(() => {
    if (pressedKeys.size === 0) {
      sendCommand("move/stop");
      return;
    }

    const keyToCommand = {
      ArrowUp: "forward",
      ArrowDown: "backward",
      ArrowLeft: "left",
      ArrowRight: "right",
      a: "cam_up",
      q: "cam_down",
    };

    pressedKeys.forEach((key) => {
      const command = keyToCommand[key];
      if (command) {
        sendCommand(
          command === "cam_up" || command === "cam_down" ? command : `move/${command}`,
          command === "cam_up" || command === "cam_down" ? "GET" : "POST"
        );
      }
    });
  }, [pressedKeys, sendCommand]);

  return (
    <div className="command-control">
      <div className="control-header">
        <h3>Contrôles</h3>
        <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          <div className={`status-dot ${isConnected ? 'green' : 'red'}`}></div>
        </div>
      </div>

      {/* Contrôles de mouvement */}
      <div className="movement-controls">
        <h4>Déplacement</h4>
        <div className="control-grid">
          <div></div>
          <button 
            className={`control-btn ${pressedKeys.has('ArrowUp') || activeButtons.has('forward') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onMouseDown={() => handleButtonPress('forward')}
            onMouseUp={() => handleButtonRelease('forward')}
            onMouseLeave={() => handleButtonRelease('forward')}
            onTouchStart={() => handleButtonPress('forward')}
            onTouchEnd={() => handleButtonRelease('forward')}
            disabled={!isConnected}
          >
            <span className="btn-icon">⬆️</span>
            <span className="btn-label">Avant</span>
            <span className="btn-key">↑</span>
          </button>
          <div></div>
          
          <button 
            className={`control-btn ${pressedKeys.has('ArrowLeft') || activeButtons.has('left') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onMouseDown={() => handleButtonPress('left')}
            onMouseUp={() => handleButtonRelease('left')}
            onMouseLeave={() => handleButtonRelease('left')}
            onTouchStart={() => handleButtonPress('left')}
            onTouchEnd={() => handleButtonRelease('left')}
            disabled={!isConnected}
          >
            <span className="btn-icon">⬅️</span>
            <span className="btn-label">Gauche</span>
            <span className="btn-key">←</span>
          </button>
          
          <button 
            className={`control-btn stop-btn ${!isConnected ? 'disabled' : ''}`}
            onClick={() => sendCommand('move/stop')}
            disabled={!isConnected}
          >
            <span className="btn-icon">⏹️</span>
            <span className="btn-label">Stop</span>
          </button>
          
          <button 
            className={`control-btn ${pressedKeys.has('ArrowRight') || activeButtons.has('right') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onMouseDown={() => handleButtonPress('right')}
            onMouseUp={() => handleButtonRelease('right')}
            onMouseLeave={() => handleButtonRelease('right')}
            onTouchStart={() => handleButtonPress('right')}
            onTouchEnd={() => handleButtonRelease('right')}
            disabled={!isConnected}
          >
            <span className="btn-icon">➡️</span>
            <span className="btn-label">Droite</span>
            <span className="btn-key">→</span>
          </button>
          
          <div></div>
          <button 
            className={`control-btn ${pressedKeys.has('ArrowDown') || activeButtons.has('backward') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onMouseDown={() => handleButtonPress('backward')}
            onMouseUp={() => handleButtonRelease('backward')}
            onMouseLeave={() => handleButtonRelease('backward')}
            onTouchStart={() => handleButtonPress('backward')}
            onTouchEnd={() => handleButtonRelease('backward')}
            disabled={!isConnected}
          >
            <span className="btn-icon">⬇️</span>
            <span className="btn-label">Arrière</span>
            <span className="btn-key">↓</span>
          </button>
          <div></div>
        </div>
      </div>

      {/* Contrôles de caméra */}
      <div className="camera-controls">
        <h4>Caméra</h4>
        <div className="camera-buttons">
          <button 
            className={`control-btn camera-btn ${pressedKeys.has('a') || activeButtons.has('cam_up') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onClick={() => sendCommand('cam_up', 'GET')}
            disabled={!isConnected}
          >
            <span className="btn-icon">📹⬆️</span>
            <span className="btn-label">Haut</span>
            <span className="btn-key">A</span>
          </button>
          
          <button 
            className={`control-btn camera-btn ${pressedKeys.has('q') || activeButtons.has('cam_down') ? 'active' : ''} ${!isConnected ? 'disabled' : ''}`}
            onClick={() => sendCommand('cam_down', 'GET')}
            disabled={!isConnected}
          >
            <span className="btn-icon">📹⬇️</span>
            <span className="btn-label">Bas</span>
            <span className="btn-key">Q</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="control-instructions">
        <p className="keyboard-instruction">
          <strong>Clavier :</strong> Flèches directionnelles + A/Q<br/>
          <strong>Tactile :</strong> Utilisez les boutons ci-dessus
        </p>
        <div className="last-command">
          <small>Dernière commande : {new Date(lastCommandTime).toLocaleTimeString()}</small>
        </div>
      </div>
    </div>
  );
}

export default Command;
