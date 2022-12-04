import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks/account';
import AppElrond from 'App/AppElrond';

function AppHarnessElrond({ launchEnvironment }) {
  const { address: elrondAddress } = useGetAccountInfo();

  return (
    <>
      {elrondAddress && <AppElrond appConfig={{
        elrondEnvironment: launchEnvironment
      }} />}
    </>
  );
}

export default AppHarnessElrond;
