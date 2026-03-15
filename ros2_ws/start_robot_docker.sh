#!/bin/bash

# Fonction pour tout arrêter proprement si on coupe le script
cleanup() {
    echo ""
    echo "--- Arrêt de la caméra et du container ---"
    kill $CAM_PID 2>/dev/null
    # Optionnel: docker stop robotchenilles
    exit
}

# Associe le signal Ctrl+C à la fonction cleanup
trap cleanup SIGINT

# --- 1. Caméra ---
echo "--- Lancement de la caméra (Hôte) ---"
pkill -9 rpicam-vid 2>/dev/null
# Utilise 0.0.0.0 pour être sûr que Docker capte le flux sur l'interface host
# Dans ton script start_robot_docker.sh sur la Pi
rpicam-vid -t 0 --width 640 --height 480 --framerate 30 --codec mjpeg -o udp://0.0.0.0:5000 --inline --nopreview &
CAM_PID=$!

# --- 2. Docker ---
echo "--- Démarrage du Container ---"
docker rm -f robotchenilles 2>/dev/null
docker run -dt --name robotchenilles \
  --privileged --net=host --ipc=host --pid=host \
  --shm-size=1gb \
  -v /dev:/dev -v /sys:/sys -v /run:/run \
  -v /usr/lib/aarch64-linux-gnu:/host_libs:ro \
  -v /usr/bin:/host_bins:ro \
  -v /usr/share/libcamera:/usr/share/libcamera:ro \
  -v ~/robot_ws:/home/robot_ws \
  robot-jazzy-pi5

# --- 3. Hardware link ---
docker exec robotchenilles sh -c "echo '/host_libs' > /etc/ld.so.conf.d/host.conf && ldconfig"

# --- 4. Launch ROS 2 ---
echo "--- Lancement de ROS 2 ---"
# Note : J'ai enlevé le build.sh pour aller plus vite, rajoute-le si nécessaire
docker exec -it robotchenilles bash -c "source /home/robot_ws/install/setup.bash && /home/robot_ws/src/launcher.sh"

# Si on sort du docker exec, on lance le cleanup
cleanup