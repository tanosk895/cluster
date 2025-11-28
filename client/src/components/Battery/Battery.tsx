import React, { useEffect, useRef, useState } from "react";
import "./Battery.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Battery = () => {
  const snapBattery = useSnapshot(state.session.battery)
  const [currentCarBattery, setCurrentCarBattery] = useState(0);
  const [currentServiceBattery, setCurrentServiceBattery] = useState(0);
  const requestRef = useRef<number | null>(null);
  useEffect(() => {
    const animateTemp = () => {
      setCurrentCarBattery((prev) => {
        const targetCar = Number(snapBattery.car);
        const diffCar = targetCar - prev;
        const stepCar = Math.sign(diffCar) * Math.min(Math.abs(diffCar), 1.5);
        const nextCar = prev + stepCar;

        if (Math.abs(diffCar) < 1) {
          return targetCar;
        }

        requestRef.current = requestAnimationFrame(animateTemp);
        return nextCar;
      });

      setCurrentServiceBattery((prev) => {
        const targetService = Number(snapBattery.service);
        const diffService = targetService - prev;
        const stepService = Math.sign(diffService) * Math.min(Math.abs(diffService), 1.5);
        const nextService = prev + stepService;

        if (Math.abs(diffService) < 1) {
          cancelAnimationFrame(requestRef.current!);
          return targetService;
        }

        return nextService;
      });
    };

    requestRef.current = requestAnimationFrame(animateTemp);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [snapBattery]);


  return (
    <div className="componentBattery">
      <div className="componentBattery__container">

        <div
          className="componentBattery__car"
        >
          <p>Battery</p>
          <p>14.4v</p>
        </div>

        <p className="componentBattery__service">{currentServiceBattery}v</p>
        
      </div>
    </div>
  );
};

export default Battery;
