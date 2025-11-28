import { useEffect, useState } from "react";
import Address from "../../../components/Address";
import Tachometer from "../../../components/Tachometer";
import Temperature from "../../../components/Temperature";
import Fuel from "../../../components/Fuel";
import Odometer from "../../../components/Odometer";
import Battery from "../../../components/Battery";
import { useSnapshot } from "valtio";
import { state } from "../../../store/state";


const Right = () => {
  const [speed, setSpeed] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      //  Number random between 0 and 160 
      setSpeed(Math.floor(Math.random() * 161));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="right">
        <div className="right__center">
            <Odometer />
        </div>
        <div className="right__bottom">
          <Battery />
        </div>
    </div>
  );
};

export default Right;
