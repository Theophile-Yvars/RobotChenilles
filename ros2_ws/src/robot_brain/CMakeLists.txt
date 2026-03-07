cmake_minimum_required(VERSION 3.8)
project(robot_brain)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)

include_directories(include)

# On crée le nœud de décision
add_executable(brain_node src/brain_node.cpp)
ament_target_dependencies(brain_node rclcpp std_msgs geometry_msgs)

install(TARGETS
  brain_node
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()