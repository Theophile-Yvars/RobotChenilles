#!/bin/bash

docker rm -f robotchenilles 2>/dev/null

docker run -dt --name robotchenilles \
  --privileged \
  --net=host \
  --ipc=host \
  --pid=host \
  --shm-size=1gb \
  --security-opt seccomp=unconfined \
  --security-opt label=disable \
  -v /dev:/dev \
  -v /sys:/sys \
  -v /run:/run \
  -v /usr/lib/aarch64-linux-gnu:/host_libs:ro \
  -v /usr/bin:/host_bins:ro \
  -v /usr/share/libcamera:/usr/share/libcamera:ro \
  -v ~/robot_ws:/home/robot_ws \
  robot-jazzy-pi5

echo "--- Configuration du lien matériel ---"
docker exec robotchenilles sh -c "echo '/host_libs' > /etc/ld.so.conf.d/host.conf && ldconfig"

docker exec -it robotchenilles bash