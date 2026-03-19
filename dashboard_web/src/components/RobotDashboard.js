import React, { useEffect, useState, useRef, useCallback } from "react";
import { Ros, Topic } from "roslib"; 
import RobotStats from "./RobotStats";
import "../styles/RobotDashboard.css";
import Camera from "./Camera";
import RobotController from "./RobotController";

const RobotDashboard = () => {
  const [status, setStatus] = useState("Déconnecté");
  const [temp, setTemp] = useState(0);
  const [stats, setStats] = useState({
    lastCommand: 'stop',
    commandCount: 0,
    uptime: 0
  });

  const ros = useRef(null);

  // IP DU ROBOT
  const robotIP = "192.168.1.9";

  const getTempClass = (temperature) => {
    if (temperature < 45) return "temp-low";
    if (temperature < 65) return "temp-med";
    return "temp-high";
  };

  const sendMove = useCallback((linear, angular) => {
    if (!ros.current?.isConnected) return;

    const cmdVel = new Topic({
      ros: ros.current,
      name: "/cmd_vel_web",
      messageType: "geometry_msgs/Twist",
    });

    cmdVel.publish({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    });

    let cmdLabel = 'stop';
    if (linear > 0) cmdLabel = 'forward';
    else if (linear < 0) cmdLabel = 'backward';
    else if (angular > 0) cmdLabel = 'left';
    else if (angular < 0) cmdLabel = 'right';

    setStats(prev => ({
      ...prev,
      commandCount: prev.commandCount + 1,
      lastCommand: cmdLabel
    }));
  }, []);

  const sendTilt = (steps) => {
    if (!ros.current?.isConnected) return;

    const tiltTopic = new Topic({
      ros: ros.current,
      name: "/cam_control_web",
      messageType: "std_msgs/Int32",
    });

    tiltTopic.publish({ data: steps });

    setStats(prev => ({
      ...prev,
      commandCount: prev.commandCount + 1,
      lastCommand: steps > 0 ? 'cam_up' : 'cam_down'
    }));
  };

  useEffect(() => {

    ros.current = new Ros({
      url: `ws://${robotIP}:9090`
    });

    ros.current.on("connection", () => setStatus("Connecté"));
    ros.current.on("error", () => setStatus("Erreur"));
    ros.current.on("close", () => setStatus("Déconnecté"));

    const tempListener = new Topic({
      ros: ros.current,
      name: "/tempSensor",
      messageType: "std_msgs/Float32",
    });

    tempListener.subscribe((msg) => {
      setTemp(msg.data.toFixed(1));
    });

    const uptimeTimer = setInterval(() => {
      setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);

    const handleKeyDown = (e) => {
      if (e.repeat) return;

      switch(e.key) {
        case "ArrowUp":
          sendMove(0.5, 0);
          break;

        case "ArrowDown":
          sendMove(-0.5, 0);
          break;

        case "ArrowLeft":
          sendMove(0, 1.0);
          break;

        case "ArrowRight":
          sendMove(0, -1.0);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        sendMove(0,0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      tempListener.unsubscribe();
      clearInterval(uptimeTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      ros.current.close();
    };

  }, [sendMove]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <div className="card-header">
          <div className="status-group">
            <span className={`status-pill ${status.toLowerCase()}`}>
              {status}
            </span>
          </div>

          <div className={`temp-badge ${getTempClass(temp)}`}>
            CPU: {temp}°C
          </div>
        </div>

        <div className="video-viewport">
          <Camera robotIP={robotIP} />

          <div className="tilt-overlay">
            <button className="tilt-btn" onClick={() => sendTilt(50)}>▲</button>
            <span className="tilt-label">TILT</span>
            <button className="tilt-btn" onClick={() => sendTilt(-50)}>▼</button>
          </div>
        </div>

        <div className="ui-container">

          <div className="stats-wrapper">
            <RobotStats stats={stats} />
            <RobotController 
              rosConnected={status === "Connecté"} 
              sendMove={sendMove} 
              sendTilt={sendTilt} 
            />
          </div>

          <div className="controls-wrapper">

            <div className="d-pad">

              <button
                className="up"
                onMouseDown={() => sendMove(0.5, 0)}
                onMouseUp={() => sendMove(0, 0)}
              >
                ▲
              </button>

              <div className="mid-row">

                <button
                  className="left"
                  onMouseDown={() => sendMove(0, 1.0)}
                  onMouseUp={() => sendMove(0, 0)}
                >
                  ◀
                </button>

                <button
                  className="stop"
                  onClick={() => sendMove(0, 0)}
                >
                  STOP
                </button>

                <button
                  className="right"
                  onMouseDown={() => sendMove(0, -1.0)}
                  onMouseUp={() => sendMove(0, 0)}
                >
                  ▶
                </button>

              </div>

              <button
                className="down"
                onMouseDown={() => sendMove(-0.5, 0)}
                onMouseUp={() => sendMove(0, 0)}
              >
                ▼
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RobotDashboard;
