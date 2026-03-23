#pragma once
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float32.hpp"

class TempSensorNode : public rclcpp::Node
{
public:
    TempSensorNode();
private:
    void read_temp();
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<std_msgs::msg::Float32>::SharedPtr publisher_;
};