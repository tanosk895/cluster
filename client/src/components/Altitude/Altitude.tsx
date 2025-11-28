import React, { useEffect, useRef, useState } from "react";
import "./Altitude.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Altitude = () => {
  const snapAltitude=  useSnapshot(state.session.altitude)
  const snapKilometres =  useSnapshot(state.session.kilometres)
  const [currentAltitude, setCurrentAltitude] = useState(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const animateTemp = () => {
      setCurrentAltitude((prev) => {
        const target = Number(snapAltitude.current);
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
  }, [snapAltitude.current]);


  return (
    <div className="componentAltitude">
      <div className="componentAltitude__container">

        <div
          className="componentAltitude__altitude"
        >
          <p>Fuel</p>
          <p>47%</p>
        </div>

        <p className="componentAltitude__last">250km</p>
        
      </div>
    </div>
  );
};

export default Altitude;
