import React from "react";
import "../styles/Camera.css";

function Camera() {
  return (
    <div className="video-section">
      <img 
      src="http://192.168.1.9:8080/stream?topic=/image_processed" 
      alt="Flux Direct" 
    />
    </div>
  );
}

export default Camera;