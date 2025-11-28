import React, { useEffect, useRef } from 'react';
import './ConsoleViewer.scss';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  args: any[];
}

interface ConsoleViewerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClear: () => void;
}

/**
 * Componente ConsoleViewer
 * Visualizza i log della console in un pannello modale
 */
const ConsoleViewer: React.FC<ConsoleViewerProps> = ({ isOpen, onClose, logs, onClear }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolla automaticamente alla fine dei log
   */
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Scrolla automaticamente quando arrivano nuovi log
   */
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      scrollToBottom();
    }
  }, [logs, isOpen]);

  /**
   * Restituisce l'icona appropriata per il livello di log
   */
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return 'ERR';
      case 'warn': return 'WRN';
      case 'info': return 'INF';
      case 'debug': return 'DBG';
      default: return 'LOG';
    }
  };

  /**
   * Restituisce il colore appropriato per il livello di log
   */
  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return '#ff6b6b';
      case 'warn': return '#ffd93d';
      case 'info': return '#74c0fc';
      case 'debug': return '#b197fc';
      default: return '#ffffff';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="console-viewer-overlay">
      <div className="console-viewer">
        <div className="console-viewer__header">
          <div className="console-viewer__title">
            <span>Console JavaScript</span>
            <span className="console-viewer__count">{logs.length} log{logs.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="console-viewer__controls">
            <button 
              onClick={onClear}
              className="console-viewer__btn console-viewer__btn--clear"
              title="Cancella tutti i log"
            >
              Cancella
            </button>
            <button 
              onClick={scrollToBottom}
              className="console-viewer__btn console-viewer__btn--scroll"
              title="Vai alla fine"
            >
              Fine log
            </button>
            <button 
              onClick={onClose}
              className="console-viewer__btn console-viewer__btn--close"
              title="Chiudi"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="console-viewer__content">
          {logs.length === 0 ? (
            <div className="console-viewer__empty">
              <div className="console-viewer__empty-icon">[ ]</div>
              <div className="console-viewer__empty-text">Nessun log disponibile</div>
              <div className="console-viewer__empty-subtitle">I log della console appariranno qui</div>
            </div>
          ) : (
            <div className="console-viewer__logs">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`console-viewer__log console-viewer__log--${log.level}`}
                  style={{ borderLeftColor: getLogColor(log.level) }}
                >
                  <div className="console-viewer__log-header">
                    <span className="console-viewer__log-icon">
                      [{getLogIcon(log.level)}]
                    </span>
                    <span className="console-viewer__log-level">
                      {log.level.toUpperCase()}
                    </span>
                    <span className="console-viewer__log-timestamp">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="console-viewer__log-message">
                    <pre>{log.message}</pre>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsoleViewer;
