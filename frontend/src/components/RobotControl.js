import React, { useEffect, useState } from "react";
import "../styles/RobotControl.css";

function RobotControl() {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const sendCommand = (direction) => {
    fetch(`http://192.168.1.127:5000/move/${direction}`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de l'envoi de la commande");
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        setPressedKeys((prevKeys) => new Set(prevKeys).add(e.key));
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        setPressedKeys((prevKeys) => {
          const newKeys = new Set(prevKeys);
          newKeys.delete(e.key);
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

  // Détermine la direction en fonction des touches enfoncées
  useEffect(() => {
    if (pressedKeys.size === 0) {
      sendCommand("stop");
      return;
    }

    let direction = "";
    if (pressedKeys.has("ArrowUp")) direction += "forward_";
    if (pressedKeys.has("ArrowDown")) direction += "backward_";
    if (pressedKeys.has("ArrowLeft")) direction += "left";
    if (pressedKeys.has("ArrowRight")) direction += "right";

    // Envoie la direction combinée (ex: "forward_left")
    if (direction) {
      sendCommand(direction.replace(/_$/, "")); // Supprime le dernier "_" si nécessaire
    }
  }, [pressedKeys]);

  const handleMove = (baseDirection) => {
    // Pour les boutons, envoie simplement la direction de base
    sendCommand(baseDirection);
  };

  return (
    <div className="robot-container">
      <h1>Contrôle du robot</h1>
      <div className="video-section">
        <img
          src="http://192.168.1.127:5000/video"
          alt="Camera Stream"
          className="video-feed"
        />
      </div>
      <div className="controls-section">
        <div className="controls-row">
          <button onClick={() => handleMove("forward")}>↑ Avant</button>
        </div>
        <div className="controls-row">
          <button onClick={() => handleMove("left")}>← Gauche</button>
          <button onClick={() => handleMove("stop")}>⏹ Stop</button>
          <button onClick={() => handleMove("right")}>→ Droite</button>
        </div>
        <div className="controls-row">
          <button onClick={() => handleMove("backward")}>↓ Arrière</button>
        </div>
      </div>
      <p>Utilise les flèches du clavier pour contrôler le robot (combinations possibles).</p>
    </div>
  );
}

export default RobotControl;
