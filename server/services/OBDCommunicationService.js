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

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const PIDParserService = require('./PIDParserService');

class OBDCommunicationService {
  constructor() {
    this.portPath = '/dev/ttyUSB0';
    this.port = null;
    this.parser = null;
    this.responses = [];
    this.isConnected = false;
    this.lastActivityTime = Date.now();
    this.pidParser = new PIDParserService();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      SerialPort.list().then(ports => {
        const obdPort = ports.find(p => p.path === this.portPath);
        if (!obdPort) {
          reject(new Error(`Porta ${this.portPath} non trovata`));
          return;
        }

        this.createSerialPort();

        this.port.open((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('ELM327 connesso alla porta seriale');
            this.isConnected = true;
            this.updateActivity();
            resolve();
          }
        });
      }).catch(reject);
    });
  }

  createSerialPort() {
    if (this.port) {
      try {
        if (this.port.isOpen) {
          this.port.removeAllListeners();
          this.port.close();
        }
      } catch (e) {
        console.warn('Errore durante la chiusura della porta precedente:', e.message);
      }
    }

    this.port = new SerialPort({
      path: this.portPath,
      baudRate: 38400,
      autoOpen: false
    });

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r' }));
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.port.on('error', (err) => {
      console.error(`Errore porta seriale: ${err.message}`);
      this.isConnected = false;
      this.updateActivity();
    });

    this.port.on('close', () => {
      console.log('🔌 Connessione OBD chiusa');
      this.isConnected = false;
      this.updateActivity();
    });

    this.parser.on('data', (line) => {
      const cleaned = line.trim();
      if (cleaned && cleaned !== '>') {
        this.responses.push(cleaned);
        this.updateActivity();
      }
    });
  }

  sendCommand(cmd) {
    if (!this.port || !this.port.isOpen) {
      throw new Error('Porta non aperta');
    }
    this.port.write(cmd + '\r');
    this.responses = [];
    this.updateActivity();
  }

  async waitForResponse(timeoutMs = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.responses.length > 0) {
        const response = this.responses[this.responses.length - 1];
        if (!response.includes('SEARCHING') && response !== '>') {
          this.updateActivity();
          return response;
        }
        if (response.includes('SEARCHING')) {
          await this.sleep(1000);
          continue;
        }
      }
      await this.sleep(100);
      
      if (!this.isConnected) {
        throw new Error('Connessione persa durante attesa risposta');
      }
    }
    throw new Error('Timeout - Nessuna risposta ricevuta');
  }

  async initialize() {
    console.log('Inizializzazione ELM327...');

    this.sendCommand('ATZ');
    try {
      await this.waitForResponse();
      console.log('Reset ELM327 completato');
    } catch (e) {
      console.warn('Reset ELM327 parziale:', e.message);
    }

    await this.sleep(2000);

    const commands = [
      { cmd: 'ATE0', desc: 'Echo off' },
      { cmd: 'ATL0', desc: 'Linefeeds off' },
      { cmd: 'ATS0', desc: 'Spaces off' },
      { cmd: 'ATSP0', desc: 'Auto protocol' }
    ];

    for (const {cmd, desc} of commands) {
      this.sendCommand(cmd);
      try {
        await this.waitForResponse(2000);
        console.log(`Comando inizializzazione eseguito: ${desc}`);
      } catch (e) {
        console.warn(`Timeout durante inizializzazione (${desc})`);
      }
      await this.sleep(300);
    }

    return true;
  }

  async readPID(pid, name) {
    try {
      if (!this.isConnected) {
        throw new Error('Non connesso');
      }

      this.sendCommand(pid);
      const response = await this.waitForResponse(5000);

      if (response.includes('STOPPED') || response.includes('7F')) {
        await this.wakeupECU();
        this.sendCommand(pid);
        const retryResponse = await this.waitForResponse(5000);
        return this.pidParser.parseResponse(pid, retryResponse, name);
      }

      return this.pidParser.parseResponse(pid, response, name);

    } catch (error) {
      console.error(`Errore lettura PID ${pid}: ${error.message}`);
      return {
        pid,
        name,
        value: null,
        unit: '',
        raw: error.message,
        success: false,
        error: true
      };
    }
  }

  async wakeupECU() {
    try {
      this.sendCommand('0100');
      await this.waitForResponse(2000);
    } catch (e) {
      // Ignora errori di risveglio
    }
    await this.sleep(300);
  }

  getPIDDefinitions() {
    return this.pidParser.getPIDDefinitions();
  }

  updateActivity() {
    this.lastActivityTime = Date.now();
  }

  getLastActivityTime() {
    return this.lastActivityTime;
  }

  disconnect() {
    if (this.port && this.port.isOpen) {
      try {
        this.port.removeAllListeners();
        this.port.close();
      } catch (e) {
        console.warn('Errore chiusura porta:', e.message);
      }
    }
    this.isConnected = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = OBDCommunicationService; 