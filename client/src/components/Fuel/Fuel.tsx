import React, { useEffect, useRef, useState } from "react";
import "./Fuel.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Fuel= () => {
  const snapFuel = useSnapshot(state.session.fuel)
  const [currentFuel, setCurrentFuel] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animateTemp = () => {
      setCurrentFuel((prev) => {
        const target = Number(snapFuel.current);
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
  }, [snapFuel.current]);

  const cappedFuel = Math.min(currentFuel, 100);
  const fuelPercentage = cappedFuel / 100;

  const getColor = () => {
    if (currentFuel < 0.3 * 100) return "rgba(255, 0, 0, 0.6)";
    if (currentFuel < 0.5 * 100) return "rgba(255, 255, 255, 0.6)"; 
    return "rgba(123, 212, 211, 0.6)";
  };

  return (
    <div className="componentTemperature">
      <div className="componentTemperature__bar">
        <div
          className="componentTemperature__bar__inner"
          style={{
            width: `${fuelPercentage * 100}%`,
            backgroundColor: getColor(),
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      <div className="componentTemperature__temperature__container">
        <p className="componentTemperature__min">E</p>

        <p
          className="componentTemperature__temperature"
          style={{
            left: `${fuelPercentage * 100}%`,
            transition: "left 0.3s ease",
          }}
        >
          {currentFuel < 100 && 
          <>
            <img src="/icons/fuel.svg" alt="fuel" />
            <span>
              {Math.round(currentFuel)}
            </span>
          </>
          }
        </p>

        <p className="componentTemperature__max">F</p>
        
      </div>
    </div>
  );
};

export default Fuel;
