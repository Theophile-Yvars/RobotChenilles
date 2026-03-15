cmake_minimum_required(VERSION 3.8)
project(robot_hardware)

# 1. Trouver les dépendances
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

# 2. Déclarer le dossier des headers (.hpp)
include_directories(include)

# 3. Créer l'exécutable pour les MOTEURS
add_executable(motor_node src/motor_node.cpp)
ament_target_dependencies(motor_node rclcpp std_msgs geometry_msgs)

# 4. Créer l'exécutable pour la TEMPÉRATURE
add_executable(temp_node src/temp_node.cpp)
ament_target_dependencies(temp_node rclcpp std_msgs)

# 5. Installation des binaires C++
install(TARGETS
  motor_node
  temp_node
  DESTINATION lib/${PROJECT_NAME}
)

# 6. Installation des scripts PYTHON
install(PROGRAMS
  src/camera_stepper_node.py
  src/udp_camera_node.py       
  DESTINATION lib/${PROJECT_NAME}
)

# 7. Fin de configuration ROS 2
ament_package()