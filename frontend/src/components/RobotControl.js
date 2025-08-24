import React, { useEffect, useState } from "react";
import "../styles/RobotControl.css";

function RobotControl() {
  const [pressedKeys, setPressedKeys] = useState(new Set());
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
    let firstLoad = true;

    const fetchTemperature = () => {
      fetch("http://192.168.1.127:5000/temperature")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setTemperature(data);
            setError(null);
            if (firstLoad) {
              setIsLoading(false);
              firstLoad = false;
            }
          }
        })
        .catch((err) => {
          setError("Erreur de connexion au capteur");
          console.error(err);
        });
    };

    fetchTemperature();
    const interval = setInterval(fetchTemperature, 2000);
    return () => clearInterval(interval);
  }, []);

  // Gestion des touches clavier
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

  // Envoie les commandes en fonction des touches pressées
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
        sendCommand(command === "cam_up" || command === "cam_down" ? command : `move/${command}`,
          command === "cam_up" || command === "cam_down" ? "GET" : "POST"
        );
      }
    });
  }, [pressedKeys]);

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

      {/* Carte de température */}
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
              <p>{temperature.temperature} <span>°C</span></p>
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
