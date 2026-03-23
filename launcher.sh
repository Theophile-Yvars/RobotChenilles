#!/bin/bash

# =================================================================
# 🚀 LAUNCHER ROBOT CHENILLES - MODE RÉACTIF (SCAN + RADAR)
# =================================================================

# 1. Configuration ROS 2 & Environnement
export ROS_DOMAIN_ID=42
export ROS_AUTOMATIC_DISCOVERY_RANGE=SUBNET
export PYTHONUNBUFFERED=1

# 2. Nettoyage des processus fantômes (évite les erreurs de port déjà utilisé)
echo "🧹 Nettoyage des anciens processus..."
fuser -k 9090/tcp 2>/dev/null || true
pkill -f "ros2" || true
sleep 1

# 3. Chargement des sources
source /opt/ros/jazzy/setup.bash
cd /home/robot_ws
source install/setup.bash

echo "--- 1. Matériel & LiDAR ---"
# Droits sur l'USB pour le LD19
chmod 777 /dev/ttyUSB0 2>/dev/null || echo "⚠️ Attention: LiDAR non détecté sur /dev/ttyUSB0"

# Lancement du Driver LiDAR en arrière-plan
ros2 launch ldlidar_stl_ros2 ld19.launch.py &
sleep 2

echo "--- 2. Arbre des transformations (TF) ---"
# On crée la structure du robot pour que le Scan sache où il est
# odom -> base_link (le robot dans le monde)
ros2 run tf2_ros static_transform_publisher 0 0 0 0 0 0 odom base_link &
# base_link -> base_laser (le capteur est à 18cm de haut)
ros2 run tf2_ros static_transform_publisher 0 0 0.18 0 0 0 base_link base_laser &

echo "--- 3. Lancement du Cœur (Moteurs, Caméra, Tilt) ---"
# On lance ton robot_bringup
ros2 launch robot_bringup robot.launch.py &

echo "--- 4. Sécurité : Radar de Proximité ---"
# Ici, on peut lancer un node de surveillance (voir ci-dessous)
# ros2 run robot_brain safety_node &

echo "-------------------------------------------------------"
echo "✅ SYSTÈME OPÉRATIONNEL"
echo "📡 Dashboard React : ws://$(hostname -I | awk '{print $1}'):9090"
echo "-------------------------------------------------------"

# Garde le script en vie
wait