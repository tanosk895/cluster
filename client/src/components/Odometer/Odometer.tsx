import React, { useEffect, useRef, useState } from "react";
import "./Odometer.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";
import { ANIMATION_SPEED } from "../../config/constants";

/**
 * Componente Odometer
 * Visualizza la velocità del veicolo con animazione fluida
 */
const Odometer = () => {
  const snapSpeed = useSnapshot(state.session.speed);
  const maxSpeed = snapSpeed.max;
  const minSpeed = snapSpeed.min;

  const [speed, setSpeed] = useState(0);
  const requestRef = useRef<number | null>(null);
  const [isRaspberryPi, setIsRaspberryPi] = useState(false);

  /**
   * Anima gradualmente il valore velocità verso il target
   */
  const animateSpeed = () => {
    setSpeed((prev) => {
      const diff = snapSpeed.current - prev;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), ANIMATION_SPEED.STEP);
      const next = prev + step;

      if (Math.abs(diff) <= ANIMATION_SPEED.THRESHOLD) {
        cancelAnimationFrame(requestRef.current!);
        return snapSpeed.current;
      }

      requestRef.current = requestAnimationFrame(animateSpeed);
      return next;
    });
  };

  /**
   * Rileva se l'applicazione è in esecuzione su Raspberry Pi
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
   * Aggiorna il valore velocità quando cambia lo stato
   */
  useEffect(() => {
    if (isRaspberryPi) {
      setSpeed(snapSpeed.current);
    } else {
      requestRef.current = requestAnimationFrame(animateSpeed);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [snapSpeed.current, isRaspberryPi]);

  /**
   * Calcola la percentuale di riempimento del cerchio
   */
  const percentage = (speed / maxSpeed) * 80;

  /**
   * Determina il colore in base alla velocità
   */
  const getColor = () => {
    if (speed < 0.7 * maxSpeed) return "rgba(123, 212, 211, 0.6)";
    if (speed < 0.9 * maxSpeed) return "rgba(255, 255, 255, 0.6)";
    return "rgba(255, 0, 0, 0.6)";
  };

  return (
    <div className="componentOdometer">
      <div className="wrapper">
        <div
          className="circle"
          style={{
            background: `conic-gradient(${getColor()} 0% ${percentage}%, transparent ${percentage}% 100%)`,
          }}
        >
          <div className="counter1">20</div>
          <div className="counter2">70</div>
          <div className="counter3">100</div>
          <div className="counter4">150</div>

          <div className="inner" />
          <div className="mid" />
          <div className="label">
            <h2>{Math.round(speed)}</h2>
            <p>km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Odometer;
