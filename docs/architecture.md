# Architecture


| Node | Type | Rôle Principal |
| :--- | :--- | :--- |
| **v4l2_camera** | Pilote | Capture le flux de l'OV5647 -> `/image_raw` |
| **brain_node** | Ton Code | Analyse `/image_raw` -> `/image_processed` |
| **web_video_server** | Serveur | `/image_processed` -> Flux HTTP port 8080 (Dashboard) |
| **rosbridge** | Serveur | Transfert Topics (JSON) <-> WebSocket port 9090 (React) |
| **temp_node** | Ton Code | Lecture physique du DS18B20 -> `/tempSensor` |
| **motor_node** | Ton Code | Traduction des commandes <- `/cmd_vel` vers les moteurs |
| **camera_tilt** | Ton Code | Contrôle du moteur pas-à-pas pour l'inclinaison caméra |
