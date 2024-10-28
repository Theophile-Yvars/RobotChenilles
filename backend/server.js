const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const Gpio = require('pigpio').Gpio;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuration des pins GPIO pour les moteurs
const motor1 = new Gpio(17, { mode: Gpio.OUTPUT });
const motor2 = new Gpio(27, { mode: Gpio.OUTPUT });

// Route pour accéder au flux vidéo
app.get('/video', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Route pour contrôler le robot
app.get('/move', (req, res) => {
  const front = req.query.front === 'true';
  const back = req.query.back === 'true';
  const left = req.query.left === 'true';
  const right = req.query.right === 'true';

  let motor1Speed = 0;
  let motor2Speed = 0;

  if (front) {
    motor1Speed = 255;
    motor2Speed = 255;
  }
  if (back) {
    motor1Speed = -255;
    motor2Speed = -255;
  }
  if (left) {
    motor1Speed = -255;
    motor2Speed = 255;
  }
  if (right) {
    motor1Speed = 255;
    motor2Speed = -255;
  }

  motor1.pwmWrite(motor1Speed);
  motor2.pwmWrite(motor2Speed);

  res.send(`Moving with front: ${front}, back: ${back}, left: ${left}, right: ${right}`);
});

// Diffusion du flux vidéo via WebSocket
io.on('connection', (socket) => {
  console.log('New client connected');

  const command = ffmpeg('/dev/video0')
    .inputFormat('v4l2')
    .videoCodec('libx264')
    .format('mpegts')
    .on('start', (commandLine) => {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('error', (err) => {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', () => {
      console.log('Processing finished !');
    })
    .on('data', (data) => {
      socket.emit('video', data);
    })
    .run();

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    command.kill();
  });
});

// Démarrage du serveur
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
