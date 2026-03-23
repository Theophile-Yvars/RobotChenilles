#!/bin/bash

# 1. Configuration ROS 2
export ROS_DOMAIN_ID=42
export ROS_AUTOMATIC_DISCOVERY_RANGE=SUBNET
export LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

# 2. Nettoyage
echo "--- Nettoyage du port 9090 (Rosbridge) ---"
fuser -k 9090/tcp 2>/dev/null || true

# 3. Chargement de l'environnement
source /opt/ros/jazzy/setup.bash
cd /home/robot_ws
source install/setup.bash

echo "--- 1. Préparation du matériel (Lidar) ---"
chmod 777 /dev/ttyUSB0 2>/dev/null || echo "Lidar non détecté sur USB0"

# --- 4. Lancement des Nodes ---

echo "--- 2. Lancement du Driver LiDAR ---"
ros2 launch ldlidar_stl_ros2 ld19.launch.py &

# --- 2.5 Lien Odométrie Fixe (Indispensable sans encodeurs) ---
ros2 run tf2_ros static_transform_publisher 0 0 0 0 0 0 odom base_link &
sleep 1 # Petit délai pour laisser le TF se propager

echo "--- 3. Lancement du SLAM Toolbox (Mode Haute Tolérance) ---"
# --- 3. Lancement du SLAM Toolbox (Réglages Réactifs) ---
ros2 run slam_toolbox async_slam_toolbox_node --ros-args \
  -p use_sim_time:=false \
  -p odom_frame:=odom \
  -p base_frame:=base_link \
  -p map_frame:=map \
  -p scan_topic:=/scan \
  -p mode:=async \
  -p autostart:=true \
  -p use_lifecycle_manager:=false \
  -p map_update_interval:=1.0 \
  -p transform_timeout:=0.5 \
  -p minimum_travel_distance:=0.05 \
  -p minimum_travel_heading:=0.05 \
  -p scan_buffer_size:=5 \
  -p minimum_time_interval:=0.1 \
  -p transform_publish_period:=0.02 &

echo "--- 4. Lancement des nodes du Robot (Moteurs + Camera) ---"
# AJOUT DU & ICI pour que le script puisse continuer vers l'activation
stdbuf -o L ros2 launch robot_bringup robot.launch.py &

#echo "--- 5. Publication TF fixe Laser ---"
#ros2 run tf2_ros static_transform_publisher 0 0 0.18 0 0 0 base_link base_laser &

# --- 5. Activation du Cerveau (Lifecycle) ---
echo "--- Attente du Node SLAM ---"
# Boucle tant que le node n'est pas visible
while ! ros2 node list | grep -q "/slam_toolbox"; do
  echo "En attente du node /slam_toolbox..."
  sleep 2
done

echo "--- Configuration du SLAM ---"
until ros2 lifecycle set /slam_toolbox configure; do
  echo "Échec configuration, on réessaie dans 2s..."
  sleep 2
done

sleep 2
echo "--- Activation du SLAM ---"
until ros2 lifecycle set /slam_toolbox activate; do
  echo "Échec activation, on réessaie dans 2s..."
  sleep 2
done
echo "🚀 SETUP PRÊT : Connecte ton React sur ws://IP_DE_TA_PI:9090"

# --- 7. Gestion de la fermeture ---
# Le 'wait' attend que TOUS les processus en arrière-plan se terminent
# Si tu fais Ctrl+C, le script s'arrêtera proprement
wait