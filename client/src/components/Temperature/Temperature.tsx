import React, { useEffect, useRef, useState } from "react";
import "./Temperature.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Temperature = () => {
  const snapTemperature =  useSnapshot(state.session.temparature)
  const minTemperature = parseInt(snapTemperature.min);
  const maxTemperature = parseInt(snapTemperature.max);
  const [currentTemp, setCurrentTemp] = useState(100);

  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animateTemp = () => {
      setCurrentTemp((prev) => {
        const target = Number(snapTemperature.current);
        const diff = target - prev;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), 1.5);
        const next = prev + step;

        if (Math.abs(diff) < 1) {
          cancelAnimationFrame(requestRef.current!);
          return target;
        }

        requestRef.current = requestAnimationFrame(animateTemp);
        return next;
      });
    };

    requestRef.current = requestAnimationFrame(animateTemp);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [snapTemperature.current]);

  const cappedTemp = Math.min(currentTemp, maxTemperature);
  const temperaturePercentage = cappedTemp / maxTemperature;

  const getColor = () => {
    // Se la temperatura è > 100°C, sempre rosso (condizione critica)
    if (currentTemp > 100) return "rgba(255, 0, 0, 0.8)"; // Rosso più intenso per criticità
    
    // Altrimenti usa la logica normale basata sulle percentuali
    if (currentTemp < 0.7 * maxTemperature) return "rgba(123, 212, 211, 0.6)"; // Ciano
    if (currentTemp < 0.9 * maxTemperature) return "rgba(255, 255, 255, 0.6)"; // Bianco
    return "rgba(255, 0, 0, 0.6)"; // Rosso normale
  };

  return (
    <div className="componentTemperature">
      <div className="componentTemperature__temperature__container">
        <p className="componentTemperature__min">{minTemperature}°</p>
        <p className="componentTemperature__max">{currentTemp < maxTemperature ? maxTemperature : currentTemp}°</p>
      </div>
      
      <div className="componentTemperature__bar">
        <div
          className="componentTemperature__bar__inner"
          style={{
            width: `${temperaturePercentage * 100}%`,
            backgroundColor: getColor(),
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      
      <p
        className="componentTemperature__temperature"
        style={{
          left: `${temperaturePercentage * 100}%`,
          transition: "left 0.3s ease",
        }}
      >
        {currentTemp < maxTemperature && 
        <>
          <img src="/icons/temperature.svg" alt="temperature" />
          <span>
            {Math.round(currentTemp)} °
          </span>
        </>
        }
      </p>
    </div>
  );
};

export default Temperature;
