import React, { useState } from "react";
import { TermsChangedNoticeModal } from "components/TermsChangedNoticeModal";
import { useLocalStorage } from "libs/hooks";
import { clearAppSessionsLaunchMode } from "libs/utils";
import AppMx from "./AppMultiversX";
import ModalAuthPickerMx from "./ModalAuthPickerMultiversX";
import { MvxContextProvider } from "contexts/MvxContextProvider";
import { SolContextProvider } from "contexts/sol/SolContextProvider";

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useLocalStorage("itm-launch-mode", null);
  const [launchMode, setLaunchMode] = useState(launchModeSession || "no-auth");
  const [redirectToRoute, setRedirectToRoute] = useState<null | string>(null);
  console.log(launchModeSession, "LAUBCH :", launchMode, redirectToRoute);
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
      {/* <DappProvider
        environment={import.meta.env.VITE_ENV_NETWORK}
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

        {launchMode === "mvx" && <ModalAuthPickerMx resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} />}
      </DappProvider> */}

      <SolContextProvider>
        <MvxContextProvider>
          {launchMode === "mvx" && <ModalAuthPickerMx resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} />}
          <AppMx onShowConnectWalletModal={handleLaunchMode} />
        </MvxContextProvider>
      </SolContextProvider>
      <TermsChangedNoticeModal />
    </>
  );
}

export default Launcher;
