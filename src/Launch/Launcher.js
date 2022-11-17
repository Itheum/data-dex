import { useState } from 'react';
import React from 'react';
import { DappProvider } from '@elrondnetwork/dapp-core/wrappers';
import { MoralisProvider } from 'react-moralis';

import AuthLauncher from 'Launch/AuthLauncher';
import EVMAppHarness from 'AppHarness/AppHarnessEVM';
import ElrondAppHarness from 'AppHarness/AppHarnessElrond';
import AuthPickerEVM from 'AuthPicker/AuthPickerEVM';
import AuthPickerElrond from 'AuthPicker/AuthPickerElrond';
import { debugui, uxConfig } from 'libs/util';
import { useSessionStorage } from 'libs/hooks';

import {
  TransactionsToastList,
  SignTransactionsModals,
  NotificationModal,
} from '@elrondnetwork/dapp-core/UI';

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

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

      {launchMode === 'evm' && <>
        <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
          <AuthPickerEVM resetLaunchMode={() => handleLaunchMode('auth')} />
          <EVMAppHarness resetLaunchMode={() => handleLaunchMode('auth')} />
        </MoralisProvider>
      </>}

      {launchMode === 'elrond' && <>      
        <DappProvider environment={launchEnvironment} customNetworkConfig={{ name: 'customConfig', apiTimeout: uxConfig.elrondAPITimeoutMs }}>
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
