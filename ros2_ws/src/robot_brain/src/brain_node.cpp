#include "robot_brain/brain_node.hpp"
#include <cv_bridge/cv_bridge.hpp>
#include <opencv2/opencv.hpp>
#include "std_msgs/msg/int32.hpp"
#include <sensor_msgs/image_encodings.hpp>

using namespace std::chrono_literals;

BrainNode::BrainNode() : Node("brain_node") {
    // Publishers
    pub_motor_cmd_ = this->create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    pub_processed_image_ = this->create_publisher<sensor_msgs::msg::Image>("/image_processed", 10);
    pub_tilt_cmd_ = this->create_publisher<std_msgs::msg::Int32>("/camera/tilt", 10);

    // Subscriptions
    sub_temp_ = this->create_subscription<std_msgs::msg::Float32>(
        "/tempSensor", 2, [this](const std_msgs::msg::Float32::SharedPtr msg) {
            this->current_temp_ = msg->data;
        });
    sub_web_ = this->create_subscription<geometry_msgs::msg::Twist>(
        "/cmd_vel_web", 10, [this](const geometry_msgs::msg::Twist::SharedPtr msg) {
            this->web_cmd_ = *msg;
        });
    sub_image_ = this->create_subscription<sensor_msgs::msg::Image>(
        "/camera/image_raw", rclcpp::SensorDataQoS(), 
        std::bind(&BrainNode::image_callback, this, std::placeholders::_1));
    sub_cam_web_ = this->create_subscription<std_msgs::msg::Int32>(
        "/cam_control_web", 10, [this](const std_msgs::msg::Int32::SharedPtr msg) {
        this->pub_tilt_cmd_->publish(*msg);
        RCLCPP_INFO(this->get_logger(), "Mouvement Caméra commandé : %d pas", msg->data);
    });

    timer_ = this->create_wall_timer(50ms, std::bind(&BrainNode::decision_loop, this));
    
    RCLCPP_INFO(this->get_logger(), "Node Cerveau démarré avec contrôle Tilt.");
}

void BrainNode::image_callback(const sensor_msgs::msg::Image::SharedPtr msg) {
    // TODO : modification avec cv_bridge. Exemple: mettre la température sur l'image 
    pub_processed_image_->publish(*msg);
}
void BrainNode::decision_loop() {
    geometry_msgs::msg::Twist final_cmd;

    if (this->current_temp_ > 60.0f) {
        final_cmd.linear.x = 0.0;
        final_cmd.angular.z = 0.0;
        RCLCPP_ERROR_THROTTLE(this->get_logger(), *this->get_clock(), 2000, 
            "SURCHAUFFE (%.2f C) ! Arrêt moteur.", this->current_temp_);
    } else {
        final_cmd = this->web_cmd_;
    }

    pub_motor_cmd_->publish(final_cmd);
}

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    auto node = std::make_shared<BrainNode>();
    rclcpp::spin(node);
    rclcpp::shutdown();
    return 0;
}