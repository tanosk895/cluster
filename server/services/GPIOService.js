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
 * Servizio per gestione GPIO Raspberry Pi
 * Lettura stato spie veicolo tramite optoaccoppiatori
 */

const gpioMapping = require('../config/gpio-mapping');

class GPIOService {
  constructor(webSocketService) {
    this.webSocketService = webSocketService;
    this.gpio = null;
    this.isInitialized = false;
    this.pollingInterval = null;
    this.warningStates = {};
    this.pinToWarning = gpioMapping.getPinToWarningMap();
    
    this.initializeGPIO();
  }

  /**
   * Inizializza il modulo GPIO
   * Utilizza onoff su Raspberry Pi, mock su altre piattaforme
   */
  initializeGPIO() {
    try {
      // Tenta import del modulo onoff (disponibile solo su Raspberry Pi)
      const Gpio = require('onoff').Gpio;
      
      this.gpio = {};
      const allPins = gpioMapping.getAllPins();
      
      // Configura ogni pin come input con pull-down
      allPins.forEach(pinNumber => {
        try {
          this.gpio[pinNumber] = new Gpio(pinNumber, 'in', 'both', {
            debounceTimeout: gpioMapping.config.debounceTime
          });
          
          // Inizializza stato
          const warningKey = this.pinToWarning[pinNumber];
          this.warningStates[warningKey] = false;
          
        } catch (error) {
          console.error(`Errore configurazione GPIO pin ${pinNumber}:`, error.message);
        }
      });
      
      this.isInitialized = true;
      console.log(`GPIO inizializzato: ${allPins.length} pin configurati`);
      
    } catch (error) {
      console.warn('Modulo GPIO non disponibile (non su Raspberry Pi), usando modalità mock');
      this.isInitialized = false;
      this.initializeMockGPIO();
    }
  }

  /**
   * Modalità mock per sviluppo su piattaforme non-Raspberry
   */
  initializeMockGPIO() {
    Object.keys(gpioMapping.mapping).forEach(warningKey => {
      this.warningStates[warningKey] = false;
    });
  }

  /**
   * Avvia il polling continuo dei GPIO
   */
  startPolling() {
    if (this.pollingInterval) {
      return;
    }

    this.pollingInterval = setInterval(() => {
      this.readAllPins();
    }, gpioMapping.config.pollingInterval);

    console.log(`GPIO polling avviato (intervallo: ${gpioMapping.config.pollingInterval}ms)`);
  }

  /**
   * Ferma il polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('GPIO polling fermato');
    }
  }

  /**
   * Legge lo stato di tutti i pin GPIO configurati
   */
  readAllPins() {
    if (!this.isInitialized) {
      return;
    }

    const changes = [];

    Object.entries(this.pinToWarning).forEach(([pin, warningKey]) => {
      try {
        const value = this.gpio[pin].readSync();
        const isActive = value === 1;
        
        // Rileva cambiamenti di stato
        if (this.warningStates[warningKey] !== isActive) {
          this.warningStates[warningKey] = isActive;
          changes.push({
            warning: warningKey,
            state: isActive,
            pin: parseInt(pin),
            name: gpioMapping.mapping[warningKey].name
          });
        }
      } catch (error) {
        console.error(`Errore lettura GPIO pin ${pin}:`, error.message);
      }
    });

    // Notifica cambiamenti via WebSocket
    if (changes.length > 0) {
      this.notifyChanges(changes);
    }
  }

  /**
   * Notifica cambiamenti di stato via WebSocket
   */
  notifyChanges(changes) {
    const timestamp = new Date().toISOString();
    
    changes.forEach(change => {
      console.log(`Spia ${change.name}: ${change.state ? 'ACCESA' : 'SPENTA'}`);
    });

    // Invia stato completo aggiornato
    this.webSocketService.emitWarnings({
      timestamp,
      warnings: this.warningStates,
      changes
    });
  }

  /**
   * Restituisce lo stato corrente di tutte le spie
   */
  getAllWarningStates() {
    return { ...this.warningStates };
  }

  /**
   * Cleanup e rilascio risorse GPIO
   */
  cleanup() {
    this.stopPolling();

    if (this.isInitialized && this.gpio) {
      Object.values(this.gpio).forEach(pin => {
        try {
          pin.unexport();
        } catch (error) {
          // Ignora errori di cleanup
        }
      });
    }

    console.log('GPIO cleanup completato');
  }

  /**
   * Verifica se il servizio è attivo
   */
  isActive() {
    return this.pollingInterval !== null;
  }
}

module.exports = GPIOService;

