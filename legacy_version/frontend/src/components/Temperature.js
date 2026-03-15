import React, { useEffect, useState, useRef } from "react";
import "../styles/Temperature.css";

function Temperature() {
  const [temperature, setTemperature] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchTemperature = () => {
      fetch("http://192.168.1.127:5000/temperature")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setTemperature(data);
            setError(null);
            if (firstLoad.current) {
              setIsLoading(false);
              firstLoad.current = false;
            }
          }
        })
        .catch(() => {
          setError("Erreur de connexion au capteur");
        });
    };

    fetchTemperature();
    const interval = setInterval(fetchTemperature, 2000);
    return () => clearInterval(interval);
  }, []);

  const getTemperatureStatus = (temp) => {
    if (!temp) return { label: "Inconnu", color: "#7f8c8d" };
    if (temp < 10) return { label: "Très froid", color: "#4a6bff" };
    if (temp < 25) return { label: "Frais", color: "#2ed573" };
    if (temp < 35) return { label: "Normal", color: "#ffa502" };
    return { label: "Chaud", color: "#ff4757" };
  };

  return (
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
            <p>{temperature.temperature} °C</p>
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
  );
}

export default Temperature;
