import { useState } from "react";
import React from "react";
import { DappProvider, DappUI } from "@elrondnetwork/dapp-core";
import { MoralisProvider } from "react-moralis";

import AuthLauncher from "./AuthLauncher";
import EVMAppHarness from "./AppHarness/AppHarnessEVM";
import ElrondAppHarness from "./AppHarness/AppHarnessElrond";
import AuthPickerEVM from './AuthPicker/AuthPickerEVM';
import AuthPickerElrond from './AuthPicker/AuthPickerElrond';
import { debugui } from 'libs/util';

const {
  TransactionsToastList,
  SignTransactionsModals,
  NotificationModal,
} = DappUI;

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

function Launcher() {
  const [launchMode, setLaunchMode] = useState('auth');
  const [launchEnvironment, setLaunchEnvironment] = useState('devnet');

  const handleLaunchMode = (option, environment) => {   
    setLaunchMode(option);

    if (environment) {
      setLaunchEnvironment(environment);
    }

    // always reset this value in case user is toggling between wallets in front end
    // ... resetting here is nice an clean
    sessionStorage.removeItem('wallet-used');
  }

  debugui(`launchMode ${launchMode} environment ${launchEnvironment}`);

  return (
    <>
      {launchMode == 'auth' && 
        <AuthLauncher onLaunchMode={handleLaunchMode} />
      }

      {launchMode == 'evm' && <>
        <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
          <AuthPickerEVM resetLaunchMode={() => handleLaunchMode('auth')} />
          <EVMAppHarness resetLaunchMode={() => handleLaunchMode('auth')} />
        </MoralisProvider>
      </>}

      {launchMode == 'elrond' && <>
        <DappProvider environment={launchEnvironment} customNetworkConfig={{ name: "customConfig", apiTimeout: 6000 }}>
          <TransactionsToastList />
          <NotificationModal />
          <SignTransactionsModals className="custom-class-for-modals" />

          <AuthPickerElrond resetLaunchMode={() => handleLaunchMode('auth', 'devnet')} />
          <ElrondAppHarness launchEnvironment={launchEnvironment} />
        </DappProvider>
      </>}
    </>
  );
}

export default Launcher;
