# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Architecture

RobotChenilles is a Raspberry Pi-based robot control system with a React frontend and Python Flask backend architecture:

### Backend (`backend/`)
- **Flask API Server** (`main.py`): Central REST API serving robot control endpoints
- **Motor Control** (`motors.py`): GPIO-based motor control using `gpiozero` library for two-motor tank-style movement
- **Camera System** (`camera.py`): Pi Camera streaming with stepper motor-controlled tilt mechanism using `picamera2` and `RPi.GPIO`
- **Temperature Monitoring** (`temperature.py`): DS18B20 1-Wire temperature sensor interface via shell script

### Frontend (`frontend/`)
- **React Application**: Single-page app with three main components
- **Real-time Video Stream**: Direct MJPEG stream consumption from backend
- **Keyboard Controls**: Arrow keys for movement, A/Q keys for camera tilt
- **Live Temperature Display**: Polling-based temperature monitoring

### Communication Flow
1. Frontend sends HTTP requests to backend API (hardcoded to `192.168.1.127:5000`)
2. Backend translates API calls to GPIO operations for motors and camera
3. Video stream flows directly from backend to frontend via MJPEG over HTTP
4. Temperature data retrieved via shell script executing 1-Wire bus reads

## Development Commands

### Backend Development
```bash
# Install Python dependencies (on Raspberry Pi)
cd backend && bash install-deps.sh

# Run development server
cd backend && python3 main.py

# Install as systemd service
sudo cp robot-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable robot-backend.service
sudo systemctl start robot-backend.service

# Check service status
sudo systemctl status robot-backend.service

# View service logs
sudo journalctl -u robot-backend.service -f

# Test temperature sensor directly
bash backend/read_temp.sh
```

### Frontend Development
```bash
# Install Node.js dependencies
cd frontend && npm install

# Start development server
cd frontend && npm start

# Run tests
cd frontend && npm test

# Build for production
cd frontend && npm run build

# Build Docker image
cd frontend && bash build.sh

# Deploy with Docker stack
cd frontend && docker stack deploy -c docker-compose.yml myrobot
```

### Deployment Commands
```bash
# Build and deploy frontend container
cd frontend
bash build.sh
docker stack deploy -c docker-compose.yml myrobot

# Check deployed services
docker service ls
docker service logs myrobot_frontend
```

## Hardware Configuration

### GPIO Pin Assignments
- **Motors**: Left motor (forward: GPIO13, backward: GPIO26), Right motor (forward: GPIO16, backward: GPIO12)
- **Camera Stepper**: GPIO pins 14, 15, 18, 23 for 4-phase stepper motor control
- **Temperature Sensor**: 1-Wire DS18B20 on device `28-00000a29354b`

### Network Configuration
- Backend API runs on port 5000
- Frontend expects backend at `192.168.1.127:5000`
- Frontend container exposes port 80, mapped to host port 3000
- Traefik reverse proxy configured for `myrobot.theophile-yvars.com`

## Key Implementation Details

### Motor Control Pattern
Uses differential steering where `left()` and `right()` commands rotate the robot in place by running motors in opposite directions.

### Camera Streaming
Implements MJPEG streaming using OpenCV with vertical flip applied to frames. Camera tilt uses 8-step stepper motor sequence with configurable step count and delay.

### Error Handling
Temperature sensor includes fallback error messages for sensor detection failures and read errors. Motor and camera commands return JSON status responses.

### CORS Configuration
Backend configured to accept requests from `http://localhost:3000` for development, but frontend is hardcoded to production IP for deployment.

## File Structure Notes
- `robot-backend.service` contains absolute paths that need updating when deploying to different systems
- `frontend/docker-compose.yml` includes Traefik labels for reverse proxy setup
- Temperature sensor device path is hardcoded in `read_temp.sh` and may need adjustment for different sensors
