import React, { useEffect, useState } from "react";
import "../styles/Command.css";

function Command() {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const sendCommand = (endpoint, method = "POST") => {
    fetch(`http://192.168.1.127:5000/${endpoint}`, { method })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur: ${res.status}`);
      })
      .catch((err) => console.error(err));
  };

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
  }, [pressedKeys]);

  return (
    <p className="keyboard-instruction">
      Utilisez les flèches du clavier pour contrôler le robot. <br />
      Touches <strong>A</strong> et <strong>Q</strong> pour monter/descendre la caméra.
    </p>
  );
}

export default Command;
