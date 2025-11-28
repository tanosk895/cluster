import "./Address.scss";
import { useSnapshot } from "valtio";
import { state } from "../../store/state";

const Address = () => {
  const snapAddress=  useSnapshot(state.session.address)

  return (
    <div className="componentAddress">
      <p>{snapAddress.latitude}</p>
      <img src="/icons/address.svg" alt="address" />
      <p>{snapAddress.longitude}</p>
    </div>
  );
};

export default Address;
