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
    && rm -rf /var/lib/apt/lists/* \
    ros-jazzy-slam-toolbox \
    ros-jazzy-nav2-map-server \
    ros-jazzy-tf2-ros \
    ros-jazzy-tf2-geometry-msgs \
    git \
    build-essential 

RUN mkdir -p /usr/lib/aarch64-linux-gnu/libcamera
ENV LIBCAMERA_IPA_MODULE_PATH=/usr/lib/aarch64-linux-gnu/libcamera

WORKDIR /home/robot_ws

# Création du dossier src et récupération du driver
RUN mkdir -p src && cd src && \
    git clone https://github.com/ldrobotSensorTeam/ldlidar_stl_ros2.git

# Compilation du workspace (nécessite d'avoir sourcé ROS)
RUN . /opt/ros/jazzy/setup.sh && \
    colcon build --symlink-install

# Sourcer le workspace pour le shell
RUN echo "source /opt/ros/jazzy/setup.bash" >> /root/.bashrc
RUN echo "source /home/robot_ws/install/setup.bash" >> /root/.bashr