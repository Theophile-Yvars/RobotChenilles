#!/bin/bash

# 1. Configuration ROS 2
export ROS_DOMAIN_ID=0
export ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST
# Chemin ajusté pour l'environnement Ubuntu Noble de Docker
export LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

# 2. Nettoyage (On retire sudo car on est root dans Docker)
echo "--- Nettoyage du port 9090 (Rosbridge) ---"
fuser -k 9090/tcp 2>/dev/null || true

# 3. Chargement de l'environnement
# On utilise les chemins absolus du container
source /opt/ros/jazzy/setup.bash
cd /home/robot_ws
source install/setup.bash

echo "--- Lancement du Robot (Moteurs + Camera + Web) ---"
# Utilisation de stdbuf pour voir les logs en temps réel
stdbuf -o L ros2 launch robot_bringup robot.launch.py