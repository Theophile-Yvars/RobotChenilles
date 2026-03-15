FROM ros:jazzy

# Éviter les questions pendant l'install
ENV DEBIAN_FRONTEND=noninteractive

# Installation des dépendances (Camera + GPIO + Rosbridge + Video Server)
RUN apt-get update && apt-get install -y \
    libcamera-ipa \
    libcamera0.2 \
    libcamera-tools \
    python3-pip \
    python3-gpiozero \
    python3-lgpio \
    ros-jazzy-rosbridge-server \
    ros-jazzy-web-video-server \
    ros-jazzy-camera-ros \
    ros-jazzy-cv-bridge \
    v4l-utils \
    && rm -rf /var/lib/apt/lists/*

# Préparation du dossier pour les fichiers IPA propriétaires du Pi 5
RUN mkdir -p /usr/lib/aarch64-linux-gnu/libcamera

# Variable d'environnement pour que libcamera trouve ses drivers
ENV LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

WORKDIR /home/robot_ws

# Sourcing automatique de ROS et de ton workspace dans le .bashrc
RUN echo "source /opt/ros/jazzy/setup.bash" >> /root/.bashrc && \
    echo "if [ -f /home/robot_ws/install/setup.bash ]; then source /home/robot_ws/install/setup.bash; fi" >> /root/.bashrc

CMD ["bash"]