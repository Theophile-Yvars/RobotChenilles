#include "robot_hardware/motor_node.hpp"

// On utilise les placeholders pour le bind du callback
using std::placeholders::_1;

MotorNode::MotorNode() : Node("motor_node") {
    subscription_ = this->create_subscription<geometry_msgs::msg::Twist>(
        "/cmd_vel", 10, std::bind(&MotorNode::motor_callback, this, _1));

    RCLCPP_INFO(this->get_logger(), "=== Node Motor (Hardware) prêt ===");
    RCLCPP_INFO(this->get_logger(), "En attente de commandes sur /cmd_vel...");
}

MotorNode::~MotorNode() {
    RCLCPP_INFO(this->get_logger(), "Arrêt des moteurs...");
}

void MotorNode::motor_callback(const geometry_msgs::msg::Twist::SharedPtr msg) {
    float linear = msg->linear.x;
    float angular = msg->angular.z;

    RCLCPP_INFO(this->get_logger(), "Exécution Hardware -> Linéaire: %.2f | Angulaire: %.2f", linear, angular);
}

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<MotorNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}