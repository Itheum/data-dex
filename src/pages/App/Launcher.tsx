import React, { useState } from "react";
import { TransactionsToastList, SignTransactionsModals, NotificationModal } from "@multiversx/sdk-dapp/UI";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { TermsChangedNoticeModal } from "components/TermsChangedNoticeModal";
import DelayedRender from "components/UtilComps/DelayedRender";
import { uxConfig, IS_DEVNET } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { walletConnectV2ProjectId, MX_TOAST_LIFETIME_IN_MS } from "libs/mxConstants";
import { clearAppSessionsLaunchMode } from "libs/utils";
import AppMx from "./AppMultiversX";
import ModalAuthPickerMx from "./ModalAuthPickerMultiversX";

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useLocalStorage("itm-launch-mode", null);
  const [launchMode, setLaunchMode] = useState(launchModeSession || "no-auth");
  const [redirectToRoute, setRedirectToRoute] = useState<null | string>(null);
  // hoisting launchModeControl here allows us to go multi-chain easier in future
  // ... have a look at git history on this component
  const handleLaunchMode = (chainOption: string, redirectToRouteStr?: string) => {
    setLaunchMode(chainOption);
    setLaunchModeSession(chainOption);

    // we can redirect user to a route after login is complete
    if (redirectToRouteStr) {
      setRedirectToRoute(redirectToRouteStr);
    }

    // resetting all launch mode sessions here is nice and clean
    clearAppSessionsLaunchMode();
  };

  let mvxRpcApiToUse = "";

  if (IS_DEVNET) {
    mvxRpcApiToUse = `https://${getMvxRpcApi("D")}`;
  } else {
    mvxRpcApiToUse = `https://${getMvxRpcApi("1")}`;
  }

  return (
    <>
      <DappProvider
        environment={import.meta.env.VITE_ENV_NETWORK}
        customNetworkConfig={{
          name: "itheumDataDEX",
          walletConnectV2ProjectId,
          apiTimeout: uxConfig.mxAPITimeoutMs,
          apiAddress: mvxRpcApiToUse,
          skipFetchFromServer: true, // these values are static until they change something at the core level, which should be be announced
        }}
        dappConfig={{
          shouldUseWebViewProvider: true,
        }}>
        <TransactionsToastList successfulToastLifetime={MX_TOAST_LIFETIME_IN_MS} />
        <NotificationModal />
        <SignTransactionsModals className="itheum-data-dex-elrond-modals" />

        {/* we delay the render a bit so that the ModalAuthPickerMx wont flicker on screen after the login is done as it takes some time to recognize user is logged in */}
        {launchMode === "mvx" && (
          <DelayedRender>
            <ModalAuthPickerMx resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} />
          </DelayedRender>
        )}

        <AppMx onShowConnectWalletModal={handleLaunchMode} />
      </DappProvider>

      <TermsChangedNoticeModal />
    </>
  );
}

export default Launcher;
