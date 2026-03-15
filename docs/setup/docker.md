Documentation Setup ROS 2 Jazzy (Docker) sur Pi 51. Entrer dans le cerveau du robot (Le Container)Puisque tu as déjà créé le container avec run, pour y retourner plus tard ou ouvrir un deuxième terminal, utilise :Bash# Pour relancer le container s'il est arrêté
docker start robot_brain_container

# Pour entrer dedans et taper des commandes
docker exec -it robot_brain_container bash
2. Configuration interne (À faire une seule fois dedans)Une fois à l'intérieur du container (le prompt est root@...), installe les outils de compilation :Bashapt update
apt install -y python3-colcon-common-extensions python3-rosdep python3-argcomplete
rosdep update
3. Installer les dépendances de ton projetC'est ici que la magie opère. Docker va installer cv-bridge, vision-msgs, etc., sans aucune erreur :Bashcd /home/robot_ws
rosdep install --from-paths src --ignore-src -y -r
4. Compiler et sourcerBash# Compiler
colcon build --symlink-install

# Activer ton code
source install/setup.bash
💡 Aide-mémoire des commandes Docker utilesActionCommandeSortir du containerTape exit ou Ctrl+DVérifier si le container tournedocker psVoir tous les containers (même éteints)docker ps -aSupprimer et recommencer à zérodocker rm -f robot_brain_container


docker run -it --name robotchenilles \
  --privileged \
  --net=host \
  -v /dev:/dev \
  -v /sys:/sys \
  -v /run/udev:/run/udev:ro \
  -v /usr/share/libcamera:/usr/share/libcamera:ro \
  -v ~/robot_ws:/home/robot_ws \
  ros:jazzy


  apt update && apt install -y python3-colcon-common-extensions python3-rosdep python3-gpiozero python3-lgpio ros-jazzy-cv-bridge ros-jazzy-vision-msgs ros-jazzy-rosbridge-suite ros-jazzy-camera-ros ros-jazzy-web-video-server

  cd /home/robot_ws
colcon build --symlink-install
source install/setup.bash
./src/launcher.sh