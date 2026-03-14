# Nodes Externes du Projet
Pour que le robot communique avec le Dashboard React, nous utilisons des outils standards de la communauté ROS 2.

## 1. Rosbridge Suite (Le Pont de Données)
Rôle : Permet au Dashboard Web d'envoyer des commandes (moteurs, caméra) et de recevoir des données (température) via des WebSockets.

Installation :

```bash
sudo apt install ros-jazzy-rosbridge-suite
```
* Port utilisé : 9090

## 2. Web Video Server (Le Pont Vidéo)
Rôle : Convertit les flux d'images ROS (sensor_msgs/Image) en un flux MJPEG lisible par n'importe quel navigateur via une balise <img>.

Installation : (Via aptitude pour régler les conflits de librairies)

```bash
sudo aptitude install ros-jazzy-web-video-server
```
* Port utilisé : 8080

## 3. V4L2 Camera (Le Pilote Caméra)
Rôle : Capture les images réelles de ta caméra USB ou Raspberry Pi et les publie sur le topic /image_raw.

Installation :

```bash
sudo apt install ros-jazzy-v4l2-camera
```