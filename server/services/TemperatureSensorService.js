/*
 * PandaOS
 * Copyright (C) 2025  Cyberpandino
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

/**
 * Servizio per lettura sensore temperatura DS18B20
 * Utilizza protocollo 1-Wire su Raspberry Pi
 */

const fs = require('fs');
const path = require('path');
const gpioMapping = require('../config/gpio-mapping');

class TemperatureSensorService {
  constructor(webSocketService) {
    this.webSocketService = webSocketService;
    this.isInitialized = false;
    this.readInterval = null;
    this.sensorPath = null;
    this.lastTemperature = null;
    this.config = gpioMapping.temperature;
    
    this.initialize();
  }

  /**
   * Inizializza il sensore DS18B20
   * Auto-rileva il primo sensore se sensorId non è specificato
   */
  initialize() {
    if (!this.config.enabled) {
      console.log('Sensore temperatura DS18B20 disabilitato nella configurazione');
      return;
    }

    try {
      if (this.config.sensorId) {
        // Usa ID sensore specificato
        this.sensorPath = path.join(this.config.basePath, this.config.sensorId, 'w1_slave');
      } else {
        // Auto-rileva primo sensore DS18B20
        this.sensorPath = this.autoDetectSensor();
      }

      if (this.sensorPath && fs.existsSync(this.sensorPath)) {
        this.isInitialized = true;
        console.log(`Sensore temperatura DS18B20 trovato: ${this.sensorPath}`);
        
        // Leggi temperatura iniziale
        const initialTemp = this.readTemperature();
        if (initialTemp !== null) {
          console.log(`Temperatura esterna iniziale: ${initialTemp}°C`);
        }
      } else {
        console.warn('Sensore DS18B20 non trovato, funzionalità temperatura esterna disabilitata');
        this.isInitialized = false;
      }
    } catch (error) {
      console.warn('Errore inizializzazione sensore DS18B20:', error.message);
      console.warn('Modalità mock attivata per temperatura esterna');
      this.isInitialized = false;
    }
  }

  /**
   * Auto-rileva il primo sensore DS18B20 disponibile
   */
  autoDetectSensor() {
    try {
      const devices = fs.readdirSync(this.config.basePath);
      const sensor = devices.find(device => device.startsWith('28-'));
      
      if (sensor) {
        return path.join(this.config.basePath, sensor, 'w1_slave');
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Avvia lettura periodica della temperatura
   */
  startReading() {
    if (!this.config.enabled || this.readInterval) {
      return;
    }

    this.readInterval = setInterval(() => {
      const temperature = this.readTemperature();
      
      if (temperature !== null && temperature !== this.lastTemperature) {
        this.lastTemperature = temperature;
        this.notifyTemperature(temperature);
      }
    }, this.config.readInterval);

    console.log(`Lettura temperatura DS18B20 avviata (intervallo: ${this.config.readInterval}ms)`);
    
    // Leggi immediatamente
    const temperature = this.readTemperature();
    if (temperature !== null) {
      this.lastTemperature = temperature;
      this.notifyTemperature(temperature);
    }
  }

  /**
   * Ferma la lettura periodica
   */
  stopReading() {
    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null;
      console.log('Lettura temperatura DS18B20 fermata');
    }
  }

  /**
   * Legge la temperatura dal sensore DS18B20
   */
  readTemperature() {
    if (!this.isInitialized || !this.sensorPath) {
      return null;
    }

    try {
      const data = fs.readFileSync(this.sensorPath, 'utf8');
      const lines = data.split('\n');
      
      // Verifica CRC valido
      if (lines[0].indexOf('YES') === -1) {
        return null;
      }
      
      // Estrai temperatura dalla seconda riga
      const tempMatch = lines[1].match(/t=(\d+)/);
      if (tempMatch) {
        // Il valore è in millesimi di grado
        const tempC = parseInt(tempMatch[1]) / 1000;
        return Math.round(tempC * 10) / 10; // Arrotonda a 1 decimale
      }
      
      return null;
    } catch (error) {
      console.error('Errore lettura sensore DS18B20:', error.message);
      return null;
    }
  }

  /**
   * Notifica nuova temperatura via WebSocket
   */
  notifyTemperature(temperature) {
    const data = {
      timestamp: new Date().toISOString(),
      temperature: {
        external: temperature,
        unit: '°C',
        sensor: 'DS18B20'
      }
    };

    this.webSocketService.emitExternalTemperature(data);
    console.log(`Temperatura esterna: ${temperature}°C`);
  }

  /**
   * Restituisce l'ultima temperatura letta
   */
  getLastTemperature() {
    return this.lastTemperature;
  }

  /**
   * Verifica se il sensore è attivo
   */
  isActive() {
    return this.isInitialized && this.readInterval !== null;
  }
}

module.exports = TemperatureSensorService;

