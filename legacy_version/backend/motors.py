from gpiozero import Motor

# Configuration des moteurs (BCM GPIO)
motor_left = Motor(forward=13, backward=26)
motor_right = Motor(forward=16, backward=12)

def stop_motors():
    motor_left.stop()
    motor_right.stop()

def forward():
    motor_left.forward()
    motor_right.forward()

def backward():
    motor_left.backward()
    motor_right.backward()

def left():
    motor_left.backward()
    motor_right.forward()

def right():
    motor_left.forward()
    motor_right.backward()
