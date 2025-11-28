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
 * Servizio per lettura livello carburante
 * Utilizza ADC ADS1115 via I2C per misurare tensione galleggiante
 */

const gpioMapping = require('../config/gpio-mapping');

class FuelSensorService {
  constructor(webSocketService) {
    this.webSocketService = webSocketService;
    this.ads = null;
    this.isInitialized = false;
    this.readInterval = null;
    this.lastFuelLevel = null;
    this.config = gpioMapping.fuel;
    
    this.initialize();
  }

  /**
   * Inizializza ADC ADS1115
   */
  initialize() {
    if (!this.config.enabled) {
      console.log('Sensore carburante ADS1115 disabilitato nella configurazione');
      return;
    }

    try {
      // Import dinamico per evitare errori su piattaforme non-Raspberry
      const ADS1x15 = require('ads1x15');
      
      this.ads = new ADS1x15(this.config.chip);
      
      if (!this.ads.available()) {
        throw new Error('ADS1115 non disponibile - verifica collegamenti I2C (SDA/SCL)');
      }
      
      this.isInitialized = true;
      console.log('Sensore carburante ADS1115 inizializzato correttamente');
      
      // Leggi livello iniziale
      const initialLevel = this.readFuelLevel();
      if (initialLevel !== null) {
        console.log(`Livello carburante iniziale: ${initialLevel.toFixed(1)}%`);
      }
    } catch (error) {
      console.warn('Errore inizializzazione ADS1115:', error.message);
      console.warn('Modalità mock attivata per livello carburante');
      this.isInitialized = false;
    }
  }

  /**
   * Avvia lettura periodica livello carburante
   */
  startReading() {
    if (!this.config.enabled || this.readInterval) {
      return;
    }

    this.readInterval = setInterval(() => {
      this.performReading();
    }, this.config.readInterval);

    console.log(`Lettura carburante ADS1115 avviata (intervallo: ${this.config.readInterval}ms)`);
    
    // Leggi immediatamente
    this.performReading();
  }

  /**
   * Ferma la lettura periodica
   */
  stopReading() {
    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null;
      console.log('Lettura carburante ADS1115 fermata');
    }
  }

  /**
   * Esegue una lettura del livello carburante
   */
  performReading() {
    if (!this.isInitialized || !this.ads) {
      return;
    }

    this.ads.readADCSingleEnded(
      this.config.channel,
      this.config.gain,
      this.config.sampleRate,
      (err, adcValue) => {
        if (err) {
          console.error('Errore lettura ADC:', err.message);
          return;
        }

        const fuelLevel = this.processFuelReading(adcValue);
        
        if (fuelLevel !== null && Math.abs(fuelLevel - (this.lastFuelLevel || 0)) > 0.5) {
          this.lastFuelLevel = fuelLevel;
          this.notifyFuelLevel(fuelLevel, adcValue);
        }
      }
    );
  }

  /**
   * Elabora lettura ADC e calcola percentuale carburante
   */
  processFuelReading(adcValue) {
    try {
      // Converti millivolt → volt
      const vAdc = adcValue / 1000;
      
      // Applica formula partitore resistivo
      const { r1, r2 } = this.config.voltageDivider;
      const vReal = vAdc * ((r1 + r2) / r2);
      
      // Calcola percentuale con calibrazione
      const fuelPercent = this.voltageToFuelPercent(vReal);
      
      return fuelPercent;
    } catch (error) {
      console.error('Errore elaborazione lettura carburante:', error.message);
      return null;
    }
  }

  /**
   * Converte tensione in percentuale carburante
   * Usa curve di calibrazione definite in config
   */
  voltageToFuelPercent(voltage) {
    const { voltageEmpty, voltageFull } = this.config.calibration;
    
    const percent = ((voltage - voltageEmpty) / (voltageFull - voltageEmpty)) * 100;
    
    // Limita tra 0 e 100
    return Math.max(0, Math.min(100, percent));
  }

  /**
   * Notifica livello carburante via WebSocket
   */
  notifyFuelLevel(fuelPercent, rawAdcValue) {
    const data = {
      timestamp: new Date().toISOString(),
      fuel: {
        level: Math.round(fuelPercent * 10) / 10, // 1 decimale
        unit: '%',
        sensor: 'ADS1115',
        raw: {
          adc: rawAdcValue,
          voltage: (rawAdcValue / 1000) * ((this.config.voltageDivider.r1 + this.config.voltageDivider.r2) / this.config.voltageDivider.r2)
        }
      }
    };

    this.webSocketService.emitFuelLevel(data);
    console.log(`Livello carburante: ${fuelPercent.toFixed(1)}%`);
  }

  /**
   * Legge immediatamente il livello carburante (sincrono per API)
   */
  readFuelLevel() {
    if (!this.isInitialized || !this.ads) {
      return null;
    }

    try {
      // Lettura sincrona non disponibile con ads1x15, usa ultimo valore
      return this.lastFuelLevel;
    } catch (error) {
      return null;
    }
  }

  /**
   * Restituisce l'ultimo livello letto
   */
  getLastFuelLevel() {
    return this.lastFuelLevel;
  }

  /**
   * Verifica se il sensore è attivo
   */
  isActive() {
    return this.isInitialized && this.readInterval !== null;
  }

  /**
   * Calibrazione: aggiorna tensione vuoto/pieno
   */
  calibrate(isEmpty, voltage) {
    if (isEmpty) {
      this.config.calibration.voltageEmpty = voltage;
      console.log(`Calibrazione serbatoio vuoto: ${voltage}V`);
    } else {
      this.config.calibration.voltageFull = voltage;
      console.log(`Calibrazione serbatoio pieno: ${voltage}V`);
    }
  }
}

module.exports = FuelSensorService;

