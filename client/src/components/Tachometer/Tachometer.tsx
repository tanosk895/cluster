import React, { useEffect, useRef, useState } from "react";
import "./Tachometer.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";
import { ANIMATION_SPEED } from "../../config/constants";

/**
 * Componente Tachometer
 * Visualizza i giri motore (RPM) con animazione fluida
 */
const Tachometer = () => {
  const snapRpm = useSnapshot(state.session.rpm);
  const [rpm, setRpm] = useState(0);
  const minRpm = parseInt(snapRpm.min);
  const maxRpm = parseInt(snapRpm.max);
  const requestRef = useRef<number | null>(null);
  const [isRaspberryPi, setIsRaspberryPi] = useState(false);

  /**
   * Anima gradualmente il valore RPM verso il target
   */
  const animateRpm = () => {
    setRpm((prev) => {
      const diff = snapRpm.current - prev;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), ANIMATION_SPEED.STEP);
      const next = prev + step;

      if (Math.abs(diff) <= ANIMATION_SPEED.THRESHOLD) {
        cancelAnimationFrame(requestRef.current!);
        return snapRpm.current;
      }

      requestRef.current = requestAnimationFrame(animateRpm);
      return next;
    });
  };

  /**
   * Rileva se l'applicazione è in esecuzione su Raspberry Pi
   * per disabilitare le animazioni e migliorare le performance
   */
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    const isRpi = userAgent.includes('linux arm') || 
                  platform.includes('arm') || 
                  userAgent.includes('raspberry') ||
                  (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
    
    setIsRaspberryPi(isRpi);
  }, []);

  /**
   * Aggiorna il valore RPM quando cambia lo stato
   */
  useEffect(() => {
    if (isRaspberryPi) {
      // Aggiornamento diretto su Raspberry Pi
      setRpm(snapRpm.current);
    } else {
      // Animazione fluida su altre piattaforme
      requestRef.current = requestAnimationFrame(animateRpm);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [snapRpm.current, isRaspberryPi]);

  /**
   * Calcola la percentuale di riempimento del cerchio
   */
  const percentage = (rpm / maxRpm) * 80;

  /**
   * Determina il colore in base al valore RPM
   */
  const getColor = () => {
    if (rpm < 0.7 * maxRpm) return "rgba(123, 212, 211, 0.6)";
    if (rpm < 0.9 * maxRpm) return "rgba(255, 255, 255, 0.6)";
    return "rgba(255, 0, 0, 0.6)";
  };

  return (
    <div className="componentTachometer">
      <div className="wrapper">
        <div
          className="circle"
          style={{
            background: `conic-gradient(${getColor()} 0% ${percentage}%, transparent ${percentage}% 100%)`,
          }}
        >
          <div className="counter1">1</div>
          <div className="counter2">3</div>
          <div className="counter3">5</div>
          <div className="counter4">7</div>

          <div className="inner" />
          <div className="mid" />
          <div className="label">
            <h2>{Math.round(rpm)}</h2>
            <p>RPM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tachometer;
