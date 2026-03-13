#!/bin/bash

# 1. Nettoyage des processus fantômes
echo "--- Nettoyage du port 9090 et des anciens nodes ---"
# Tue le processus qui occupe le port 9090 (Websocket)
sudo fuser -k 9090/tcp 2>/dev/null
# Sécurité supplémentaire au cas où fuser rate
PID_9090=$(sudo lsof -t -i:9090)
if [ ! -z "$PID_9090" ]; then
    sudo kill -9 $PID_9090 2>/dev/null
fi

# Tue les nodes Python qui pourraient être restés en mémoire
pkill -f camera_stepper_node.py 2>/dev/null


# 2. Chargement de l'environnement ROS 2
source /opt/ros/jazzy/setup.bash
cd ~/robot_ws
source install/setup.bash

# 3. Lancement du robot
echo "--- Lancement du Robot Chenilles ---"
ros2 launch robot_bringup robot.launch.py