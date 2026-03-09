import rclpy
from rclpy.node import Node
from std_msgs.msg import Int32
import RPi.GPIO as GPIO
import time

class CameraStepperNode(Node):
    def __init__(self):
        super().__init__('camera_stepper')
        
        # Configuration GPIO
        self.step_pins = [14, 15, 18, 23]
        GPIO.setmode(GPIO.BCM)
        for pin in self.step_pins:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, False)

        self.step_sequence = [
            [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
            [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
        ]

        # Abonnement : reçoit un nombre de pas (positif pour UP, négatif pour DOWN)
        self.subscription = self.create_subscription(
            Int32,
            '/camera/tilt',
            self.listener_callback,
            10)
        
        self.get_logger().info("Node Moteur Pas à Pas Camera prêt.")

    def move_steps(self, steps):
        direction = 1 if steps > 0 else -1
        abs_steps = abs(steps)
        delay = 0.002

        for _ in range(abs_steps):
            # On suit la séquence (8 étapes)
            seq = range(8) if direction == 1 else reversed(range(8))
            for step in seq:
                for pin in range(4):
                    GPIO.output(self.step_pins[pin], self.step_sequence[step][pin])
                time.sleep(delay)
        
        # Extinction des pins pour éviter que le moteur ne chauffe à l'arrêt
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
        rclpy.shutdown()