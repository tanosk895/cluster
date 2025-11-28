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
 * Servizio per gestione stato quadro accensione (ignition)
 * Utilizza un optoaccoppiatore collegato a un pin GPIO dedicato.
 *
 * Quando il quadro viene SPENTO/ACCESO:
 * - esegue script di low-power / wake definiti in configurazione
 */

const { exec } = require('child_process');
const gpioMapping = require('../config/gpio-mapping');

class IgnitionService {
  constructor(webSocketService) {
    this.webSocketService = webSocketService;
    this.gpio = null;
    this.isInitialized = false;
    this.currentState = null; // 'ON' | 'OFF' | null
    this.config = gpioMapping.ignition;

    this.initialize();
  }

  /**
   * Inizializza pin GPIO per il rilevamento quadro
   */
  initialize() {
    if (!this.config || !this.config.enabled) {
      return;
    }

    try {
      const Gpio = require('onoff').Gpio;

      this.gpio = new Gpio(this.config.pin, 'in', 'both', {
        debounceTimeout: gpioMapping.config.debounceTime,
      });

      // Imposta stato iniziale
      const initialValue = this.safeRead();
      if (initialValue !== null) {
        this.handleValueChange(initialValue, true);
      }

      // Listener cambiamenti quadro
      this.gpio.watch((err, value) => {
        if (err) {
          console.error('Errore lettura GPIO ignition:', err.message);
          return;
        }
        this.handleValueChange(value, false);
      });

      this.isInitialized = true;
      console.log(
        `IgnitionService inizializzato su GPIO ${this.config.pin} (activeOn=${this.config.activeOn})`
      );
    } catch (error) {
      console.warn('Modulo GPIO non disponibile per IgnitionService:', error.message);
      this.isInitialized = false;
    }
  }

  /**
   * Lettura protetta del pin
   */
  safeRead() {
    try {
      return this.gpio.readSync();
    } catch {
      return null;
    }
  }

  /**
   * Gestisce cambio valore GPIO (0/1)
   */
  handleValueChange(value, isInitial) {
    const isOn = this.config.activeOn === value;
    const newState = isOn ? 'ON' : 'OFF';

    // Evita azioni duplicate se lo stato non è cambiato
    if (!isInitial && newState === this.currentState) {
      return;
    }

    this.currentState = newState;

    if (isOn) {
      console.log('🔥 QUADRO ACCESO — Wake Mode');
      this.executeScript(this.config.scripts.wake);
    } else {
      console.log('💤 QUADRO SPENTO — Low Power Mode');
      this.executeScript(this.config.scripts.lowPower);
    }

    this.emitIgnitionState(isOn);
  }

  /**
   * Esegue script di sistema configurato
   */
  executeScript(scriptPath) {
    if (!scriptPath) {
      return;
    }

    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Errore esecuzione script ignition (${scriptPath}):`, error.message);
        return;
      }

      if (stdout) {
        console.log(`Ignition script output (${scriptPath}):`, stdout.trim());
      }
      if (stderr) {
        console.error(`Ignition script stderr (${scriptPath}):`, stderr.trim());
      }
    });
  }

  /**
   * Notifica stato quadro via WebSocket
   */
  emitIgnitionState(isOn) {
    if (!this.webSocketService || typeof this.webSocketService.broadcast !== 'function') {
      return;
    }

    this.webSocketService.broadcast('ignition-state', {
      timestamp: new Date().toISOString(),
      ignition: {
        on: isOn,
        state: isOn ? 'ON' : 'OFF',
      },
    });
  }

  /**
   * Rilascia le risorse GPIO
   */
  cleanup() {
    if (this.gpio) {
      try {
        this.gpio.unwatchAll();
        this.gpio.unexport();
      } catch {
        // Ignora errori di cleanup
      }
      this.gpio = null;
    }
  }
}

module.exports = IgnitionService;


