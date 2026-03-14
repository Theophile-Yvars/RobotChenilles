# Architecture


| Node| Type| Rôle Principal| 
| :--- | :--- | :--- |
| v4l2_camera | Pilote | Capture la vidéo -> /image_raw | 
| brain_node | Ton Code | Analyse /image_raw -> /image_processed | 
| web_video_server | Serveur | /image_processed -> Flux HTTP (Dashboard) | 
| rosbridge | Serveur | Transfert Topic (JSON) <-> WebSocket (React) | 
| temp_node | Ton Code | Lecture Capteur -> /tempSensor | 
| motor_node | Ton Code | Commande Moteurs <- /cmd_vel | 
