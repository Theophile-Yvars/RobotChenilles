import React, { useEffect, useRef } from "react";
import useGamepad from "./useGamepad";

const RobotController = ({ rosConnected, sendMove, sendTilt }) => {
  const joystick = useGamepad();
  const lastSentRef = useRef(0);
  const lastCommandRef = useRef("stop");

  useEffect(() => {
    if (!joystick || !rosConnected) return;

    const now = Date.now();
    // On limite l'envoi à 20Hz (toutes les 50ms) pour ne pas saturer ROS
    if (now - lastSentRef.current > 50) {
      
      const deadzone = 0.15;
      const isTriggerPressed = joystick.buttons[0]; // Gâchette pour valider le mouvement

      // --- LOGIQUE DE MOUVEMENT (CMD_VEL) ---
      if (isTriggerPressed) {
        // Axe 1 : Avant/Arrière (Inversion car pousser = négatif sur le stick)
        let linear = joystick.axes[1] * -0.5; 
        // Axe 0 : Gauche/Droite (Inversion pour que Gauche = positif en ROS)
        let angular = joystick.axes[0] * -1.0;

        // Filtrage zone morte
        if (Math.abs(linear) < deadzone) linear = 0;
        if (Math.abs(angular) < deadzone) angular = 0;

        if (linear !== 0 || angular !== 0) {
          sendMove(linear, angular);
          lastCommandRef.current = "moving";
        } else if (lastCommandRef.current !== "stop") {
          sendMove(0, 0);
          lastCommandRef.current = "stop";
        }
      } 
      else if (lastCommandRef.current !== "stop") {
        // Si on relâche la gâchette, on arrête immédiatement
        sendMove(0, 0);
        lastCommandRef.current = "stop";
      }

      // --- LOGIQUE CAMERA (TILT) ---
      // Bouton 3 (Haut du manche, gauche) pour MONTER
      if (joystick.buttons[2]) {
        sendTilt(50);
      }
      // Bouton 2 (Haut du manche, droite) pour DESCENDRE
      if (joystick.buttons[1]) {
        sendTilt(-50);
      }

      lastSentRef.current = now;
    }
  }, [joystick, rosConnected, sendMove, sendTilt]);

  // Petit indicateur visuel pour le Dashboard
  return (
    <div className="joystick-status" style={{
      padding: "10px",
      borderRadius: "8px",
      backgroundColor: "rgba(0,0,0,0.2)",
      marginTop: "10px",
      border: `1px solid ${joystick ? '#4CAF50' : '#f44336'}`
    }}>
      <span style={{ fontSize: "14px", fontWeight: "bold" }}>
        {joystick ? "🎮 Logitech Attack 3" : "🔌 Connectez le Joystick"}
      </span>
      {joystick && (
        <div style={{ fontSize: "12px", color: joystick.buttons[0] ? "#4CAF50" : "#FFC107" }}>
          {joystick.buttons[0] ? "● Mouvement Actif" : "○ Maintenez la gâchette pour piloter"}
        </div>
      )}
    </div>
  );
};

export default RobotController;