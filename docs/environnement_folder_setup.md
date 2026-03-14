# Installation et Configuration du Workspace

Ce guide détaille les étapes pour cloner, configurer et compiler le projet Robot Chenilles sur une Raspberry Pi 5 tournant sous ROS 2 Jazzy.

## 1. Structure du Workspace
Le projet utilise la structure standard de ROS 2. Nous allons cloner ton dépôt GitHub directement dans le dossier source.

```bash
# Création du dossier racine
mkdir -p ~/RobotChenilles/ros2_ws/src
cd ~/RobotChenilles/ros2_ws/src
# Clonage du projet
git clone https://github.com/Theophile-Yvars/RobotChenilles.git .
```

## 2. Installation des dépendances

Avant de compiler, il faut s'assurer que toutes les bibliothèques C++ et Python nécessaires sont présentes.

```bash
cd ~/RobotChenilles/ros2_ws/
sudo rosdep init
rosdep update
rosdep install --from-paths src --ignore-src -r -y
```

## 3. Compilation optimisée pour Pi 5
La Raspberry Pi 5 possède 4 cœurs performants. On utilise le flag --parallel-workers pour accélérer la compilation et --symlink-install pour éviter de recompiler à chaque modification de script Python ou de fichier Launch.

```bash
# Depuis ~/RobotChenilles/ros2_ws/
colcon build --symlink-install --parallel-workers 4
```

## 4. Automatisation de l'environnement (Bashrc)

Pour que ton terminal reconnaisse les commandes du robot à chaque connexion SSH, ajoute ces lignes à ton fichier ~/.bashrc :

```bash
# Ajout des sources au bashrc
echo "source /opt/ros/jazzy/setup.bash" >> ~/.bashrc
echo "source ~/RobotChenilles/ros2_ws/install/setup.bash" >> ~/.bashrc

# Application immédiate
source ~/.bashrc
```
