import React, { useEffect, useRef, useState } from 'react';
import { Ros, Topic } from 'roslib'; 

const RosLidarMap = ({ rosIp }) => {
  const canvasRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastScan = useRef(null);

  useEffect(() => {
    const ros = new Ros({ url: `ws://${rosIp}:9090` });

    ros.on('connection', () => setIsConnected(true));
    ros.on('close', () => setIsConnected(false));

    // On n'écoute plus que le SCAN, car l'Odom et la Map sont fixes
    const scanTopic = new Topic({
      ros: ros,
      name: '/scan',
      messageType: 'sensor_msgs/LaserScan'
    });

    const draw = (scan) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      // Taille fixe pour le radar (ex: 400x400)
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      const center = size / 2;
      const scale = 50; // 1 mètre = 50 pixels

      // --- 1. FOND RADAR ---
      ctx.fillStyle = '#1c2128';
      ctx.fillRect(0, 0, size, size);

      // Cercles de distance (tous les mètres)
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.2)';
      ctx.lineWidth = 1;
      [1, 2, 3].forEach(dist => {
        ctx.beginPath();
        ctx.arc(center, center, dist * scale, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // --- 2. DESSIN DU SCAN (LES POINTS ROUGES) ---
      if (scan) {
        scan.ranges.forEach((range, i) => {
          if (range > scan.range_min && range < scan.range_max) {
            // Le LiDAR LD19 est monté à l'endroit, on calcule l'angle
            const angle = scan.angle_min + (i * scan.angle_increment);
            
            // Conversion polaire -> cartésien (on inverse Y pour le canvas)
            const x = center + (range * Math.cos(angle) * scale);
            const y = center - (range * Math.sin(angle) * scale);

            // Couleur dynamique selon la distance
            if (range < 0.3) ctx.fillStyle = "#ff7b72"; // Trop proche : Rouge
            else if (range < 0.8) ctx.fillStyle = "#ffa657"; // Moyen : Orange
            else ctx.fillStyle = "#3fb950"; // Ok : Vert

            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        });
      }

      // --- 3. DESSIN DU ROBOT (CENTRE) ---
      ctx.fillStyle = "#58a6ff";
      // Corps du robot
      ctx.beginPath();
      ctx.arc(center, center, 8, 0, 2 * Math.PI);
      ctx.fill();
      // Flèche de direction (devant)
      ctx.beginPath();
      ctx.moveTo(center, center - 12);
      ctx.lineTo(center - 5, center - 5);
      ctx.lineTo(center + 5, center - 5);
      ctx.closePath();
      ctx.fill();
    };

    scanTopic.subscribe((message) => {
      lastScan.current = message;
      draw(message);
    });

    return () => {
      scanTopic.unsubscribe();
      ros.close();
    };
  }, [rosIp]);

  return (
    <div className="map-viewport" style={{ 
      position: 'relative', 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0d1117',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {!isConnected && (
        <div style={{ position: 'absolute', top: 10, left: 10, color: '#ff7b72', zIndex: 10 }}>
          ⚠️ LIDAR DISCONNECTED
        </div>
      )}
      <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  );
};

export default RosLidarMap;