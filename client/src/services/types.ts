/**
 * Tipi per il servizio WebSocket e comunicazione OBD
 */

export interface OBDParameter {
  name: string;
  value: number;
  unit: string;
  success: boolean;
  error: boolean;
  timestamp: string;
}

export interface WebSocketData {
  timestamp: string;
  monitoring: boolean;
  parameters: {
    coolant_temp?: OBDParameter;
    rpm?: OBDParameter;
    speed?: OBDParameter;
    throttle_pos?: OBDParameter;
    manifold_pressure?: OBDParameter;
  };
}

export interface GPIOWarningChange {
  warning: string;
  state: boolean;
  pin: number;
  name: string;
}

export interface GPIOWarningsData {
  timestamp: string;
  warnings: Record<string, boolean>;
  changes: GPIOWarningChange[];
}

export interface ExternalTemperatureData {
  timestamp: string;
  temperature: {
    external: number;
    unit: string;
    sensor: string;
  };
}

export interface FuelLevelData {
  timestamp: string;
  fuel: {
    level: number;
    unit: string;
    sensor: string;
    raw: {
      adc: number;
      voltage: number;
    };
  };
}

