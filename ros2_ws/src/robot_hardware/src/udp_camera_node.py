#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
import cv2
from cv_bridge import CvBridge

class UdpCameraNode(Node):
    def __init__(self):
        super().__init__('camera')
        self.publisher_ = self.create_publisher(Image, '/camera/image_raw', 10)
        self.bridge = CvBridge()
        
        # Le pipeline GStreamer pour recevoir le MJPEG de l'hôte
        pipeline = "udpsrc port=5000 ! jpegdec ! videoconvert ! appsink"
        self.cap = cv2.VideoCapture(pipeline, cv2.CAP_GSTREAMER)
        
        self.timer = self.create_timer(1.0/30, self.timer_callback)
        self.get_logger().info('Nœud Caméra UDP démarré (écoute port 5000)')

    def timer_callback(self):
        ret, frame = self.cap.read()
        if ret:
            msg = self.bridge.cv2_to_imgmsg(frame, encoding="bgr8")
            msg.header.frame_id = "camera_frame"
            self.publisher_.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = UdpCameraNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()