import subprocess
from flask import jsonify

def read_temperature():
    try:
        result = subprocess.run(
            ["/home/pi/read_temp.sh"],
            capture_output=True,
            text=True,
            check=True
        )
        temperature_output = result.stdout.strip()
        if "Erreur" in temperature_output or "non detecte" in temperature_output:
            return jsonify({"error": temperature_output}), 404
        else:
            temperature = float(temperature_output)
            return jsonify({"temperature": round(temperature, 2), "unit": "Â°C"}), 200
    except subprocess.CalledProcessError:
        return jsonify({"error": "Erreur lors de la lecture du capteur"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
