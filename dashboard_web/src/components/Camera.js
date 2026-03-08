import React from "react";
import "../styles/Camera.css";

function Camera() {
  return (
    <div className="video-section">
      <img
        src="http://192.168.1.127:5000/video"
        alt="Flux vidéo du robot"
        className="video-feed"
      />
    </div>
  );
}

export default Camera;