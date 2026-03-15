#pragma once
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/twist.hpp"

// Pins GPIO
//const int LEFT_FWD = 13;
//const int LEFT_BWD = 26;
//const int RIGHT_FWD = 16;
//const int RIGHT_BWD = 12;

class MotorNode : public rclcpp::Node {
public:
    MotorNode();
    virtual ~MotorNode();

private:
    void motor_callback(const geometry_msgs::msg::Twist::SharedPtr msg);
    rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr subscription_;
    float linear_;
    float angular_;
};