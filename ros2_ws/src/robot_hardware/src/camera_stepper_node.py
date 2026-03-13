#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32
import time

# Sur Pi 5, on préfère gpiozero ou lgpio
try:
    import RPi.GPIO as GPIO
except ImportError:
    print("Erreur : RPi.GPIO n'est pas compatible Pi 5 ou manquant.")

class CameraStepperNode(Node):
    def __init__(self):
        super().__init__('camera_stepper')
        
        # Configuration GPIO (Pins 14, 15, 18, 23)
        self.step_pins = [14, 15, 18, 23]
        
        GPIO.setmode(GPIO.BCM)
        for pin in self.step_pins:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, False)

        self.step_sequence = [
            [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
            [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
        ]

        self.subscription = self.create_subscription(
            Int32,
            '/camera/tilt',
            self.listener_callback,
            10)
        
        self.get_logger().info("Node Moteur Pas à Pas Camera prêt (Pi 5).")

    def move_steps(self, steps):
        direction = 1 if steps > 0 else -1
        abs_steps = abs(steps)
        delay = 0.002 # Vitesse de rotation

        for _ in range(abs_steps):
            seq = range(8) if direction == 1 else reversed(range(8))
            for step_idx in seq:
                for pin_idx in range(4):
                    GPIO.output(self.step_pins[pin_idx], self.step_sequence[step_idx][pin_idx])
                time.sleep(delay)
        
        # Stop courant pour éviter la chauffe
        for pin in self.step_pins:
            GPIO.output(pin, False)

    def listener_callback(self, msg):
        self.get_logger().info(f"Mouvement camera : {msg.data} pas")
        self.move_steps(msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = CameraStepperNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        GPIO.cleanup()
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()