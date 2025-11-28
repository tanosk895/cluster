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

class MonitoringService {
  /**
   * Gestisce il monitoraggio continuo dei PID e il watchdog di attività.
   * Non effettua più persistenza su database: invia solo dati via WebSocket.
   */
  constructor(obdService, webSocketService) {
    this.obdService = obdService;
    this.webSocketService = webSocketService;
    
    this.isMonitoring = false;
    this.watchdogInterval = null;
    this.maxInactivityTime = 30000; // 30 secondi
    this.maxMonitoringInactivity = 15000; // 15 secondi
    
    // Lista corrente dei PID funzionanti
    this.currentWorkingPIDs = [];
    this.currentMonitorPIDs = [];
  }


  async startMonitoring(workingPIDs) {
    if (workingPIDs.length === 0) {
      console.warn('Nessun PID funzionante disponibile per il monitoraggio');
      return;
    }

    console.log('Avvio monitoraggio continuo PID');
    this.isMonitoring = true;
    
    // Inizializza le liste dei PID
    this.updateWorkingPIDsInternal(workingPIDs);
    
    this.webSocketService.emitStatus({ 
      monitoring: true, 
      message: 'Monitoraggio attivo' 
    });

    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    while (this.isMonitoring && this.obdService.isConnected) {
      try {
        const data = {
          timestamp: new Date().toISOString(),
          monitoring: true,
          parameters: {}
        };

        // Usa la lista corrente che può essere aggiornata dinamicamente
        for (const pidInfo of this.currentMonitorPIDs) {
          const result = await this.obdService.readPID(pidInfo.pid, pidInfo.name);

          data.parameters[pidInfo.key] = {
            name: result.name,
            value: result.value,
            unit: result.unit,
            success: result.success,
            error: result.error,
            timestamp: result.timestamp
          };

          await this.sleep(50);
        }

        // Invia aggiornamenti live
        this.webSocketService.emitOBDLiveData(data);

        await this.sleep(300); // Delay tra le letture

      } catch (error) {
        console.error(`Errore durante monitoraggio: ${error.message}`);
      }
    }

    this.isMonitoring = false;
    this.webSocketService.emitStatus({ 
      monitoring: false, 
      message: 'Monitoraggio terminato' 
    });
  }

  /**
   * Aggiorna la lista dei PID funzionanti durante il monitoraggio
   * @param {Array} newWorkingPIDs - Nuova lista dei PID funzionanti
   */
  updateWorkingPIDs(newWorkingPIDs) {
    if (!this.isMonitoring) {
      return;
    }

    const previousCount = this.currentMonitorPIDs.length;
    this.updateWorkingPIDsInternal(newWorkingPIDs);
    const newCount = this.currentMonitorPIDs.length;

    if (newCount > previousCount) {
      const addedPIDs = newCount - previousCount;
      console.log(`Lista PID aggiornata: +${addedPIDs} PID aggiunti (totale: ${newCount})`);
      
      this.webSocketService.emitStatus({
        message: `PID aggiornati: ${addedPIDs} nuovi PID aggiunti`,
        monitoring_pids: newCount,
        added_pids: addedPIDs
      });
    } else if (newCount < previousCount) {
      const removedPIDs = previousCount - newCount;
      console.log(`Lista PID aggiornata: -${removedPIDs} PID rimossi (totale: ${newCount})`);
      
      this.webSocketService.emitStatus({
        message: `PID aggiornati: ${removedPIDs} PID rimossi`,
        monitoring_pids: newCount,
        removed_pids: removedPIDs
      });
    }
  }

  /**
   * Metodo interno per aggiornare le liste dei PID
   * @param {Array} workingPIDs - Lista dei PID funzionanti
   */
  updateWorkingPIDsInternal(workingPIDs) {
    this.currentWorkingPIDs = workingPIDs;
    
    // Seleziona i PID più importanti per il monitoraggio
    this.currentMonitorPIDs = workingPIDs.filter(p =>
      ['coolant_temp', 'rpm', 'speed', 'throttle_pos', 'manifold_pressure', 'engine_load', 'timing_advance', 'air_temp', 'short_fuel_trim_1', 'long_fuel_trim_1'].includes(p.key)
    );
  }

  /**
   * Controlla se un PID è attualmente monitorato
   * @param {string} pidKey - Chiave del PID da controllare
   * @returns {boolean} - true se il PID è già monitorato
   */
  isPIDCurrentlyMonitored(pidKey) {
    return this.currentWorkingPIDs.some(pid => pid.key === pidKey);
  }

  /**
   * Restituisce la lista corrente dei PID funzionanti
   * @returns {Array} - Lista dei PID funzionanti
   */
  getCurrentWorkingPIDs() {
    return [...this.currentWorkingPIDs];
  }

  /**
   * Restituisce la lista corrente dei PID in monitoraggio
   * @returns {Array} - Lista dei PID in monitoraggio
   */
  getCurrentMonitorPIDs() {
    return [...this.currentMonitorPIDs];
  }

  stopMonitoring() {
    console.log('Arresto monitoraggio PID');
    this.isMonitoring = false;
  }

  isMonitoringActive() {
    return this.isMonitoring;
  }

  stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MonitoringService; 