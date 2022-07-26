import { useState } from "react";
import React from "react";
import { DappProvider, DappUI } from "@elrondnetwork/dapp-core";
import { MoralisProvider } from "react-moralis";

import AuthLauncher from "./AuthLauncher";
import EVMAppHarness from "./AppHarness/AppHarnessEVM";
import ElrondAppHarness from "./AppHarness/AppHarnessElrond";
import AuthPickerEVM from './AuthPicker/AuthPickerEVM';
import AuthPickerElrond from './AuthPicker/AuthPickerElrond';

const {
  TransactionsToastList,
  SignTransactionsModals,
  NotificationModal,
} = DappUI;

const serverUrl = process.env.REACT_APP_ENV_MORALIS_SERVER;

function Launcher() {
  const [launchMode, setLaunchMode] = useState('auth');
  const [lanchEnvironment, setLanchEnvironment] = useState('devnet');

  const handleLaunchMode = (option, environment) => {
    setLaunchMode(option);

    if (environment) {
      setLanchEnvironment(environment);
    }
  }

  return (
    <>
      <div>launchMode {launchMode}</div>
      
      {launchMode == 'auth' && 
        <AuthLauncher onLaunchMode={handleLaunchMode} />
      }

      {launchMode == 'evm' && <>
        <div>EVM Mode</div>
        <MoralisProvider appId={process.env.REACT_APP_ENV_MORALIS_APPID} serverUrl={serverUrl}>
          <AuthPickerEVM resetLaunchMode={() => setLaunchMode('auth')} />
          <EVMAppHarness resetLaunchMode={() => setLaunchMode('auth')} />
        </MoralisProvider>
      </>}

      {launchMode == 'elrond' && <>
        <div>Elrond {lanchEnvironment} Mode</div>
        <DappProvider environment={lanchEnvironment} customNetworkConfig={{ name: "customConfig", apiTimeout: 6000 }}>
          <TransactionsToastList />
          <NotificationModal />
          <SignTransactionsModals className="custom-class-for-modals" />

          <AuthPickerElrond resetLaunchMode={() => setLaunchMode('auth')} />
          <ElrondAppHarness lanchEnvironment={lanchEnvironment} />
        </DappProvider>
      </>}
    </>
  );
}

export default Launcher;
