#!/bin/bash
CAPTEUR_PATH="/sys/bus/w1/devices/28-00000a29354b/w1_slave"
if [ -f "$CAPTEUR_PATH" ]; then
	TEMP_DATA=$(cat "$CAPTEUR_PATH")
	if [[ "$TEMP_DATA" == *"YES"* ]]; then
		TEMP_RAW=$(echo "$TEMP_DATA" | grep "t=" | cut -d"=" -f2)
		TEMP_C=$(echo "scale=3; $TEMP_RAW / 1000" | bc)
		echo $TEMP_C
	else
		echo "Erreur de lecture du capteur"
	fi
else
	echo "Capteur non détecté"
fi
