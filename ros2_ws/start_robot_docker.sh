#!/bin/bash

docker rm -f robotchenilles 2>/dev/null

# On ajoute explicitement les bus de périphériques et la mémoire partagée
docker run -dt --name robotchenilles \
  --privileged \
  --net=host \
  --ipc=host \
  --shm-size=1gb \
  -v /dev:/dev \
  -v /sys:/sys \
  -v /run/udev:/run/udev:ro \
  -v /run/dbus:/run/dbus:ro \
  -v /host_libs:/usr/lib/aarch64-linux-gnu:ro \
  -v /usr/lib/aarch64-linux-gnu/libcamera:/usr/lib/aarch64-linux-gnu/libcamera:ro \
  -v /usr/share/libcamera:/usr/share/libcamera:ro \
  -v ~/robot_ws:/home/robot_ws \
  robot-jazzy-pi5

echo "--- Injection des bibliothèques systèmes ---"
# On force le lien vers les libs de la Pi
docker exec robotchenilles ldconfig

docker exec -it robotchenilles bash