import React, { useState } from "react";
import { TransactionsToastList, SignTransactionsModals, NotificationModal } from "@multiversx/sdk-dapp/UI";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import EVMAppHarness from "AppHarness/AppHarnessEVM";
import MxAppHarness from "AppHarness/AppHarnessMultiversX";
import AuthPickerMx from "AuthPicker/AuthPickerMultiversX";
import { useLocalStorage } from "libs/hooks";
import { walletConnectV2ProjectId, MX_TOAST_LIFETIME_IN_MS } from "libs/mxConstants";
import { uxConfig, clearAppSessionsLaunchMode } from "libs/util";

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useLocalStorage("itm-launch-mode", null);
  const [launchEnvSession, setLaunchEnvSession] = useLocalStorage("itm-launch-env", null);
  const [launchMode, setLaunchMode] = useState(launchModeSession || "no-auth");
  const [launchEnvironment, setLaunchEnvironment] = useState(launchEnvSession || "devnet");

  const [isMX, setIsMX] = useState(true);
  const [EVMContext, setEVMContext] = useState<any>(null);

  // hoisting launchModeControl here allows us to go multi-chain easier in future
  // ... have a look at git history on this component
  const handleLaunchMode = (option: any, environment: any) => {
    setLaunchMode(option);
    setLaunchModeSession(option);

    if (environment) {
      setLaunchEnvironment(environment);
      setLaunchEnvSession(environment);
    }

    // resetting all launch mode sessions here is nice an clean
    clearAppSessionsLaunchMode();
  };

  const onEVMConnection = (
    ethersProvider: any,
    wallet: any,
    connectedChain: any
  ) => {
    console.log('onEVMConnection address --->', wallet.accounts[0].address);
    console.log('onEVMConnection connectedChain--->', connectedChain.id);
    console.log('onEVMConnection ethersProvider--->', ethersProvider);

    setIsMX(false);
    
    setEVMContext({
      ethersProvider,
      wallet,
      connectedChain
    });
  };

  const onEVMConnectionClose = () => {
    setIsMX(true);
    
    setEVMContext(null);

    clearAppSessionsLaunchMode();

    setTimeout(() => { // hard reload of browser
      if (window !== undefined) {
        window.location.replace("/");
      }
    }, 1000);
  };

  return (
    <>
      {!isMX && <>
        <EVMAppHarness 
          launchEnvironment={launchEnvironment} 
          handleLaunchMode={handleLaunchMode} 
          onEVMConnection={onEVMConnection}
          ethersProvider={EVMContext?.ethersProvider} 
          evmWallet={EVMContext?.wallet} 
          connectedChain={EVMContext?.connectedChain} 
          onEVMConnectionClose={onEVMConnectionClose} />
      </>}

      {isMX &&
      <DappProvider
        environment={launchEnvironment}
        customNetworkConfig={{
          name: "customConfig",
          apiTimeout: uxConfig.mxAPITimeoutMs,
          walletConnectV2ProjectId,
        }}
        dappConfig={{
          shouldUseWebViewProvider: true,
        }}>
        <TransactionsToastList successfulToastLifetime={MX_TOAST_LIFETIME_IN_MS} />
        <NotificationModal />
        <SignTransactionsModals className="itheum-data-dex-elrond-modals" />

        {launchMode == "mx" && <AuthPickerMx launchEnvironment={launchEnvironment} resetLaunchMode={() => handleLaunchMode("no-auth", "devnet")} />}

        <MxAppHarness launchEnvironment={launchEnvironment} handleLaunchMode={handleLaunchMode} onEVMConnection={onEVMConnection} />
      </DappProvider>      
      }
    </>
  );
}

export default Launcher;
