from flask import Flask, Response
from picamera2 import Picamera2
import cv2
from gpiozero import Motor
import RPi.GPIO as GPIO
from time import sleep

app = Flask(__name__)

# --- Configuration des moteurs ---
# Exemple : moteur gauche sur GPIO 26 et 13, moteur droit sur 12 et 16
motor_left = Motor(forward=13, backward=26)  # BCM numbers
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


# --- Camera ---
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
picam2.start()


def gen_frames():
    while True:
        frame = picam2.capture_array()
        # Retourne l'image verticalement (haut/bas)
        frame = cv2.flip(frame, 0)  # 0 = retour vertical, 1 = retour horizontal, -1 = retour vertical + horizontal
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



# Configuration du mode GPIO
step_pins = [14, 15, 18, 23]
GPIO.setmode(GPIO.BCM)
for pin in step_pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, False)

# Sequence pour un moteur pas-a-pas unipolaire (4 phases)
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


@app.route('/cam_up')
def cam_up(steps=20, delay=0.002):
    move_steps(steps, 1, delay)
    return {"status": "ok"}, 200


@app.route('/cam_down')
def cam_down(steps=20, delay=0.002):
    move_steps(steps, -1, delay)
    return {"status": "ok"}, 200


@app.route('/video')
def video():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/move/<direction>", methods=["POST"])
def move(direction):
    print(f"Commande reÃ§ue : {direction}")
    if direction == "forward":
        forward()
    elif direction == "backward":
        backward()
    elif direction == "left":
        left()
    elif direction == "right":
        right()
    elif direction == "stop":
        stop_motors()
    else:
        return {"status": "error", "message": "Direction inconnue"}, 400

    return {"status": "ok"}, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
