import cv2
from time import sleep
import RPi.GPIO as GPIO
from picamera2 import Picamera2

# --- Initialisation camera ---
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()

def gen_frames():
    while True:
        frame = picam2.capture_array()
        frame = cv2.flip(frame, 0)  # retourne l'image verticalement
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# --- Controle moteur pas a pas pour la camera ---
step_pins = [14, 15, 18, 23]
GPIO.setmode(GPIO.BCM)
for pin in step_pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, False)

# Sequence moteur unipolaire (4 phases)
step_sequence = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1]
]

def move_steps(steps, direction=1, delay=0.002):
    for _ in range(steps):
        for step in (range(8)[::direction]):
            for pin in range(4):
                GPIO.output(step_pins[pin], step_sequence[step][pin])
            sleep(delay)

def cam_up(steps=20, delay=0.002):
    move_steps(steps, 1, delay)

def cam_down(steps=20, delay=0.002):
    move_steps(steps, -1, delay)
