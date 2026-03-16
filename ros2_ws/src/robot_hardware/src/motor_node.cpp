#include "robot_hardware/motor_node.hpp"
#include <lgpio.h> 

#define L_IN1 5
#define L_IN2 6
#define R_IN1 13
#define R_IN2 26

using std::placeholders::_1;

MotorNode::MotorNode() : Node("motor_node") {
    // Initialisation l'accès GPIO
    handle_ = lgGpiochipOpen(4); 

    // On réserve explicitement les 4 pins de contrôle moteur
    lgGpioClaimOutput(handle_, 0, 5, 0);  // L_IN1
    lgGpioClaimOutput(handle_, 0, 6, 0);  // L_IN2
    lgGpioClaimOutput(handle_, 0, 13, 0); // R_IN1
    lgGpioClaimOutput(handle_, 0, 26, 0); // R_IN2
    subscription_ = this->create_subscription<geometry_msgs::msg::Twist>(
        "/cmd_vel", 10, std::bind(&MotorNode::motor_callback, this, _1));

    RCLCPP_INFO(this->get_logger(), "=== Node Motor (Hardware Pi 5) prêt ===");
}

MotorNode::~MotorNode() {
    // Stop Motors on exit
    lgGpioWrite(handle_, L_IN1, 0); lgGpioWrite(handle_, L_IN2, 0);
    lgGpioWrite(handle_, R_IN1, 0); lgGpioWrite(handle_, R_IN2, 0);
    lgGpiochipClose(handle_);
}

void MotorNode::motor_callback(const geometry_msgs::msg::Twist::SharedPtr msg) {
    double x = msg->linear.x;
    double z = msg->angular.z;

    double left_speed = x + z;
    double right_speed = x - z;

    // --- LOGIQUE D'AFFICHAGE SÉLECTIF ---
    if (left_speed != last_left_ || right_speed != last_right_) {
        RCLCPP_INFO(this->get_logger(), "Nouvelle commande -> L: %.2f | R: %.2f", left_speed, right_speed);
        
        // On met à jour la mémoire
        last_left_ = left_speed;
        last_right_ = right_speed;
    }
    // ------------------------------------

    lgGpioWrite(handle_, L_IN1, (left_speed > 0));
    lgGpioWrite(handle_, L_IN2, (left_speed < 0));
    lgGpioWrite(handle_, R_IN1, (right_speed > 0));
    lgGpioWrite(handle_, R_IN2, (right_speed < 0));
}

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<MotorNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}