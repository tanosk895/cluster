import Address from "../../../components/Address";
import ModelViewer from "../../../components/ModelViewer/ModelViewer";
import Kilometres from "../../../components/Kilometres";
import WarningLights from "../../../components/WarningLights";
import Temperature from "../../../components/Temperature";
import Fuel from "../../../components/Fuel";

const Center = () => {
  return (
    <div className="center">
      <div className="center__top">
        <Temperature  />
      </div>
      <div className="center__center">
        <WarningLights />
      </div>
      <div className="center__bottom">
        <Kilometres/>

      </div>
  </div>
  );
};

export default Center;
