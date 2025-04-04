import React, { useEffect, useState } from "react";
import { Box, Container, Flex, useColorMode } from "@chakra-ui/react";
import { useGetNetworkConfig } from "@multiversx/sdk-dapp/hooks";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { RouteType } from "@multiversx/sdk-dapp/types";
import { logout } from "@multiversx/sdk-dapp/utils";
import { AuthenticatedRoutesWrapper } from "@multiversx/sdk-dapp/wrappers";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppFooter from "components/Sections/AppFooter";
import AppHeader from "components/Sections/AppHeader";
import AppSettings from "components/UtilComps/AppSettings";
import { consoleNotice, dataCATDemoUserData, MENU, PATHS } from "libs/config";
import { useLocalStorage } from "libs/hooks";
import { gtagGo, sleep } from "libs/utils";
import DataNFTDetails from "pages/DataNFT/DataNFTDetails";
import DataNFTMarketplaceMultiversX from "pages/DataNFT/DataNFTMarketplaceMultiversX";
import DataNFTs from "pages/DataNFT/DataNFTs";
import MyDataNFTsMx from "pages/DataNFT/MyDataNFTsMultiversX";
import { GetNFMeID } from "pages/GetNFMeID";
import { GetVerified } from "pages/GetVerified";
import HomeMultiversX from "pages/Home/HomeMultiversX";
import LandingPage from "pages/LandingPage";
import { StoreProvider } from "store/StoreProvider";
import { TradeData } from "../AdvertiseData/TradeData";
import { Bonding } from "../Bonding/Bonding";
import { MinterDashboard } from "../Enterprise/components/MinterDashboard";
import { Enterprise } from "../Enterprise/Enterprise";
import { GuardRails } from "../GuardRails/GuardRails";
import { Profile } from "../Profile/Profile";

const mxLogout = logout;

export const routes: RouteType[] = [
  {
    path: "dashboard",
    component: <></>,
    authenticatedRoute: true,
  },
  {
    path: "mintdata",
    component: <></>,
    authenticatedRoute: true,
  },
  {
    path: "datanfts/wallet",
    component: <></>,
    authenticatedRoute: true,
  },
  {
    path: "profile",
    component: <></>,
    authenticatedRoute: true,
  },
];

function App({ onShowConnectWalletModal }: { onShowConnectWalletModal: any }) {
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [dataCatLinkedSession, setDataCatLinkedSession] = useLocalStorage("itm-datacat-linked", null);
  const { address: mxAddress } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn, loginMethod: mxLoginMethod } = useGetLoginInfo();
  const {
    network: { chainId: chainID },
  } = useGetNetworkConfig();
  const [menuItem, setMenuItem] = useState(MENU.LANDING);
  const [rfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0,
    auth: 0,
    dataNFTWallet: 0,
  });
  const { colorMode } = useColorMode();
  const { pathname } = useLocation();
  const [loggedInActiveMxWallet, setLoggedInActiveMxWallet] = useState("");
  const [dataCATAccount, setDataCATAccount] = useState<any>(null);
  const [, setLoadingDataCATAccount] = useState(true);

  let path = pathname?.split("/")[pathname?.split("/")?.length - 1]; // handling Route Path

  useEffect(() => {
    if (path) {
      // we can use - to tag path keys. e.g. offer-44 is path key offer. So remove anything after - if needed
      // also, NFTDETAILS key is for path like DATANFTFT2-71ac28-79 so allow for this custom logic
      if (path.includes("DATANFT")) {
        path = "nftdetails";
      } else if (path.includes("-")) {
        path = path.split("-")[0];
      }

      setMenuItem(PATHS[path as keyof typeof PATHS]?.[0] as number);
    }

    console.log(consoleNotice);
  }, []);

  useEffect(() => {
    if (chainID === "D") {
      linkOrRefreshDataDATAccount(true);
    }
  }, [chainID]);

  useEffect(() => {
    // Mx authenticated for 1st time or is a reload.
    async function mxSessionInit() {
      // when user disconnects in xPortal App, it comes to this route. So we need to logout the user
      // ... also do the loggedInActiveMxWallet check to make sure mx addresses didn't swap midway (see below for why)
      if (path === "unlock" || (loggedInActiveMxWallet && loggedInActiveMxWallet !== mxAddress)) {
        handleLogout();
        return;
      }

      // we set the 'active mx wallet', we can use this to prevent the xPortal App delayed approve bug
      // ... where wallets sessions can be swapped - https://github.com/Itheum/data-dex/issues/95
      // ... if we detect loggedInActiveMxWallet is NOT null then we abort and logout the user (see above)
      setLoggedInActiveMxWallet(mxAddress);

      if (walletUsedSession) {
        // note that a user reloaded tab will also gtag login_success
        gtagGo("auth", "login_success", walletUsedSession);
      }
    }

    if (mxAddress && isMxLoggedIn) {
      mxSessionInit();
    }
  }, [mxAddress]);

  const handleLogout = () => {
    if (mxLoginMethod === "wallet") {
      // if it's web wallet, we should not send redirect url of /, if you do redirects to web wallet and does not come back to data dex
      mxLogout(undefined, undefined, false);
    } else {
      mxLogout("/hardReload", undefined, false);
    }
  };

  const linkOrRefreshDataDATAccount = async (setExplicit?: boolean | undefined) => {
    setLoadingDataCATAccount(true);
    await sleep(3);

    // setExplicit = to link the demo account after notifying user
    if ((dataCatLinkedSession === "1" && !dataCATAccount) || setExplicit) {
      if (setExplicit) {
        setDataCatLinkedSession("1");
      }

      setDataCATAccount(dataCATDemoUserData);
    }

    setLoadingDataCATAccount(false);
  };

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
  }

  let bodyMinHeightLg = "1000px";

  if (menuItem === MENU.GETVERIFIED) {
    // whitelist page we need to reset this of bg looks bad
    bodyMinHeightLg = "lg";
  }

  return (
    <>
      {["1", "D"].includes(chainID) && (
        <StoreProvider>
          <Container maxW="100%">
            <Flex
              bgColor={colorMode === "dark" ? "bgDark" : "bgWhite"}
              flexDirection="column"
              justifyContent="space-between"
              minH="100svh"
              boxShadow={containerShadow}
              zIndex={2}>
              {/* App Header */}
              <AppHeader onShowConnectWalletModal={onShowConnectWalletModal} setMenuItem={setMenuItem} handleLogout={handleLogout} />

              {/* App Body */}
              <Box flexGrow={1} minH={{ base: "auto", lg: bodyMinHeightLg }}>
                <AuthenticatedRoutesWrapper routes={routes} unlockRoute={"/"}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />

                    <Route path="getVerified" element={<Outlet />}>
                      <Route path="" element={<GetVerified />} />
                    </Route>

                    <Route path="NFMeID" element={<Outlet />}>
                      <Route path="" element={<GetNFMeID onShowConnectWalletModal={onShowConnectWalletModal} />} />
                    </Route>

                    <Route path="guardrails" element={<Outlet />}>
                      <Route path="" element={<GuardRails />} />
                    </Route>

                    <Route path="/profile" element={<Outlet />}>
                      <Route path=":profileAddress" element={<Profile tabState={1} />} />
                      <Route path=":profileAddress/created" element={<Profile tabState={1} />} />
                      <Route path=":profileAddress/listed" element={<Profile tabState={2} />} />
                    </Route>

                    <Route path="dashboard" element={<HomeMultiversX key={rfKeys.tools} setMenuItem={setMenuItem} />} />

                    <Route path="mintdata" element={<TradeData />} />

                    {isMxLoggedIn ? (
                      <Route path="enterprise" element={<Outlet />}>
                        <Route path="" element={<Enterprise />} />
                        <Route path=":minterAddress" element={<MinterDashboard />} />
                      </Route>
                    ) : (
                      <Route path="enterprise" element={<Navigate to={"/"} />} />
                    )}

                    <Route path="datanfts" element={<Outlet />}>
                      <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                      <Route path="wallet" element={<MyDataNFTsMx tabState={1} />} />
                      <Route path="wallet/purchased" element={<MyDataNFTsMx tabState={2} />} />
                      <Route path="wallet/activity" element={<MyDataNFTsMx tabState={4} />} />
                      <Route path="wallet/favorite" element={<MyDataNFTsMx tabState={3} />} />
                      <Route path="wallet/liveliness" element={<MyDataNFTsMx tabState={5} />} />
                      <Route path="wallet/compensation" element={<MyDataNFTsMx tabState={6} />} />
                      <Route path="wallet/:nftId/:dataNonce" element={<MyDataNFTsMx tabState={1} />} />
                      <Route path="wallet/purchased/:nftId/:dataNonce" element={<MyDataNFTsMx tabState={2} />} />
                      <Route path="wallet/activity/:nftId/:dataNonce" element={<MyDataNFTsMx tabState={4} />} />
                      <Route path="marketplace/:tokenId/:offerId?" element={<DataNFTDetails onShowConnectWalletModal={onShowConnectWalletModal} />} />
                      <Route path="marketplace" element={<Navigate to={"market"} />} />
                      <Route path="marketplace/market" element={<DataNFTMarketplaceMultiversX tabState={1} />} />
                      <Route path="marketplace/market/:pageNumber" element={<DataNFTMarketplaceMultiversX tabState={1} />} />
                      <Route path="marketplace/my" element={<DataNFTMarketplaceMultiversX tabState={2} />} />
                      <Route path="marketplace/my/:pageNumber" element={<DataNFTMarketplaceMultiversX tabState={2} />} />
                    </Route>

                    {/* This are admin whitelisted routes */}
                    <Route path="bonding/" element={<Bonding />} />
                    <Route path="bonding/:bondingPageNumber" element={<Bonding />}>
                      <Route path="compensation/:compensationPageNumber" element={<Bonding />} />
                    </Route>

                    <Route path="settings" element={<AppSettings />} />

                    {isMxLoggedIn ? (
                      <Route path="liveliness" element={<Navigate to={"/datanfts/wallet/liveliness"} />} />
                    ) : (
                      <Route path="liveliness" element={<Navigate to={"/NFMeID"} />} />
                    )}

                    {/* if user logs out of wallet, we redirect to this endpoint so the page does a hard reload. or else, it does a SPA reload and state can be messed up */}
                    <Route path="/hardReload" element={<Navigate to={"/"} />} />
                  </Routes>
                </AuthenticatedRoutesWrapper>
              </Box>
              <AppFooter />
            </Flex>
          </Container>
        </StoreProvider>
      )}
    </>
  );
}

export default App;
