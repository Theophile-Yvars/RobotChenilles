#pragma once
#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/twist.hpp"
#include "std_msgs/msg/float32.hpp"

class BrainNode : public rclcpp::Node
{
public:
    BrainNode();
private:
    void decision_loop();
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr pub_motor_cmd_;
    rclcpp::Subscription<std_msgs::msg::Float32>::SharedPtr sub_temp_;
    float current_temp_ = 0.0;
    geometry_msgs::msg::Twist web_cmd_;
};