#!/usr/bin/env bash

# Riattiva uscita HDMI
tvservice -p

# Disabilita power save sul WiFi per massime prestazioni
sudo iw dev wlan0 set power_save off

# Riaccende il servizio Bluetooth (se utilizzato)
sudo systemctl start bluetooth

# Imposta CPU in modalità ondemand (scaling dinamico)
echo 'ondemand' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Avvia l'app principale gestita da PM2
pm2 start carApp


