from flask import Flask, Response
from picamera2 import Picamera2
import cv2
from gpiozero import Motor

app = Flask(__name__)

# --- Configuration des moteurs ---
# Exemple : moteur gauche sur GPIO 17 et 18, moteur droit sur 22 et 23
motor_left = Motor(forward=17, backward=18)
motor_right = Motor(forward=22, backward=23)


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
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


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