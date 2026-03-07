from flask import Flask, Response
from flask_cors import CORS
from motors import forward, backward, left, right, stop_motors
from camera import gen_frames, cam_up, cam_down
from temperature import read_temperature

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# --- Routes Camera ---
@app.route('/video')
def video():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/cam_up')
def camera_up():
    cam_up()
    return {"status": "ok"}, 200

@app.route('/cam_down')
def camera_down():
    cam_down()
    return {"status": "ok"}, 200

# --- Routes Moteurs ---
@app.route("/move/<direction>", methods=["POST"])
def move(direction):
    print(f"Commande recue : {direction}")
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

# --- Route Temperature ---
@app.route('/temperature')
def temperature():
    return read_temperature()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
