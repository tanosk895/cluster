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

const OBDServer = require('./services/OBDServer');

// Inizializza il server OBD
const obdServer = new OBDServer();

// Avvia il server con delay
setTimeout(() => {
  obdServer.start();
}, 2000);

process.on('SIGINT', () => {
  console.log('\nChiusura servizio richiesta (SIGINT)');
  obdServer.stop();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  obdServer.forceRestart();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  obdServer.forceRestart();
});

// Export per compatibilità
module.exports = { obdServer };