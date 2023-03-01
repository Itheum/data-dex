import { useState } from 'react';
import React from 'react';
import { DappProvider } from '@multiversx/sdk-dapp/wrappers';

import AuthLauncher from 'Launch/AuthLauncher';
import ElrondAppHarness from 'AppHarness/AppHarnessElrond';
import AuthPickerElrond from 'AuthPicker/AuthPickerElrond';
import { debugui, uxConfig } from 'libs/util';
import { useSessionStorage } from 'libs/hooks';
import { TransactionsToastList, SignTransactionsModals, NotificationModal } from '@multiversx/sdk-dapp/UI';

const walletConnectV2ProjectId = process.env.REACT_APP_ENV_WALLETCONNECTV2_PROJECTID;

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useSessionStorage('itm-launch-mode', null); // let's us support, browser refresh session recovery if user is logged in
  const [launchEnvSession, setLaunchEnvSession] = useSessionStorage('itm-launch-env', null); // ... as above
  const [launchMode, setLaunchMode] = useState(launchModeSession || 'auth');
  const [launchEnvironment, setLaunchEnvironment] = useState(launchEnvSession || 'devnet');

  const handleLaunchMode = (option, environment) => {   
    setLaunchMode(option);
    setLaunchModeSession(option);

    if (environment) {
      setLaunchEnvironment(environment);
      setLaunchEnvSession(environment);
    }

    // always reset this value in case user is toggling between wallets in front end
    // ... resetting here is nice an clean
    sessionStorage.removeItem('itm-wallet-used');
  }

  debugui(`launchMode ${launchMode} environment ${launchEnvironment}`);

  return (
    <>
      {launchMode === 'auth' && 
        <AuthLauncher onLaunchMode={handleLaunchMode} />
      }

      {launchMode === 'elrond' && <>      
        <DappProvider environment={launchEnvironment} customNetworkConfig={{ name: 'customConfig', apiTimeout: uxConfig.elrondAPITimeoutMs, walletConnectV2ProjectId }}>
          <TransactionsToastList />
          <NotificationModal />
          <SignTransactionsModals className="itheum-data-dex-elrond-modals" />

          <AuthPickerElrond launchEnvironment={launchEnvironment} resetLaunchMode={() => handleLaunchMode('auth', 'devnet')} />
          <ElrondAppHarness launchEnvironment={launchEnvironment} />          
        </DappProvider>
      </>}
    </>
  );
}

export default Launcher;
