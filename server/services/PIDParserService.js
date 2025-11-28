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

class PIDParserService {
  constructor() {
    this.pidDefinitions = this.initializePIDDefinitions();
  }

  initializePIDDefinitions() {
    return [
      { pid: '0100', name: 'PID Supportati (01-20)', key: 'supported_pids_01_20' },
      { pid: '0101', name: 'Monitor Status', key: 'monitor_status' },
      { pid: '0103', name: 'Fuel System Status', key: 'fuel_system_status' },
      { pid: '0104', name: 'Calculated Engine Load', key: 'engine_load' },
      { pid: '0105', name: 'Temperatura Refrigerante', key: 'coolant_temp' },
      { pid: '0106', name: 'Short Term Fuel Trim Bank 1', key: 'short_fuel_trim_1' },
      { pid: '0107', name: 'Long Term Fuel Trim Bank 1', key: 'long_fuel_trim_1' },
      { pid: '010B', name: 'Pressione Collettore', key: 'manifold_pressure' },
      { pid: '010C', name: 'Regime Motore', key: 'rpm' },
      { pid: '010D', name: 'Velocità Veicolo', key: 'speed' },
      { pid: '010E', name: 'Timing Advance', key: 'timing_advance' },
      { pid: '010F', name: 'Temperatura Aria', key: 'air_temp' },
      { pid: '0111', name: 'Posizione Farfalla', key: 'throttle_pos' },
      { pid: '0113', name: 'Oxygen Sensors Present', key: 'oxygen_sensors_present' },
      { pid: '0114', name: 'Oxygen Sensor 1 Bank 1', key: 'oxygen_sensor_1_1' },
      { pid: '0115', name: 'Oxygen Sensor 2 Bank 1', key: 'oxygen_sensor_2_1' },
      { pid: '011C', name: 'OBD Standards', key: 'obd_standards' },
      { pid: '0120', name: 'PID Supportati (21-40)', key: 'supported_pids_21_40' },
      { pid: '0121', name: 'Distance with MIL On', key: 'distance_with_mil_on' }
    ];
  }

  getPIDDefinitions() {
    return this.pidDefinitions;
  }

  parseResponse(pid, response, name) {
    const result = {
      pid,
      name,
      value: null,
      unit: '',
      raw: response,
      success: false,
      error: false,
      timestamp: new Date().toISOString()
    };

    if (!response || response.includes('NO DATA') || response.includes('ERROR')) {
      result.error = true;
      result.value = 'NON_SUPPORTATO';
      return result;
    }

    if (response.includes('STOPPED') || response.includes('7F')) {
      result.error = true;
      result.value = 'ECU_DORMIENTE';
      return result;
    }

    const cleanResponse = response.replace(/>/g, '').trim();
    const bytes = this.parseBytes(cleanResponse);

    if (bytes.length < 2 || bytes[0] !== '41') {
      result.error = true;
      result.value = 'FORMATO_ERRATO';
      return result;
    }

    try {
      result.success = true;
      this.parsePIDValue(pid, bytes, result);
    } catch (error) {
      result.error = true;
      result.value = 'ERRORE_PARSING';
      result.success = false;
    }

    return result;
  }

  parseBytes(cleanResponse) {
    if (cleanResponse.includes(' ')) {
      return cleanResponse.split(' ').filter(b => b.length === 2);
    } else {
      const bytes = [];
      for (let i = 0; i < cleanResponse.length; i += 2) {
        if (i + 1 < cleanResponse.length) {
          bytes.push(cleanResponse.substr(i, 2));
        }
      }
      return bytes;
    }
  }

  parsePIDValue(pid, bytes, result) {
    switch(pid) {
      case '0100':
      case '0120':
      case '0140':
        result.value = this.decodeSupportedPIDs(bytes);
        result.unit = 'bitmap';
        break;

      case '0101':
        result.value = this.decodeMonitorStatus(bytes);
        result.unit = 'status';
        break;

      case '0102':
        if (bytes.length >= 3) {
          result.value = bytes[2];
          result.unit = 'DTC';
        }
        break;

      case '0103':
        if (bytes.length >= 3) {
          const status = parseInt(bytes[2], 16);
          result.value = this.decodeFuelSystemStatus(status);
          result.unit = 'status';
        }
        break;

      case '0104':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '0105':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16) - 40;
          result.unit = '°C';
        }
        break;

      case '0106':
      case '0107':
      case '0108':
      case '0109':
        if (bytes.length >= 3) {
          result.value = parseFloat(((parseInt(bytes[2], 16) - 128) * 100 / 128).toFixed(1));
          result.unit = '%';
        }
        break;

      case '010A':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16) * 3;
          result.unit = 'kPa';
        }
        break;

      case '010B':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16);
          result.unit = 'kPa';
        }
        break;

      case '010C':
        if (bytes.length >= 4) {
          result.value = Math.round(((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 4);
          result.unit = 'RPM';
        }
        break;

      case '010D':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16);
          result.unit = 'km/h';
        }
        break;

      case '010E':
        if (bytes.length >= 3) {
          result.value = parseFloat(((parseInt(bytes[2], 16) - 128) / 2).toFixed(1));
          result.unit = '°';
        }
        break;

      case '010F':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16) - 40;
          result.unit = '°C';
        }
        break;

      case '0110':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 100).toFixed(2));
          result.unit = 'g/s';
        }
        break;

      case '0111':
        if (bytes.length >= 3) {
          result.value = Math.round((parseInt(bytes[2], 16) * 100) / 255);
          result.unit = '%';
        }
        break;

      case '0112':
        if (bytes.length >= 3) {
          result.value = this.decodeSecondaryAirStatus(parseInt(bytes[2], 16));
          result.unit = 'status';
        }
        break;

      case '0113':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16).toString(2).padStart(8, '0');
          result.unit = 'bitmap';
        }
        break;

      case '0114':
      case '0115':
      case '0116':
      case '0117':
      case '0118':
      case '0119':
      case '011A':
      case '011B':
        if (bytes.length >= 4) {
          const voltage = parseFloat((parseInt(bytes[2], 16) / 200).toFixed(3));
          const fuelTrim = parseFloat(((parseInt(bytes[3], 16) - 128) * 100 / 128).toFixed(1));
          result.value = { voltage, fuelTrim };
          result.unit = 'V, %';
        }
        break;

      case '011C':
        if (bytes.length >= 3) {
          result.value = this.decodeOBDStandards(parseInt(bytes[2], 16));
          result.unit = 'standard';
        }
        break;

      case '011D':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16).toString(2).padStart(8, '0');
          result.unit = 'bitmap';
        }
        break;

      case '011E':
        if (bytes.length >= 3) {
          result.value = (parseInt(bytes[2], 16) & 0x01) ? 'ON' : 'OFF';
          result.unit = 'status';
        }
        break;

      case '011F':
        if (bytes.length >= 4) {
          result.value = (parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16);
          result.unit = 'seconds';
        }
        break;

      case '0121':
        if (bytes.length >= 4) {
          result.value = (parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16);
          result.unit = 'km';
        }
        break;

      case '0122':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) * 0.079).toFixed(2));
          result.unit = 'kPa';
        }
        break;

      case '0123':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) * 10).toFixed(0));
          result.unit = 'kPa';
        }
        break;

      case '0124':
      case '0125':
      case '0126':
      case '0127':
      case '0128':
      case '0129':
      case '012A':
      case '012B':
        if (bytes.length >= 6) {
          const equivalenceRatio = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 32768).toFixed(3));
          const voltage = parseFloat((((parseInt(bytes[4], 16) * 256) + parseInt(bytes[5], 16)) / 8192).toFixed(3));
          result.value = { equivalenceRatio, voltage };
          result.unit = 'ratio, V';
        }
        break;

      case '012C':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '012D':
        if (bytes.length >= 3) {
          result.value = parseFloat(((parseInt(bytes[2], 16) - 128) * 100 / 128).toFixed(1));
          result.unit = '%';
        }
        break;

      case '012E':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '012F':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '0130':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16);
          result.unit = 'count';
        }
        break;

      case '0131':
        if (bytes.length >= 4) {
          result.value = (parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16);
          result.unit = 'km';
        }
        break;

      case '0132':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 4).toFixed(2));
          result.unit = 'Pa';
        }
        break;

      case '0133':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16);
          result.unit = 'kPa';
        }
        break;

      case '0134':
      case '0135':
      case '0136':
      case '0137':
      case '0138':
      case '0139':
      case '013A':
      case '013B':
        if (bytes.length >= 6) {
          const equivalenceRatio = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 32768).toFixed(3));
          const current = parseFloat((((parseInt(bytes[4], 16) * 256) + parseInt(bytes[5], 16)) / 256 - 128).toFixed(3));
          result.value = { equivalenceRatio, current };
          result.unit = 'ratio, mA';
        }
        break;

      case '013C':
      case '013D':
      case '013E':
      case '013F':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 10 - 40).toFixed(1));
          result.unit = '°C';
        }
        break;

      case '0141':
        if (bytes.length >= 6) {
          result.value = this.decodeMonitorStatusDriveCycle(bytes);
          result.unit = 'status';
        }
        break;

      case '0142':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 1000).toFixed(3));
          result.unit = 'V';
        }
        break;

      case '0143':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '0144':
        if (bytes.length >= 4) {
          result.value = parseFloat((((parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16)) / 32768).toFixed(3));
          result.unit = 'ratio';
        }
        break;

      case '0145':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '0146':
        if (bytes.length >= 3) {
          result.value = parseInt(bytes[2], 16) - 40;
          result.unit = '°C';
        }
        break;

      case '0147':
      case '0148':
      case '0149':
      case '014A':
      case '014B':
      case '014C':
        if (bytes.length >= 3) {
          result.value = parseFloat((parseInt(bytes[2], 16) * 100 / 255).toFixed(1));
          result.unit = '%';
        }
        break;

      case '014D':
        if (bytes.length >= 4) {
          result.value = (parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16);
          result.unit = 'minutes';
        }
        break;

      case '014E':
        if (bytes.length >= 4) {
          result.value = (parseInt(bytes[2], 16) * 256) + parseInt(bytes[3], 16);
          result.unit = 'minutes';
        }
        break;

      default:
        result.value = bytes.join(' ');
        result.unit = 'hex';
    }
  }

  decodeSupportedPIDs(bytes) {
    return `${bytes.length - 2} PID disponibili`;
  }

  decodeMonitorStatus(bytes) {
    const mil = (parseInt(bytes[2], 16) & 0x80) ? 'ON' : 'OFF';
    const dtcCount = parseInt(bytes[2], 16) & 0x7F;
    return { mil, dtcCount };
  }

  decodeFuelSystemStatus(status) {
    const statuses = {
      0x01: 'Open loop due to insufficient engine temperature',
      0x02: 'Closed loop, using oxygen sensor feedback',
      0x04: 'Open loop due to engine load OR fuel cut due to deceleration',
      0x08: 'Open loop due to system failure',
      0x10: 'Closed loop, using at least one oxygen sensor but there is a fault'
    };
    return statuses[status] || `Unknown (0x${status.toString(16).padStart(2, '0')})`;
  }

  decodeSecondaryAirStatus(status) {
    const statuses = {
      0x01: 'Upstream',
      0x02: 'Downstream of catalytic converter',
      0x04: 'From the outside atmosphere or off',
      0x08: 'Pump commanded on for diagnostics'
    };
    return statuses[status] || `Unknown (0x${status.toString(16).padStart(2, '0')})`;
  }

  decodeOBDStandards(standard) {
    const standards = {
      0x01: 'OBD-II as defined by the CARB',
      0x02: 'OBD as defined by the EPA',
      0x03: 'OBD and OBD-II',
      0x04: 'OBD-I',
      0x05: 'Not OBD compliant',
      0x06: 'EOBD (Europe)',
      0x07: 'EOBD and OBD-II',
      0x08: 'EOBD and OBD',
      0x09: 'EOBD, OBD and OBD II',
      0x0A: 'JOBD (Japan)',
      0x0B: 'JOBD and OBD II',
      0x0C: 'JOBD and EOBD',
      0x0D: 'JOBD, EOBD, and OBD II'
    };
    return standards[standard] || `Unknown (0x${standard.toString(16).padStart(2, '0')})`;
  }

  decodeMonitorStatusDriveCycle(bytes) {
    const mil = (parseInt(bytes[2], 16) & 0x80) ? 'ON' : 'OFF';
    const dtcCount = parseInt(bytes[2], 16) & 0x7F;
    const ignitionType = (parseInt(bytes[3], 16) & 0x08) ? 'Compression' : 'Spark';
    return { mil, dtcCount, ignitionType };
  }
}

module.exports = PIDParserService; 