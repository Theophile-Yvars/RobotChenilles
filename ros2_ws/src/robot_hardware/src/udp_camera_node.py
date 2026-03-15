#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
import cv2
import socket
import numpy as np
from cv_bridge import CvBridge

class UdpCameraNode(Node):
    def __init__(self):
        super().__init__('camera_node')
        self.publisher_ = self.create_publisher(Image, '/camera/image_raw', 10)
        self.bridge = CvBridge()

        # Configuration du socket UDP (0.0.0.0 pour écouter partout)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            self.sock.bind(('0.0.0.0', 5000))
            self.sock.settimeout(0.5) # Ne pas bloquer indéfiniment
            self.get_logger().info("Socket UDP lié au port 5000. Prêt à recevoir !")
        except Exception as e:
            self.get_logger().error(f"Erreur bind socket: {e}")

        # On lance la lecture le plus vite possible
        self.timer = self.create_timer(0.01, self.timer_callback)

    def timer_callback(self):
        try:
            # On reçoit le paquet (65535 est la taille max d'un paquet UDP)
            data, addr = self.sock.recvfrom(65535)
            
            # Décodage de l'image JPEG en frame OpenCV
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is not None:
                frame = cv2.flip(frame, -1)
                msg = self.bridge.cv2_to_imgmsg(frame, encoding="bgr8")
                msg.header.stamp = self.get_clock().now().to_msg()
                msg.header.frame_id = "camera_frame"
                self.publisher_.publish(msg)
        except socket.timeout:
            # C'est normal si aucune image n'arrive pendant 0.5s
            pass
        except Exception as e:
            self.get_logger().warn(f"Erreur réception: {e}")

def main(args=None):
    rclpy.init(args=args)
    node = UdpCameraNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.sock.close()
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()