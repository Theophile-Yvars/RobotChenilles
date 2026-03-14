# Nodes Externes du Projet
Pour que le robot communique avec le Dashboard React, nous utilisons des outils standards de la communauté ROS 2.

1. Rosbridge Suite (Le Pont de Données)
Rôle : Permet au Dashboard Web d'envoyer des commandes (moteurs, caméra) et de recevoir des données (température) via des WebSockets. C'est le traducteur entre le monde Web (JSON) et le monde ROS (Messages).

Installation :

```bash
sudo apt install ros-jazzy-rosbridge-suite
```
* Port utilisé : 9090

## 2. Web Video Server (Le Pont Vidéo)
Rôle : Convertit les flux d'images ROS (sensor_msgs/Image) en un flux MJPEG fluide. Cela permet au navigateur d'afficher la vidéo avec une simple balise <img /> sans consommer trop de ressources.

Installation : (Recommandé via aptitude pour la gestion des dépendances sur Ubuntu Noble)

```bash
sudo aptitude install ros-jazzy-web-video-server
```
* Port utilisé : 8080

## 3. Camera ROS (Le Pilote Caméra pour Pi 5)
Rôle : Capture les images du capteur de la Raspberry Pi 5. Contrairement au pilote standard, celui-ci utilise la bibliothèque libcamera indispensable pour gérer l'ISP (processeur d'image) de la Pi 5 et éviter les erreurs de format.

Installation : (Nécessite aptitude pour résoudre les conflits libudev)

```bash
sudo aptitude install ros-jazzy-camera-ros
```