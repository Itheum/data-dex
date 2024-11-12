import React, { useState } from "react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { TransactionsToastList, SignTransactionsModals, NotificationModal } from "@multiversx/sdk-dapp/UI";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { TermsChangedNoticeModal } from "components/TermsChangedNoticeModal";
import { uxConfig, IS_DEVNET } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { getMvxRpcApi } from "libs/MultiversX/api";
import { walletConnectV2ProjectId, MX_TOAST_LIFETIME_IN_MS } from "libs/mxConstants";
import { clearAppSessionsLaunchMode } from "libs/utils";
import AppMx from "./AppMultiversX";
import ModalAuthPickerMx from "./ModalAuthPickerMultiversX";

function Launcher() {
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
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

  return (
    <>
      <DappProvider
        environment={import.meta.env.VITE_ENV_NETWORK}
        customNetworkConfig={{
          name: "itheumDataDEX",
          walletConnectV2ProjectId,
          apiTimeout: uxConfig.mxAPITimeoutMs,
          apiAddress: IS_DEVNET ? `https://${getMvxRpcApi("D")}` : `https://${getMvxRpcApi(chainID)}`, // we have to do the IS_DEVNET check as if not, chainID is being cached to 1 always and we always go to Mainnet
        }}
        dappConfig={{
          shouldUseWebViewProvider: true,
        }}>
        <TransactionsToastList successfulToastLifetime={MX_TOAST_LIFETIME_IN_MS} />
        <NotificationModal />
        <SignTransactionsModals className="itheum-data-dex-elrond-modals" />

        {launchMode === "mvx" && <ModalAuthPickerMx resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} />}

        <AppMx onShowConnectWalletModal={handleLaunchMode} />
      </DappProvider>

      <TermsChangedNoticeModal />
    </>
  );
}

export default Launcher;
