# Temperature setup

In the config file :

```bash
sudo nano /boot/firmware/config.txt
```

Add the following ligne

```text
dtoverlay=w1-gpio,gpiopin=4
```

## See the sensor 

```bash
ls /sys/bus/w1/devices/
```

## Read the sensor

```bash
ls /sys/bus/w1/devices/
```

Exemple : 

```text
72 01 4b 46 7f ff 0e 10 57 : crc=57 YES
72 01 4b 46 7f ff 0e 10 57 t=23125
```

Divide 23125 / 1000. So the currently temp is 23.1°C