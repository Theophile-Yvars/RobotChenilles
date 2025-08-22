import React, { useEffect, useState } from "react";
import "../styles/RobotControl.css";

function RobotControl() {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [activeButtons, setActiveButtons] = useState([]);

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

  useEffect(() => {
    if (pressedKeys.size === 0) {
      sendCommand("stop");
      setActiveButtons([]);
      return;
    }

    const newActiveButtons = Array.from(pressedKeys).map((key) => {
      switch (key) {
        case "ArrowUp":
          return "forward";
        case "ArrowDown":
          return "backward";
        case "ArrowLeft":
          return "left";
        case "ArrowRight":
          return "right";
        default:
          return "";
      }
    }).filter(Boolean);

    setActiveButtons(newActiveButtons);

    let direction = "";
    if (pressedKeys.has("ArrowUp")) direction += "forward_";
    if (pressedKeys.has("ArrowDown")) direction += "backward_";
    if (pressedKeys.has("ArrowLeft")) direction += "left";
    if (pressedKeys.has("ArrowRight")) direction += "right";

    if (direction) {
      sendCommand(direction.replace(/_$/, ""));
    }
  }, [pressedKeys]);

  const handleMove = (direction) => {
    sendCommand(direction);
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
      </div>
      <p className="keyboard-instruction">
        Utilisez les flèches du clavier pour contrôler le robot (combinations possibles).
      </p>
    </div>
  );
}

export default RobotControl;
