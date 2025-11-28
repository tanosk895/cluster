/**
 * Tipi e interfacce per la configurazione dell'ambiente
 */

export interface WebSocketConfig {
  url: string;
  mock: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
}

export interface SplashScreenConfig {
  path: string;
}

export interface DebugConfig {
  enabled: boolean;
  showConsoleViewer: boolean;
}

export interface AppConfig {
  name: string;
  version: string;
  locale: string;
  timezone: string;
  timeFormat: "24h" | "12h";
}

export interface EnvironmentConfig {
  websocket: WebSocketConfig;
  splashScreen: SplashScreenConfig;
  debug: DebugConfig;
  app: AppConfig;
}

