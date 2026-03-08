import React, { useEffect, useState, useRef, useCallback } from "react";
import { Ros, Topic } from "roslib"; 
import "../styles/RobotDashboard.css";

const RobotDashboard = () => {
  const [status, setStatus] = useState("Déconnecté");
  const [temp, setTemp] = useState(0);
  const ros = useRef(null);

  // Utilisation de useCallback pour éviter de recréer la fonction à chaque rendu
  const sendMove = useCallback((linear, angular) => {
    if (!ros.current || !ros.current.isConnected) return;

    const cmdVel = new Topic({
      ros: ros.current,
      name: "/cmd_vel_raw",
      messageType: "geometry_msgs/Twist",
    });

    const twist = {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    };

    cmdVel.publish(twist);
  }, []);

  useEffect(() => {
    ros.current = new Ros({ url: "ws://192.168.1.127:9090" });

    ros.current.on("connection", () => setStatus("Connecté"));
    ros.current.on("error", () => setStatus("Erreur"));
    ros.current.on("close", () => setStatus("Déconnecté"));

    const tempListener = new Topic({
      ros: ros.current,
      name: "/tempSensor",
      messageType: "std_msgs/Float32",
    });

    tempListener.subscribe((message) => {
      setTemp(message.data.toFixed(1));
    });

    // --- GESTION DU CLAVIER ---
    const handleKeyDown = (e) => {
      switch(e.key) {
        case "ArrowUp":    sendMove(0.5, 0); break;
        case "ArrowDown":  sendMove(-0.5, 0); break;
        case "ArrowLeft":  sendMove(0, 1.0); break;
        case "ArrowRight": sendMove(0, -1.0); break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      // Arrête le robot dès qu'on relâche une flèche
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        sendMove(0, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      tempListener.unsubscribe();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      ros.current.close();
    };
  }, [sendMove]);

  return (
    <div className="dashboard-container">
      <div className={`status-bar ${status.toLowerCase()}`}>
        Statut: {status}
      </div>

      <div className={`temp-card ${temp > 60 ? "danger" : ""}`}>
        <h3>Température</h3>
        <p className="temp-value">{temp}°C</p>
        {temp > 60 && <p className="warning-text">⚠️ SURCHAUFFE</p>}
      </div>

      <div className="joystick-grid">
        <button className="btn-up" onMouseDown={() => sendMove(0.5, 0)} onMouseUp={() => sendMove(0, 0)}>▲</button>
        <button className="btn-left" onMouseDown={() => sendMove(0, 1.0)} onMouseUp={() => sendMove(0, 0)}>◀</button>
        <button className="btn-stop" onClick={() => sendMove(0, 0)}>STOP</button>
        <button className="btn-right" onMouseDown={() => sendMove(0, -1.0)} onMouseUp={() => sendMove(0, 0)}>▶</button>
        <button className="btn-down" onMouseDown={() => sendMove(-0.5, 0)} onMouseUp={() => sendMove(0, 0)}>▼</button>
      </div>
      
      <p className="keyboard-hint">⌨️ Utilisez les flèches du clavier pour piloter</p>
    </div>
  );
};

export default RobotDashboard;