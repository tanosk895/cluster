import React from 'react';
import './DebugButton.scss';

interface DebugButtonProps {
  onClick: () => void;
  logCount: number;
}

/**
 * Componente DebugButton
 * Pulsante per aprire la console di debug
 */
const DebugButton: React.FC<DebugButtonProps> = ({ onClick, logCount }) => {
  return (
    <button 
      className="debug-button" 
      onClick={onClick}
      title="Visualizza log console"
    >
      <div className="debug-button__icon">DBG</div>
      {logCount > 0 && (
        <div className="debug-button__badge">
          {logCount > 99 ? '99+' : logCount}
        </div>
      )}
    </button>
  );
};

export default DebugButton;
