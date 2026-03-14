from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():

    camera = Node(
        package='camera_ros',
        executable='camera_node',
        name='camera',
        parameters=[{
            'camera': 0, 
            'width': 640,
            'height': 480,
            'format': 'BGR888',
        }],
        remappings=[('/camera/image_raw', '/image_raw')]
    )

    motors = Node(
        package='robot_hardware',
        executable='motor_node',
        name='motors'
    )

    sensors = Node(
        package='robot_hardware',
        executable='temp_node',
        name='sensors'
    )

    brain = Node(
        package='robot_brain',
        executable='brain_node',
        name='brain'
    )

    rosbridge = Node(
        package='rosbridge_server',
        executable='rosbridge_websocket',
        name='rosbridge',
        parameters=[{'port': 9090}]
    )

    camera_stepper = Node(
        package='robot_hardware',
        executable='camera_stepper_node.py', 
        name='camera_tilt'
    )

    video_server = Node(
        package='web_video_server',
        executable='web_video_server',
        name='video_server',
        parameters=[{'port': 8080}]
    )

    return LaunchDescription([
        camera, 
        motors,
        sensors,
        brain,
        rosbridge,
        camera_stepper,
        video_server
    ])