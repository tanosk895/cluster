import React from "react";
import "./Kilometres.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Kilometres = () => {
  const snapKilometres = useSnapshot(state.session.kilometres)
  return (
    <div className="componentKilometers">
      <p>{snapKilometres.current} <span>km</span></p>
    </div>
  );
};

export default Kilometres;
