#include "rclcpp/rclcpp.hpp"
#include "robot_brain/brain_node.hpp"

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<BrainNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}