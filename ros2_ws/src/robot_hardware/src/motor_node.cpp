#include "robot_brain/brain_node.hpp"

using namespace std::chrono_literals;

BrainNode::BrainNode() : Node("brain_node") {
    pub_motor_cmd_ = this->create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);
    
    sub_temp_ = this->create_subscription<std_msgs::msg::Float32>(
        "/tempSensor", 2, [this](const std_msgs::msg::Float32::SharedPtr msg) {
            this->current_temp_ = msg->data; 
            RCLCPP_INFO(this->get_logger(), "Température reçue: %.2f°C", msg->data);
        });

    sub_web_ = this->create_subscription<geometry_msgs::msg::Twist>(
        "/cmd_vel_raw", 10, [this](const geometry_msgs::msg::Twist::SharedPtr msg) {
            this->web_cmd_ = *msg;
            RCLCPP_INFO(this->get_logger(), "Commande reçue: linear.x=%.2f, angular.z=%.2f", this->web_cmd_.linear.x, this->web_cmd_.angular.z);
        });

    timer_ = this->create_wall_timer(100ms, std::bind(&BrainNode::decision_loop, this));
    RCLCPP_INFO(this->get_logger(), "Node Cerveau prêt.");
}

void BrainNode::decision_loop() {
    auto final_cmd = geometry_msgs::msg::Twist();

    if (this->current_temp_ > 60.0) {
        RCLCPP_ERROR(this->get_logger(), "SURCHAUFFE (%f C) ! Arrêt moteur.", this->current_temp_);
        final_cmd.linear.x = 0.0;
        final_cmd.angular.z = 0.0;
    } 
    else {
        final_cmd = this->web_cmd_;
    }

    pub_motor_cmd_->publish(final_cmd);
}

int main(int argc, char ** argv)
{
  // 1. Initialise les communications ROS 2
  rclcpp::init(argc, argv);

  // 2. Crée une instance de ton Node
  auto node = std::make_shared<BrainNode>();

  // 3. Fait tourner le Node en boucle (écoute les messages, exécute le timer)
  // Cette ligne est bloquante : le programme s'arrête ici jusqu'au Ctrl+C
  rclcpp::spin(node);

  // 4. Une fois fini, on coupe proprement
  rclcpp::shutdown();
  return 0;
}