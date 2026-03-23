import React, { useEffect, useRef, useState } from 'react';
import { Ros, Topic } from 'roslib'; 

const RosLidarMap = ({ rosIp }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastScan = useRef(null);

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
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      
      // Ajuster la taille du canvas à celle du conteneur
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
      
      const center = size / 2;
      // RÉGLAGE ÉCHELLE : Pixels par mètre
      const scale = size / 8; // Affiche environ 4 mètres de rayon

      // --- 1. FOND ET GRILLE ---
      ctx.fillStyle = '#1c2128'; // Couleur de fond identique à ton interface
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = 'rgba(88, 166, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(139, 148, 158, 0.8)';
      ctx.font = '12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

      // Dessin des cercles et distances
      [1, 2, 3].forEach(dist => {
        const radius = dist * scale;
        
        // Cercle
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // Texte de distance (centré sur l'axe vertical)
        ctx.fillText(`${dist}m`, center + 5, center - radius - 5);
      });

      // Axes centraux
      ctx.beginPath();
      ctx.moveTo(0, center); ctx.lineTo(size, center);
      ctx.moveTo(center, 0); ctx.lineTo(center, size);
      ctx.stroke();

      // --- 2. POINTS LIDAR ---
      if (scan) {
        scan.ranges.forEach((range, i) => {
          if (range > scan.range_min && range < scan.range_max) {
            const angle = scan.angle_min + (i * scan.angle_increment);
            
            // On tourne de -90° (Math.PI/2) pour que le "devant" du robot soit vers le haut de l'écran
            const x = center + (range * Math.cos(angle - Math.PI/2) * scale);
            const y = center + (range * Math.sin(angle - Math.PI/2) * scale);

            if (range < 0.5) ctx.fillStyle = "#ff7b72";      // Rouge
            else if (range < 1.2) ctx.fillStyle = "#ffa657"; // Orange
            else ctx.fillStyle = "#3fb950";                  // Vert

            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        });
      }

      // --- 3. ROBOT (CENTRE) ---
      ctx.fillStyle = "#58a6ff";
      ctx.beginPath();
      ctx.arc(center, center, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Petite flèche directionnelle
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

    // Redessiner si la fenêtre change de taille
    window.addEventListener('resize', () => draw(lastScan.current));

    return () => {
      scanTopic.unsubscribe();
      ros.close();
      window.removeEventListener('resize', () => draw(lastScan.current));
    };
  }, [rosIp]);

  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1c2128'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      
      <div style={{ 
        marginTop: '10px', 
        color: '#8b949e', 
        fontSize: '11px', 
        display: 'flex', 
        gap: '15px',
        paddingBottom: '10px'
      }}>
        <span><span style={{color: '#ff7b72'}}>●</span> &lt; 0.5m</span>
        <span><span style={{color: '#ffa657'}}>●</span> 0.5m - 1.2m</span>
        <span><span style={{color: '#3fb950'}}>●</span> &gt; 1.2m</span>
      </div>
    </div>
  );
};

export default RosLidarMap;