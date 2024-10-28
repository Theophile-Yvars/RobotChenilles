const express = require('express');
const Gpio = require('pigpio').Gpio;
const { exec } = require('child_process');

const app = express();

// Configuration des pins GPIO pour les moteurs
const motor1 = new Gpio(17, { mode: Gpio.OUTPUT });
const motor2 = new Gpio(27, { mode: Gpio.OUTPUT });

// Route pour accéder au flux vidéo
app.get('/video', (req, res) => {
  res.redirect('http://192.168.1.161:8080/?action=stream');
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

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
