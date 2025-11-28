import "./Cockpit.scss";
import Right from "./components/Right";
import Center from "./components/Center";
import Left from "./components/Left";
import ModelViewer from "../../components/ModelViewer/ModelViewer";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";
import { COCKPIT_UI } from "../../config/constants";
import { formatTime } from "../../config/time";
import { websocket as websocketConfig } from "../../config/environment";


export default function Cockpit() {
  const [now, setNow] = useState(new Date());
  const snapSession = useSnapshot(state.session);

  // Aggiorna l'orologio di bordo
  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, COCKPIT_UI.CLOCK_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // Temperatura ambiente esterna
  // Mock: 21°C fisso
  // WebSocket: aggiornata da sensore DS18B20 (state.session.temparature.ambient)
  const externalTemperature = websocketConfig.mock
    ? 21
    : (snapSession.temparature as any)?.ambient ?? 21;

  return (
    <div className="pageCockpit">
      <div className="pageCockpit__top">
        <div className="pageCockpit__top-left">
          {formatTime(now)}
        </div>
        <div className="pageCockpit__top-right">
          {Math.round(externalTemperature)} °C
        </div>
      </div>

      <Left />
      <Center />
      <Right />

      <div className="modelViewer">
        <ModelViewer />
      </div>
    </div>
  );
}
