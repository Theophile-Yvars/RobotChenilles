from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # 1. Moteurs des roues
        Node(package='robot_hardware', executable='motor_node', name='motors'),
        
        # 2. Capteur Température
        Node(package='robot_hardware', executable='temp_node', name='sensors'),

        # 3. Cerveau (Le node C++ que nous venons de corriger)
        Node(package='robot_brain', executable='brain_node', name='brain'),

        # 4. Pont Web (Socket pour Roslibjs / React)
        Node(
            package='rosbridge_server', 
            executable='rosbridge_websocket', 
            name='rosbridge',
            parameters=[{'port': 9090}]
        ),

        # 5. Caméra Raspberry Pi (Interface libcamera)
        Node(
            package='camera_ros',
            executable='camera_node',
            name='pi_cam',
            parameters=[{
                'width': 640,
                'height': 480,
                # Note: Si l'image est à l'envers, certains drivers acceptent 'vertical_flip': True
            }]
        ),

        # 6. Serveur de streaming pour ton Dashboard React
        Node(
            package='web_video_server',
            executable='web_video_server',
            name='video_server',
            parameters=[{'port': 8080}]
        ),

        # 7. Moteur Pas à Pas (Inclinaison Caméra)
        Node(
            package='robot_hardware', # Change par ton nom de package
            executable='camera_stepper_node.py',
            name='camera_tilt'
        )
    ])