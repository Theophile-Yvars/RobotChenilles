#include "robot_brain/brain_node.hpp"

using namespace std::chrono_literals;

BrainNode::BrainNode() : Node("brain_node") {
    pub_motor_cmd_ = this->create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    sub_temp_ = this->create_subscription<std_msgs::msg::Float32>("/tempSensor", 2, [this](const std_msgs::msg::Float32::SharedPtr msg) {
        this->current_temp_ = msg->data;
        RCLCPP_INFO(this->get_logger(), "Température reçue: %.2f°C", msg->data);
    });
    timer_ = this->create_wall_timer(1000ms, std::bind(&BrainNode::decision_loop, this));
    RCLCPP_INFO(this->get_logger(), "Node Cerveau démarré.");
}

void BrainNode::decision_loop() {
    geometry_msgs::msg::Twist final_cmd;

    if (this->current_temp_ > 60.0f) {
        final_cmd.linear.x = 0.0;
        final_cmd.angular.z = 0.0;
        RCLCPP_ERROR(this->get_logger(), "SURCHAUFFE (%.2f C) ! Arrêt moteur.", this->current_temp_);
    } else {
        final_cmd = this->web_cmd_;
    }

    pub_motor_cmd_->publish(final_cmd);
}