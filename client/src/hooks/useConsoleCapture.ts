import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  args: any[];
}

export const useConsoleCapture = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const originalMethods = useRef<{
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  }>();

  const addLog = (level: LogEntry['level'], args: any[]) => {
    const timestamp = new Date().toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      level,
      message,
      args
    };

    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    // Salva i metodi originali
    originalMethods.current = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Override dei metodi console
    console.log = (...args) => {
      originalMethods.current!.log(...args);
      addLog('log', args);
    };

    console.info = (...args) => {
      originalMethods.current!.info(...args);
      addLog('info', args);
    };

    console.warn = (...args) => {
      originalMethods.current!.warn(...args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalMethods.current!.error(...args);
      addLog('error', args);
    };

    console.debug = (...args) => {
      originalMethods.current!.debug(...args);
      addLog('debug', args);
    };

    // Cleanup function
    return () => {
      if (originalMethods.current) {
        console.log = originalMethods.current.log;
        console.info = originalMethods.current.info;
        console.warn = originalMethods.current.warn;
        console.error = originalMethods.current.error;
        console.debug = originalMethods.current.debug;
      }
    };
  }, []);

  return { logs, clearLogs };
}; 