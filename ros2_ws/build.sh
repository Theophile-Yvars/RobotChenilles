#!/bin/bash

docker build -t robot-jazzy-pi5 .

# 0. Nettoyage au cas où un vieux container traîne
docker rm -f robotchenilles 2>/dev/null

# 1. Lancer le container avec l'accès udev pour la détection matérielle
docker run -dt --name robotchenilles \
  --privileged \
  --net=host \
  --ipc=host \
  -v /dev:/dev \
  -v /sys:/sys \
  -v /run/udev:/run/udev:ro \
  -v ~/robot_ws:/home/robot_ws \
  robot-jazzy-pi5

echo "--- Injection des pilotes propriétaires Pi 5 ---"

# 2. Injecter les fichiers IPA du Pi 5 (Hôte -> Container)
docker cp /usr/lib/aarch64-linux-gnu/libcamera/ipa/. robotchenilles:/usr/lib/aarch64-linux-gnu/libcamera/

# Créer le dossier pipeline dans le container avant le cp
docker exec robotchenilles mkdir -p /usr/share/libcamera/pipeline/rpi/pisp/
docker cp /usr/share/libcamera/pipeline/rpi/pisp/. robotchenilles:/usr/share/libcamera/pipeline/rpi/pisp/

echo "--- Configuration terminée ---"

# 3. Entrer dans le container
docker exec -it robotchenilles bash