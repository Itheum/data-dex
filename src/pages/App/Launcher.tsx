import React, { useState } from "react";
import { TermsChangedNoticeModal } from "components/TermsChangedNoticeModal";
import { useLocalStorage } from "libs/hooks";
import { clearAppSessionsLaunchMode } from "libs/utils";
import AppMx from "./AppMultiversX";
import ModalAuthPickerMx from "./ModalAuthPickerMultiversX";
import { MvxContextProvider } from "contexts/MvxContextProvider";
import { SolContextProvider } from "contexts/sol/SolContextProvider";
import { StoreProvider } from "store/StoreProvider";
import { Container, Flex, useColorMode } from "@chakra-ui/react";
import AppFooter from "components/Sections/AppFooter";
import AppHeader from "components/Sections/AppHeader";
import AppSolana from "./AppSolana";

function Launcher() {
  const [launchModeSession, setLaunchModeSession] = useLocalStorage("itm-launch-mode", null);
  const [launchMode, setLaunchMode] = useState(launchModeSession || "no-auth");
  const [redirectToRoute, setRedirectToRoute] = useState<null | string>(null);
  const [openConnectModal, setOpenConnectModal] = useState(false);

  const { colorMode } = useColorMode();
  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
  }
  // hoisting launchModeControl here allows us to go multi-chain easier in future
  // ... have a look at git history on this component
  const handleLaunchMode = (chainOption: string, redirectToRouteStr?: string) => {
    if (chainOption == "no-auth") setOpenConnectModal(false);
    else setOpenConnectModal(true);
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
          <StoreProvider>
            <Container maxW="97.5rem">
              <Flex
                bgColor={colorMode === "dark" ? "bgDark" : "bgWhite"}
                flexDirection="column"
                justifyContent="space-between"
                minH="100svh"
                boxShadow={containerShadow}
                zIndex={2}>
                {/* 
                ///TODO analyze this launch mode, maybe transform it somehow to 
                open the modal when the user clicks on the button  because i think the problem wiht the button not working
                only after a refresh is because of the launchModeSession variable stored in local storage
                
                App Header
                <AppHeader onShowConnectWalletModal={onShowConnectWalletModal} setMenuItem={setMenuItem} handleLogout={handleLogout} /> */}
                {/* <AppHeader onShowConnectWalletModal={handleLaunchMode} setMenuItem={() => {}} handleLogout={() => console.log("LOGOUT BUTTON")} /> */}

                <ModalAuthPickerMx openConnectModal={openConnectModal} resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} />
                {/* {launchMode === "solana" && <AppSolana onShowConnectWalletModal={handleLaunchMode} />} */}
                <AppMx onShowConnectWalletModal={handleLaunchMode} />
                {/* <ModalAuthPickerMx resetLaunchMode={() => handleLaunchMode("no-auth")} redirectToRoute={redirectToRoute} /> */}
                <AppFooter />
              </Flex>
            </Container>
          </StoreProvider>
        </MvxContextProvider>
      </SolContextProvider>
      <TermsChangedNoticeModal />
    </>
  );
}

export default Launcher;
