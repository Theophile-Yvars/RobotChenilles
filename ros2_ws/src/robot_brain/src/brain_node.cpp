#include "robot_brain/brain_node.hpp"

using namespace std::chrono_literals;

BrainNode::BrainNode() : Node("brain_node") {
    pub_motor_cmd_ = this->create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    sub_temp_ = this->create_subscription<std_msgs::msg::Float32>("/tempSensor", 2, [this](const std_msgs::msg::Float32::SharedPtr msg) {
        RCLCPP_INFO(this->get_logger(), "Température reçue: %.2f°C", msg->data);
    });
    timer_ = this->create_wall_timer(1000ms, std::bind(&BrainNode::decision_loop, this));
    RCLCPP_INFO(this->get_logger(), "Node Cerveau démarré.");
}

void BrainNode::decision_loop() {
    // Exemple de décision simple : avancer tout droit
    auto cmd = geometry_msgs::msg::Twist();
    cmd.linear.x = 0.5; // Avance à 0.5 m/s
    cmd.angular.z = 0.0; // Pas de rotation
    pub_motor_cmd_->publish(cmd);
}

int main(int argc, char **argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<BrainNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}