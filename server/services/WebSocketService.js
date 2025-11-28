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

const socketIo = require('socket.io');

class WebSocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.clients = new Set();
    this.lastData = {};
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connesso: ${socket.id}`);
      this.clients.add(socket);

      if (Object.keys(this.lastData).length > 0) {
        socket.emit('obd-data', this.lastData);
      }

      socket.on('disconnect', () => {
        console.log(`Client disconnesso: ${socket.id}`);
        this.clients.delete(socket);
      });

      socket.on('force-restart', () => {
        console.log('Riavvio forzato richiesto dal client');
        this.emit('force-restart');
      });
    });
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }

  emitStatus(statusData) {
    this.broadcast('status', {
      timestamp: new Date().toISOString(),
      ...statusData
    });
  }

  emitOBDData(data) {
    this.lastData = data;
    this.broadcast('obd-data', data);
  }

  emitOBDLiveData(data) {
    this.lastData = {...this.lastData, ...data};
    this.broadcast('obd-live', data);
  }

  /**
   * Emette stato spie GPIO
   */
  emitWarnings(data) {
    this.broadcast('gpio-warnings', data);
  }

  /**
   * Emette temperatura esterna da sensore DS18B20
   */
  emitExternalTemperature(data) {
    this.broadcast('external-temperature', data);
  }

  /**
   * Emette livello carburante da sensore ADS1115
   */
  emitFuelLevel(data) {
    this.broadcast('fuel-level', data);
  }

  emitError(error) {
    this.broadcast('error', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  getClientCount() {
    return this.clients.size;
  }

  getLastData() {
    return this.lastData;
  }

  on(event, callback) {
    this.io.on(event, callback);
  }

  emit(event, data) {
    this.io.emit(event, data);
  }

  sendInitialStatus(socket, statusData) {
    socket.emit('status', {
      timestamp: new Date().toISOString(),
      ...statusData
    });
  }
}

module.exports = WebSocketService;
