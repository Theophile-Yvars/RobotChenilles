#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32
from gpiozero import OutputDevice
import time

class CameraStepperNode(Node):
    def __init__(self):
        super().__init__('camera_tilt')
        # Pins 14, 15, 18, 23 configurés via gpiozero
        self.pins = [OutputDevice(14), OutputDevice(15), OutputDevice(18), OutputDevice(23)]
        
        self.step_sequence = [
            [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
            [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
        ]
        
        self.subscription = self.create_subscription(Int32, '/camera/tilt', self.listener_callback, 10)
        self.get_logger().info("Node Stepper Camera prêt (via gpiozero).")

    def move_steps(self, steps):
        direction = 1 if steps > 0 else -1
        abs_steps = abs(steps)
        for _ in range(abs_steps):
            seq = range(8) if direction == 1 else reversed(range(8))
            for step_idx in seq:
                for i in range(4):
                    if self.step_sequence[step_idx][i]:
                        self.pins[i].on()
                    else:
                        self.pins[i].off()
                time.sleep(0.002)
        # Éteindre tout
        for p in self.pins: p.off()

    def listener_callback(self, msg):
        self.move_steps(msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = CameraStepperNode()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()