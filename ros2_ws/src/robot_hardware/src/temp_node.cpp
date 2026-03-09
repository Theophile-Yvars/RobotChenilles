#include "robot_hardware/temp_node.hpp"
#include <fstream> 
#include <string>

using namespace std::chrono_literals; // Requis pour utiliser "ms"
 
TempSensorNode() : Node("temp_sensor_node") {
    publisher_ = this->create_publisher<std_msgs::msg::Float32>("/tempSensor", 2);
    timer_ = this->create_wall_timer(2000ms, std::bind(&TempSensorNode::read_temp, this));
    RCLCPP_INFO(this->get_logger(), "Node Température démarré.");
}

void TempSensorNode::read_temp()
{
    RCLCPP_INFO(this->get_logger(), "Reading temperature...");
    std::string path = "/sys/bus/w1/devices/28-00000a29354b/w1_slave";
    std::ifstream file(path);
    std::string line;
    bool sensor_ok = false;
    float temperature = -999.0;

    if (file.is_open()) {
        while (std::getline(file, line)) {
            if (line.find("YES") != std::string::npos) {
                sensor_ok = true;
            }
            size_t pos = line.find("t=");
            if (pos != std::string::npos) {
                std::string temp_raw = line.substr(pos + 2);
                temperature = std::stof(temp_raw) / 1000.0f;
            }
        }
        file.close();

        if (sensor_ok && temperature != -999.0) {
            auto message = std_msgs::msg::Float32();
            message.data = temperature;
            publisher_->publish(message);
            RCLCPP_DEBUG(this->get_logger(), "Temp: %.2f°C", temperature);
        } else {
            RCLCPP_ERROR(this->get_logger(), "Erreur de lecture (Check YES)");
        }
    } else {
            RCLCPP_ERROR(this->get_logger(), "Capteur non détecté à l'adresse : %s", path.c_str());
    }
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