#!/bin/bash

# 0. Nettoyage
docker rm -f robotchenilles 2>/dev/null

# 1. Lancer le container avec les accès matériels ET les dossiers de la Pi
docker run -dt --name robotchenilles \
  --privileged \
  --net=host \
  --ipc=host \
  --shm-size=1gb \
  -v /dev:/dev \
  -v /sys:/sys \
  -v /run/udev:/run/udev:ro \
  -v /usr/lib/aarch64-linux-gnu:/host_libs:ro \
  -v /usr/bin:/host_bins:ro \
  -v /usr/share/libcamera:/usr/share/libcamera:ro \
  -v ~/robot_ws:/home/robot_ws \
  robot-jazzy-pi5

echo "--- Configuration du pont matériel (Library Path) ---"

# 2. On force le container à utiliser les libs de la Pi 5 en priorité
# Cela règle les erreurs de "symbol lookup error"
docker exec robotchenilles sh -c "echo '/host_libs' > /etc/ld.so.conf.d/host.conf && ldconfig"

# 3. On s'assure que le dossier IPA est bien peuplé (même si le volume aide)
docker exec robotchenilles mkdir -p /usr/lib/aarch64-linux-gnu/libcamera
docker cp /usr/lib/aarch64-linux-gnu/libcamera/ipa/. robotchenilles:/usr/lib/aarch64-linux-gnu/libcamera/

echo "--- Configuration terminée ---"

# 4. Entrer dans le container
docker exec -it robotchenilles bash