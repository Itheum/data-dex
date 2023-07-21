import React, { useState } from "react";
import { useGetLoginInfo } from "@multiversx/sdk-dapp/hooks";
import { TransactionsToastList, SignTransactionsModals, NotificationModal } from "@multiversx/sdk-dapp/UI";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { uxConfig } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { walletConnectV2ProjectId, MX_TOAST_LIFETIME_IN_MS } from "libs/mxConstants";
import { clearAppSessionsLaunchMode } from "libs/utils";
import MxAppHarness from "./AppHarnessMultiversX";
import AuthPickerMx from "./AuthPickerMultiversX";

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useLocalStorage("itm-launch-mode", null);
  const [launchEnvSession, setLaunchEnvSession] = useLocalStorage("itm-launch-env", null);
  const [launchMode, setLaunchMode] = useState(launchModeSession || "no-auth");
  const { tokenLogin } = useGetLoginInfo();
  const [launchEnvironment, setLaunchEnvironment] = useState(tokenLogin ? "mainnet" : launchEnvSession || "devnet");

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

  return (
    <>
      <DappProvider
        environment={launchEnvironment}
        customNetworkConfig={{
          name: "itheum-data-dex",
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

        <MxAppHarness launchEnvironment={launchEnvironment} handleLaunchMode={handleLaunchMode} />
      </DappProvider>
    </>
  );
}

export default Launcher;
