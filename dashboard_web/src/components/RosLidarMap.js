import React, { useEffect, useRef, useState } from 'react';
import { Ros, Topic } from 'roslib'; 

const RosLidarMap = ({ rosIp }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ros = new Ros({ url: `ws://${rosIp}:9090` });
    ros.on('connection', () => setIsConnected(true));
    ros.on('close', () => setIsConnected(false));

    const scanTopic = new Topic({
      ros: ros,
      name: '/scan',
      messageType: 'sensor_msgs/LaserScan'
    });

    const draw = (scan) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || !scan) return;

      const ctx = canvas.getContext('2d');
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
      
      const center = size / 2;
      const scale = size / 8; 

      // --- 1. FOND ---
      ctx.fillStyle = '#1c2128'; 
      ctx.fillRect(0, 0, size, size);

      // --- 2. GRILLE ---
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.15)';
      [1, 2, 3].forEach(dist => {
        const radius = dist * scale;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // --- 3. POINTS LIDAR (GAUCHE -> HAUT) ---
      if (scan.ranges) {
        scan.ranges.forEach((range, i) => {
          if (range > scan.range_min && range < scan.range_max) {
            
            const angle = scan.angle_min + (i * scan.angle_increment);
            
            // LA SEULE COMBINAISON QU'ON N'A PAS TESTÉE :
            // Inverser Cos et Sin pour changer d'axe (90°)
            // Et mettre un moins sur le Y pour monter vers le haut du canvas
            const x = center - (range * Math.cos(angle) * scale);
            const y = center - (range * Math.sin(angle) * scale);

            if (range < 0.5) ctx.fillStyle = "#ff7b72";      
            else if (range < 1.2) ctx.fillStyle = "#ffa657"; 
            else ctx.fillStyle = "#3fb950";                  

            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        });
      }

      // --- 4. ROBOT & POINTE (VERS LE HAUT) ---
      ctx.fillStyle = "#58a6ff";
      ctx.beginPath();
      ctx.arc(center, center, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(center, center - 15);
      ctx.lineTo(center - 7, center - 5);
      ctx.lineTo(center + 7, center - 5);
      ctx.closePath();
      ctx.fill();
    };

    scanTopic.subscribe(draw);
    return () => { scanTopic.unsubscribe(); ros.close(); };
  }, [rosIp]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#1c2128', display: 'flex' }}>
      <canvas ref={canvasRef} style={{ display: 'block', margin: 'auto' }} />
    </div>
  );
};

export default RosLidarMap;