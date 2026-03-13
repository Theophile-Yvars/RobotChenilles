#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32
import time
import sys

# Gestion de l'import pour Pi 5
try:
    import RPi.GPIO as GPIO
except ImportError:
    try:
        # Alternative moderne pour Pi 5
        import rpi_lgpio as GPIO
    except ImportError:
        print("CRITICAL: Aucune librairie GPIO trouvée. Installez python3-lgpio")
        sys.exit(1)

class CameraStepperNode(Node):
    def __init__(self):
        super().__init__('camera_tilt') # Nom cohérent avec ton launch file
        
        self.step_pins = [14, 15, 18, 23]
        
        # Initialisation GPIO
        try:
            GPIO.setmode(GPIO.BCM)
            for pin in self.step_pins:
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, False)
        except Exception as e:
            self.get_logger().error(f"Erreur GPIO Hardware : {e}")

        self.step_sequence = [
            [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
            [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
        ]

        self.subscription = self.create_subscription(
            Int32,
            '/camera/tilt',
            self.listener_callback,
            10)
        
        self.get_logger().info("Node Stepper Camera opérationnel sur Pi 5.")

    def move_steps(self, steps):
        direction = 1 if steps > 0 else -1
        abs_steps = abs(steps)
        delay = 0.002

        for _ in range(abs_steps):
            seq = range(8) if direction == 1 else reversed(range(8))
            for step_idx in seq:
                for pin_idx in range(4):
                    GPIO.output(self.step_pins[pin_idx], self.step_sequence[step_idx][pin_idx])
                time.sleep(delay)
        
        # Relâcher la tension
        for pin in self.step_pins:
            GPIO.output(pin, False)

    def listener_callback(self, msg):
        self.get_logger().info(f"Mouvement : {msg.data} pas")
        self.move_steps(msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = CameraStepperNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        # Sécurité : on éteint tout avant de quitter
        try:
            GPIO.cleanup()
        except:
            pass
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()