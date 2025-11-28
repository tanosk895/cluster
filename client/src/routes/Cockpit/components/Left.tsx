import { useEffect, useState } from "react";
import Address from "../../../components/Address";
import Tachometer from "../../../components/Tachometer";
import Temperature from "../../../components/Temperature";
import Altitude from "../../../components/Altitude";
import { state } from "../../../store/state";


const Left = () => {

  const snapSession = useState(state.session);

  const [rpm, setRpm] = useState(0);
  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRpm(Math.floor(Math.random() * 8000));
      setTemperature(Math.floor(Math.random() * 100));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="left">
        <div className="left__center">
            <Tachometer  />
        </div>
        <div className="left__bottom">
          <Altitude />
        </div>
    </div>
  );
};

export default Left;
