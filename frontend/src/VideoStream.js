import React from "react";

function VideoStream() {
  return (
    <div>
      <h1>Flux caméra</h1>
      <img
        src="http://192.168.1.127:5000/video"
        alt="Camera Stream"
        style={{ width: "640px", height: "480px" }}
      />
    </div>
  );
}

export default VideoStream;
