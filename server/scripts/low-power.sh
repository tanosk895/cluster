#!/usr/bin/env bash

# Disattiva uscita HDMI per ridurre consumi
tvservice -o

# Abilita power save sul WiFi (resta comunque in ascolto)
sudo iw dev wlan0 set power_save on

# Spegne il servizio Bluetooth
sudo systemctl stop bluetooth

# Spegne i LED integrati del Raspberry Pi
echo 0 | sudo tee /sys/class/leds/led0/brightness
echo 0 | sudo tee /sys/class/leds/led1/brightness

# Imposta CPU in modalità powersave (frequenza minima)
echo 'powersave' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Ferma l'app principale gestita da PM2
pm2 stop carApp


