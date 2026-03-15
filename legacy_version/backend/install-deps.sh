#!/bin/bash
set -e

echo "📦 Installation des dépendances Python3 avec versions figées..."

sudo apt update

sudo apt install -y \
  python3-flask=2.2.2-3 \
  python3-flask-cors=3.0.10-2 \
  python3-gpiozero=2.0.1-0+rpt1 \
  python3-opencv=4.6.0+dfsg-12 \
  python3-picamera2=0.3.30-1 \
  python3-rpi.gpio=0.7.1~a4-1+b4

echo "✅ Installation terminée"
