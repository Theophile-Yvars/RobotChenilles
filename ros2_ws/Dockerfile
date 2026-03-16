FROM ros:jazzy

ENV DEBIAN_FRONTEND=noninteractive

# Install des dépendances
RUN apt-get update && apt-get install -y \
    liblgpio-dev \
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

RUN mkdir -p /usr/lib/aarch64-linux-gnu/libcamera
ENV LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

WORKDIR /home/robot_ws

RUN echo "source /opt/ros/jazzy/setup.bash" >> /root/.bashrc