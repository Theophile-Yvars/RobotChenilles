#pragma once
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/twist.hpp"

class MotorNode : public rclcpp::Node {
public:
    MotorNode();
    ~MotorNode(); /
private:
    void cmd_vel_callback(const geometry_msgs::msg::Twist::SharedPtr msg);
    void set_motors(float left_val, float right_val);
    
    // Pins GPIO
    const int LEFT_FWD = 13;
    const int LEFT_BWD = 26;
    const int RIGHT_FWD = 16;
    const int RIGHT_BWD = 12;

    rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr subscription_;
};