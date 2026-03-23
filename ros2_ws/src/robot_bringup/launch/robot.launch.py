from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
import os
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    
    lidar_dir = get_package_share_directory('ldlidar_stl_ros2')
    lidar_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(os.path.join(lidar_dir, 'launch', 'ld19.launch.py')),
        launch_arguments={'frame_id': 'base_laser'}.items()
    )

    tf_odom_base = Node(
        package='tf2_ros',
        executable='static_transform_publisher',
        name='tf_odom_to_base',
        arguments=['0', '0', '0', '0', '0', '0', 'odom', 'base_link']
    )

    tf_base_laser = Node(
        package='tf2_ros',
        executable='static_transform_publisher',
        name='tf_base_to_laser',
        arguments=['0', '0', '0.18', '0', '0', '0', 'base_link', 'base_laser']
    )

    camera = Node(package='robot_hardware', executable='udp_camera_node.py', name='camera')
    motors = Node(package='robot_hardware', executable='motor_node', name='motors')
    sensors = Node(package='robot_hardware', executable='temp_node', name='sensors')
    brain = Node(package='robot_brain', executable='brain_node', name='brain')
    camera_stepper = Node(package='robot_hardware', executable='camera_stepper_node.py', name='camera_tilt')

    rosbridge = Node(
        package='rosbridge_server',
        executable='rosbridge_websocket',
        name='rosbridge',
        parameters=[{'port': 9090}]
    )

    video_server = Node(
        package='web_video_server',
        executable='web_video_server',
        name='video_server',
        parameters=[{'port': 8080}]
    )

    return LaunchDescription([
        lidar_launch,
        tf_odom_base,
        tf_base_laser,
        camera, 
        motors,
        sensors,
        brain,
        rosbridge,
        camera_stepper,
        video_server
    ])