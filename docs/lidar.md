# Documentation du Setup : Robot Cartographe (ROS 2 Jazzy)

## 1. Architecture du Système
* Robot (Pi) : Produit les données brutes (Lidar) et calcule la carte (SLAM).
* PC (Ubuntu) : Affiche la carte (RViz2) et réveille le cerveau du robot.
* Lien : WiFi via le protocole DDS (Domain ID 42).

## 2. Configuration Environnementale (Variables)
Pour que les deux machines se "voient", elles doivent partager le même canal.
| Variable | Valeur | Rôle |
| :--- | :--- | :--- |
| **ROS_DOMAIN_ID** | 42 | Canal de communication unique (le "talkie-walkie"). |
| **ROS_LOCALHOST_ONLY** | 0 | Autorise les données à sortir sur le réseau WiFi. |
| **use_sim_time** | false | Force l'utilisation de l'horloge réelle de la Pi. |

## 3. Procédure de Lancement (Ordre Critique)

🟦 ÉTAPE A : Synchronisation temporelle (Depuis le PC)

Indispensable pour que le SLAM accepte les données du Lidar.

```bash
ssh NAME@IP_PI "sudo date -s '$(date +'%Y-%m-%d %H:%M:%S')'"
```

🟩 ÉTAPE B : Sur la Raspberry Pi (Docker)

Ouvre 3 terminaux différents dans ton container : docker exec -ti robotchenilles bash.

### Terminal 1 : Driver LiDAR

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=42
sudo chmod 777 /dev/ttyUSB0
ros2 launch ldlidar_stl_ros2 ld19.launch.py
```

### Terminal 2 : Transformation Odométrie (Le lien fixe)

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=42
ros2 run tf2_ros static_transform_publisher --x 0 --y 0 --z 0 --yaw 0 --pitch 0 --roll 0 --frame-id odom --child-frame-id base_link
```

### Terminal 3 : Slam Toolbox (Le Cerveau)

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=42
ros2 run slam_toolbox async_slam_toolbox_node --ros-args \
  -p use_sim_time:=false \
  -p odom_frame:=odom \
  -p base_frame:=base_link \
  -p map_frame:=map \
  -p scan_topic:=/scan \
  -p transform_timeout:=0.1
```

🟧 ÉTAPE C : Sur le PC Ubuntu (Visualisation)

### Terminal 4 : Activation et RViz

```bash
source /opt/ros/jazzy/setup.bash
export ROS_DOMAIN_ID=42
export ROS_LOCALHOST_ONLY=0

# Réveil du SLAM (Lifecycle)
ros2 lifecycle set /slam_toolbox configure
ros2 lifecycle set /slam_toolbox activate

# Lancement de l'interface
rviz2
```

## 4. Configuration de RViz2 (Checklist)

Pour voir la carte, règle ces paramètres dans la colonne de gauche de RViz :

1. Global Options → Fixed Frame: map
2. Add by Topic → /map :
  * Durability Policy : Transient Local
  * Reliability Policy : Best Effort
3. Add by Topic → /scan :
* Reliability Policy : Best Effort
4. Add by Display Type → TF (pour voir les axes du robot).

## 5. Sauvegarde de la Carte

Une fois la pièce scannée, retourne sur la Pi et lance :

```bash
ros2 run nav2_map_server map_saver_cli -f ~/map_finale
```
Cela génère map_finale.yaml et map_finale.pgm.

--- 

💡 Astuce : Automatisation (Le .bashrc)
Pour éviter de taper les exports à chaque fois, ajoute-les à ton fichier ~/.bashrc sur ton PC et dans ton Docker :
```bash
echo "source /opt/ros/jazzy/setup.bash" >> ~/.bashrc
echo "export ROS_DOMAIN_ID=42" >> ~/.bashrc
echo "export ROS_LOCALHOST_ONLY=0" >> ~/.bashrc
```
