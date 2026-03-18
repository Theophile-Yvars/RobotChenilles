FROM ros:jazzy

ENV DEBIAN_FRONTEND=noninteractive

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
    ros-jazzy-slam-toolbox \
    ros-jazzy-nav2-map-server \
    ros-jazzy-tf2-ros \
    ros-jazzy-tf2-geometry-msgs \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/lib/aarch64-linux-gnu/libcamera
ENV LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

WORKDIR /home/robot_ws

# 2. Récupération du driver
RUN mkdir -p src && cd src && \
    git clone https://github.com/ldrobotSensorTeam/ldlidar_stl_ros2.git

# 3. PATCH CRITIQUE : Ajout de l'include manquant pour Jazzy (GCC 13+)
RUN sed -i '1i #include <pthread.h>' src/ldlidar_stl_ros2/ldlidar_driver/src/logger/log_module.cpp

# 4. Compilation
RUN . /opt/ros/jazzy/setup.sh && \
    colcon build --symlink-install

# 5. Sourçage automatique
RUN echo "source /opt/ros/jazzy/setup.bash" >> /root/.bashrc
RUN echo "source /home/robot_ws/install/setup.bash" >> /root/.bashrc