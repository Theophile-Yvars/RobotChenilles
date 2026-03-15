# Installation et Configuration du Workspace

Ce guide détaille les étapes pour cloner, configurer et compiler le projet Robot Chenilles sur une Raspberry Pi 5 tournant sous ROS 2 Jazzy.

## 1. Structure du Workspace
Le projet utilise la structure standard de ROS 2. Nous allons cloner ton dépôt GitHub directement dans le dossier source.

```bash
# Création du dossier racine
mkdir -p ~/robot_ws/src
cd ~/robot_ws/src
# Clonage du projet
git clone https://github.com/Theophile-Yvars/RobotChenilles.git .
```

## 2. Installation des dépendances

Avant de compiler, il faut s'assurer que toutes les bibliothèques C++ et Python nécessaires sont présentes.

```bash
cd ~/robot_ws/src
sudo rosdep init
rosdep update
rosdep install --from-paths src --ignore-src -r -y
```

## 3. Compilation optimisée pour Pi 5
La Raspberry Pi 5 possède 4 cœurs performants. On utilise le flag --parallel-workers pour accélérer la compilation et --symlink-install pour éviter de recompiler à chaque modification de script Python ou de fichier Launch.

```bash
# Depuis ~/robot_ws/src
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



1. Installe Miniforge (le moteur de l'environnement) :

Bash
curl -L https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-aarch64.sh -o miniforge.sh
bash miniforge.sh -b -p $HOME/miniforge
~/miniforge/bin/conda init bash
source ~/.bashrc
2. Crée l'environnement ROS 2 Humble :

Bash
conda create -n ros_env ros-humble-desktop python=3.10 -c robostack-humble -c conda-forge --no-channel-priority -y
conda activate ros_env
3. Installe les briques de ton robot dans cet environnement :

Bash
conda install ros-humble-cv-bridge ros-humble-rosbridge-suite ros-humble-vision-msgs -c robostack-humble -y
4. Compile ton projet :

Bash
cd ~/robot_ws
# On nettoie les vieux essais ratés
rm -rf build install log
# On build proprement
colcon build --symlink-install
📸 Le point crucial : Ta caméra (Encore !)



Preparing transaction: done
Verifying transaction: done
Executing transaction: -
/
\
done
#
# To activate this environment, use
#
#     $ conda activate ros_env
#
# To deactivate an active environment, use
#
#     $ conda deactivate

(base) yvars@yvars:~/robot_ws $
















