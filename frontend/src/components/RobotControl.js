import React, { useEffect, useState } from "react";
import "../styles/RobotControl.css";

function RobotControl() {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [activeButtons, setActiveButtons] = useState([]);
  const [temperature, setTemperature] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Envoie une commande au backend Flask
  const sendCommand = (endpoint, method = "POST") => {
    fetch(`http://192.168.1.127:5000/${endpoint}`, { method })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur: ${res.status}`);
      })
      .catch((err) => console.error(err));
  };

  // Récupère la température depuis le backend
  useEffect(() => {
    const fetchTemperature = () => {
      setIsLoading(true);
      fetch("http://192.168.1.127:5000/temperature")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setTemperature(data);
            setError(null);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Erreur de connexion au capteur");
          setIsLoading(false);
          console.error(err);
        });
    };

    // Récupère la température immédiatement et toutes les 2 secondes
    fetchTemperature();
    const interval = setInterval(fetchTemperature, 2000);
    return () => clearInterval(interval);
  }, []);

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { key } = e;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "a", "q"].includes(key)) {
        e.preventDefault(); // Évite le défilement de la page
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

  // Envoie les commandes en fonction des touches pressées
  useEffect(() => {
    if (pressedKeys.size === 0) {
      sendCommand("move/stop");
      setActiveButtons([]);
      return;
    }
    // Mappage des touches aux commandes
    const keyToCommand = {
      ArrowUp: "forward",
      ArrowDown: "backward",
      ArrowLeft: "left",
      ArrowRight: "right",
      a: "cam_up",    // Touche 'A' pour monter la caméra
      q: "cam_down",  // Touche 'Q' pour descendre la caméra
    };
    const newActiveButtons = Array.from(pressedKeys).map((key) => keyToCommand[key]).filter(Boolean);
    setActiveButtons(newActiveButtons);
    // Envoie la commande pour chaque touche active
    newActiveButtons.forEach((command) => {
      if (command === "cam_up" || command === "cam_down") {
        sendCommand(command, "GET"); // Les routes cam_up/cam_down sont en GET
      } else {
        sendCommand(`move/${command}`);
      }
    });
  }, [pressedKeys]);

  // Gestion des clics sur les boutons
  const handleMove = (command) => {
    if (command === "stop") {
      sendCommand("move/stop");
      setActiveButtons([]);
    } else if (command === "cam_up" || command === "cam_down") {
      sendCommand(command, "GET");
    } else {
      sendCommand(`move/${command}`);
    }
  };

  // Fonction pour obtenir le statut de la température
  const getTemperatureStatus = (temp) => {
    if (!temp) return { label: "Inconnu", color: "#7f8c8d" };
    if (temp < 10) return { label: "Très froid", color: "#4a6bff" };
    if (temp < 25) return { label: "Frais", color: "#2ed573" };
    if (temp < 35) return { label: "Normal", color: "#ffa502" };
    return { label: "Chaud", color: "#ff4757" };
  };

  return (
    <div className="robot-container">
      <h1>Contrôle du Robot</h1>
      <div className="video-section">
        <img
          src="http://192.168.1.127:5000/video"
          alt="Flux vidéo du robot"
          className="video-feed"
        />
      </div>
      <div className="controls-section">
        {/* Boutons de déplacement */}
        <div className="controls-row">
          <button
            onClick={() => handleMove("forward")}
            className={activeButtons.includes("forward") ? "active-key" : ""}
          >
            ↑ Avant
          </button>
        </div>
        <div className="controls-row">
          <button
            onClick={() => handleMove("left")}
            className={activeButtons.includes("left") ? "active-key" : ""}
          >
            ← Gauche
          </button>
          <button onClick={() => handleMove("stop")} className="stop-button">
            ■ Stop
          </button>
          <button
            onClick={() => handleMove("right")}
            className={activeButtons.includes("right") ? "active-key" : ""}
          >
            → Droite
          </button>
        </div>
        <div className="controls-row">
          <button
            onClick={() => handleMove("backward")}
            className={activeButtons.includes("backward") ? "active-key" : ""}
          >
            ↓ Arrière
          </button>
        </div>
        {/* Boutons pour la caméra */}
        <div className="controls-row">
          <button
            onClick={() => handleMove("cam_up")}
            className={activeButtons.includes("cam_up") ? "active-key" : ""}
          >
            A (Monter Caméra)
          </button>
          <button
            onClick={() => handleMove("cam_down")}
            className={activeButtons.includes("cam_down") ? "active-key" : ""}
          >
            Q (Descendre Caméra)
          </button>
        </div>
      </div>

      {/* Carte de température en bas */}
      <div className="temperature-card">
        <div className="temperature-header">
          <h2>Température</h2>
          <div className="temperature-icon">🌡️</div>
        </div>
        <div className="temperature-content">
          {isLoading ? (
            <div className="temperature-loading">
              <div className="spinner"></div>
              <p>Chargement...</p>
            </div>
          ) : error ? (
            <div className="temperature-error">
              <p>{error}</p>
            </div>
          ) : temperature ? (
            <div className="temperature-value">
              <p>{temperature.temperature}</p>
              <span>°C</span>
            </div>
          ) : (
            <p>Pas de données disponibles</p>
          )}
        </div>
        {temperature && (
          <div className="temperature-status">
            <div className="status-bar">
              <div
                className="status-fill"
                style={{
                  width: `${Math.min(temperature.temperature, 50)}%`,
                  backgroundColor: getTemperatureStatus(temperature.temperature).color
                }}
              ></div>
            </div>
            <p style={{ color: getTemperatureStatus(temperature.temperature).color }}>
              {getTemperatureStatus(temperature.temperature).label}
            </p>
          </div>
        )}
      </div>

      <p className="keyboard-instruction">
        Utilisez les flèches du clavier pour contrôler le robot. <br />
        Touches <strong>A</strong> et <strong>Q</strong> pour monter/descendre la caméra.
      </p>
    </div>
  );
}

export default RobotControl;
