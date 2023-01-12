import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account';
import AppMx from 'App/AppMultiversX';

function AppHarnessMx({ launchEnvironment }) {
  const { address: mxAddress } = useGetAccountInfo();

  return (
    <>
      {mxAddress && <AppMx appConfig={{
        mxEnvironment: launchEnvironment
      }} />}
    </>
  );
}

export default AppHarnessMx;
