import React from "react";
import "../styles/Camera.css";

function Camera() {
  return (
    <div className="video-section">
      <img
        src="http://192.168.1.9:8080/stream?topic=/image_processed"
        alt="Flux vidéo"
        className="video-feed"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/640x480?text=Robot+Hors+Ligne";
        }}
      />
    </div>
  );
}

export default Camera;