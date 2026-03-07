from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # 1. Lancer les Moteurs
        Node(
            package='robot_hardware',
            executable='motor_node',
            name='motors'
        ),
        # 2. Lancer le Capteur de Température
        Node(
            package='robot_hardware',
            executable='temp_node',
            name='sensors'
        ),
        # 3. Lancer le Cerveau (Intelligence)
        Node(
            package='robot_brain',
            executable='brain_node',
            name='brain'
        ),
        # 4. Lancer le Pont Web (Socket pour React)
        Node(
            package='rosbridge_server',
            executable='rosbridge_websocket',
            name='rosbridge',
            parameters=[{'port': 9090}]
        )
    ])