import { useGetAccountInfo } from "@elrondnetwork/dapp-core";
import AppElrond from "App/AppElrond";

function AppHarnessElrond({ lanchEnvironment }) {
  const { address: elrondAddress } = useGetAccountInfo();

  return (
    <>
      {elrondAddress && <AppElrond appConfig={{
        elrondEnvironment: lanchEnvironment
      }} />}
    </>
  );
}

export default AppHarnessElrond;
