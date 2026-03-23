#pragma once

#include "rclcpp/rclcpp.hpp"
#include "geometry_msgs/msg/twist.hpp"
#include "std_msgs/msg/float32.hpp"
#include "std_msgs/msg/int32.hpp"
#include "sensor_msgs/msg/image.hpp"

class BrainNode : public rclcpp::Node
{
public:
    BrainNode();

private:
    // Fonctions de boucle et de rappel
    void decision_loop();
    void image_callback(const sensor_msgs::msg::Image::SharedPtr msg);

    // --- Publishers ---
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr pub_motor_cmd_;
    rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr pub_processed_image_;
    rclcpp::Publisher<std_msgs::msg::Int32>::SharedPtr pub_tilt_cmd_;

    // --- Subscriptions ---
    rclcpp::Subscription<std_msgs::msg::Float32>::SharedPtr sub_temp_;
    rclcpp::Subscription<geometry_msgs::msg::Twist>::SharedPtr sub_web_;
    rclcpp::Subscription<sensor_msgs::msg::Image>::SharedPtr sub_image_;
    rclcpp::Subscription<std_msgs::msg::Int32>::SharedPtr sub_cam_web_;

    // --- Variables et Utilitaires ---
    rclcpp::TimerBase::SharedPtr timer_;
    float current_temp_ = 0.0;
    geometry_msgs::msg::Twist web_cmd_;
};