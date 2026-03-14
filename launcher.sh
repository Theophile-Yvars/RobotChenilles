#!/bin/bash

# Configuration ROS 2 forcée en local
export ROS_DOMAIN_ID=0
export ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST
export LIBCAMERA_IPA_MODULE_PATH=/opt/ros/jazzy/lib/libcamera/ipa
# On désactive le fichier XML qui posait erreur
unset FASTRTPS_DEFAULT_PROFILES_FILE

echo "--- Nettoyage du port 9090 ---"
sudo fuser -k 9090/tcp 2>/dev/null
PID_9090=$(sudo lsof -t -i:9090)
[ ! -z "$PID_9090" ] && sudo kill -9 $PID_9090 2>/dev/null

pkill -f camera_stepper_node.py 2>/dev/null
sleep 2

source /opt/ros/jazzy/setup.bash
cd ~/robot_ws
source install/setup.bash

echo "--- Lancement du Robot (Moteurs + Camera + Web) ---"
ros2 launch robot_bringup robot.launch.py