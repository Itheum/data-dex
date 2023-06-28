import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { logout } from "@multiversx/sdk-dapp/utils";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import MintDataEVM from "AdvertiseData/MintDataEVM";
import MintDataMX from "AdvertiseData/MintDataMultiversX";
import DataCoalitions from "DataCoalition/DataCoalitions";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import DataNFTMarketplaceMultiversX from "DataNFT/DataNFTMarketplaceMultiversX";
import DataNFTMarketplaceEVM from "DataNFT/DataNFTMarketplaceEVM";
import DataNFTs from "DataNFT/DataNFTs";
import MyDataNFTsEVM from "DataNFT/MyDataNFTsEVM";
import MyDataNFTsMx from "DataNFT/MyDataNFTsMultiversX";
import HomeMx from "Home/HomeMultiversX";
import LandingPage from "Launch/LandingPage";
import { useLocalStorage } from "libs/hooks";
import { CHAINS, clearAppSessionsLaunchMode, consoleNotice, gtagGo, dataCATDemoUserData, MENU, PATHS, SUPPORTED_CHAINS, sleep } from "libs/util";
import { checkBalance } from "MultiversX/api";
import AppFooter from "Sections/AppFooter";
import AppHeader from "Sections/AppHeader";
import DataStreams from "Sections/DataStreams";
import DataVault from "Sections/DataVault";
import TrustedComputation from "Sections/TrustedComputation";
import { useChainMeta } from "store/ChainMetaContext";

import { ethers } from "ethers";
import { ABIS } from "../EVM/ABIs";

const mxLogout = logout;

function App({
  appConfig,
  resetAppContexts,
  onLaunchMode,
  onEVMConnection,
}: {
  appConfig: any;
  resetAppContexts: any;
  onLaunchMode: any;
  onEVMConnection: any;
}) {
  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [dataCatLinkedSession, setDataCatLinkedSession] = useLocalStorage("itm-datacat-linked", null);
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isMxLoggedIn, loginMethod: mxLoginMethod } = useGetLoginInfo();
  const { mxEnvironment } = appConfig;
  const toast = useToast();
  const [menuItem, setMenuItem] = useState(MENU.LANDING);
  const [tokenBalance, setTokenBalance] = useState(-1); // -1 is loading, -2 is error
  const [chain, setChain] = useState("");
  const [isAlertOpen, setAlertIsOpen] = useState(false);
  const [rfKeys, setRfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0,
    auth: 0,
    dataNFTWallet: 0,
  });
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { colorMode, toggleColorMode } = useColorMode();
  const { pathname } = useLocation();
  const [loggedInActiveMxWallet, setLoggedInActiveMxWallet] = useState("");
  const [dataCATAccount, setDataCATAccount] = useState<any>(null);
  const [loadingDataCATAccount, setLoadingDataCATAccount] = useState(true);

  // context hooks
  const { chainMeta: _chainMeta } = useChainMeta();

  let path = pathname?.split("/")[pathname?.split("/")?.length - 1]; // handling Route Path

  const navigate = useNavigate();

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
    if (_chainMeta?.networkId) {
      // const networkId = mxEnvironment === "mainnet" ? "E1" : "ED";

      if (_chainMeta?.isEVMAuthenticated) {
        setMenuItem(PATHS["home"]?.[0] as number);
        navigate("home");
      }

      setChain(CHAINS[_chainMeta?.networkId] || "Unknown chain");

      if (!SUPPORTED_CHAINS.includes(_chainMeta?.networkId)) {
        setAlertIsOpen(true);
      } else {
        itheumTokenBalanceUpdate(); // load initial balances (@TODO, after login is done and user reloads page, this method fires 2 times. Here and in the hasPendingTransactions effect. fix @TODO)
      }

      linkOrRefreshDataDATAccount();
    }
  }, [_chainMeta]);

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

  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a transaction is done... so if it's 'false' we need to get balances
    if (!hasPendingTransactions) {
      if (SUPPORTED_CHAINS.includes(_chainMeta?.networkId)) {
        itheumTokenBalanceUpdate();
      }
    }
  }, [hasPendingTransactions]);

  // Mx transactions state changed so need new balances
  const itheumTokenBalanceUpdate = async () => {
    if (_chainMeta?.isEVMAuthenticated) {
      const contract = new ethers.Contract(_chainMeta.contracts.itheumToken, ABIS.token, _chainMeta.ethersProvider);
      const balance = await contract.balanceOf(_chainMeta.loggedInAddress);
      const decimals = await contract.decimals();

      setTokenBalance(itheumTokenRoundUtil(balance, decimals, ethers.BigNumber));
    } else {
      if (mxAddress && isMxLoggedIn) {
        setTokenBalance(-1); // -1 is loading

        // get user token balance from mx
        const data = await checkBalance(_chainMeta.contracts.itheumToken, mxAddress, _chainMeta.networkId);

        if (typeof data.balance !== "undefined") {
          setTokenBalance(data.balance / Math.pow(10, 18));
        } else {
          setTokenBalance(-2); // -2 is error getting it

          if (!toast.isActive("er1")) {
            toast({
              id: "er1",
              title: "ER1: Could not get your token information from the MultiversX blockchain.",
              status: "error",
              isClosable: true,
              duration: null,
            });
          }
        }
      }
    }
  };

  // utility that will reload a component and reset it's state
  const handleRfMount = (key: string) => {
    const reRf = { ...rfKeys, [key]: Date.now() };
    setRfKeys(reRf);
  };

  const handleLogout = () => {
    clearAppSessionsLaunchMode();
    resetAppContexts();

    gtagGo("auth", "logout", "el");

    if (mxLoginMethod === "wallet") {
      // if it's web wallet, we should not send redirect url of /, if you do redirects to web wallet and does not come back to data dex
      mxLogout();
    } else {
      // sending in / will reload the data dex after logout is done so it cleans up data dex state
      mxLogout("/");
    }
  };

  const linkOrRefreshDataDATAccount = async (setExplicit?: boolean | undefined) => {
    setLoadingDataCATAccount(true);
    await sleep(5);

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

  const { isEVMAuthenticated, loggedInAddress } = _chainMeta;

  let bodyMinHeightLg = "1000px";

  if (menuItem === MENU.GETWHITELISTED) {
    // whitelist page we need to reset this of bg looks bad
    bodyMinHeightLg = "lg";
  }

  return (
    <>
      <Container maxW="97.5rem">
        <Flex
          bgColor={colorMode === "dark" ? "bgDark" : "white"}
          flexDirection="column"
          justifyContent="space-between"
          minH="100vh"
          boxShadow={containerShadow}
          zIndex={2}>
          {/* App Header */}
          <AppHeader
            onLaunchMode={onLaunchMode}
            tokenBalance={tokenBalance}
            menuItem={menuItem}
            setMenuItem={setMenuItem}
            handleLogout={handleLogout}
            onEVMConnection={onEVMConnection}
          />

          {/* App Body */}
          <Box flexGrow={1} minH={{ base: "auto", lg: bodyMinHeightLg }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route
                path="home"
                element={
                  <HomeMx
                    key={rfKeys.tools}
                    onRfMount={() => handleRfMount("tools")}
                    setMenuItem={setMenuItem}
                    dataCATAccount={dataCATAccount}
                    loadingDataCATAccount={loadingDataCATAccount}
                    onDataCATAccount={linkOrRefreshDataDATAccount}
                  />
                }
              />

              <Route
                path="tradedata"
                element={
                  (isEVMAuthenticated && (
                    <MintDataEVM key={rfKeys.sellData} setMenuItem={setMenuItem} dataCATAccount={dataCATAccount} onRfMount={() => handleRfMount("sellData")} />
                  )) || <MintDataMX key={rfKeys.sellData} dataCATAccount={dataCATAccount} onRfMount={() => handleRfMount("sellData")} />
                }
              />

              <Route path="datanfts" element={<Outlet />}>
                <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                {(isEVMAuthenticated && (
                  <Route path="wallet" element={<MyDataNFTsEVM key={rfKeys.dataNFTWallet} onRfMount={() => handleRfMount("dataNFTWallet")} />} />
                )) || <Route path="wallet" element={<MyDataNFTsMx key={rfKeys.dataNFTWallet} onRfMount={() => handleRfMount("dataNFTWallet")} />} />}
                <Route path="marketplace/:tokenId/:offerId?" element={<DataNFTDetails />} />
                <Route path="marketplace" element={<Navigate to={"market"} />} />

                {(isEVMAuthenticated && <Route path="marketplace/market" element={<DataNFTMarketplaceEVM tabState={1} setMenuItem={setMenuItem} />} />) || (
                  <Route path="marketplace/market" element={<DataNFTMarketplaceMultiversX tabState={1} />} />
                )}

                <Route path="marketplace/market/:pageNumber" element={<DataNFTMarketplaceMultiversX tabState={1} />} />
                <Route path="marketplace/my" element={<DataNFTMarketplaceMultiversX tabState={2} />} />
                <Route path="marketplace/my/:pageNumber" element={<DataNFTMarketplaceMultiversX tabState={2} />} />
              </Route>

              <Route path="datacoalitions" element={<Outlet />}>
                <Route path="" element={<DataCoalitions setMenuItem={setMenuItem} />} />
              </Route>

              <Route path="labs" element={<Outlet />}>
                <Route path="datastreams" element={<DataStreams />} />
                <Route path="datavault" element={<DataVault />} />
                <Route path="trustedcomputation" element={<TrustedComputation />} />
              </Route>
            </Routes>
          </Box>

          {/* App Footer */}
          <AppFooter />
        </Flex>

        {/* Chain ENV not supported alert (useful only when EVM comes in) */}
        <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={() => setAlertIsOpen(false)}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold"></AlertDialogHeader>

              <AlertDialogBody>
                Sorry the{" "}
                <Badge mb="1" mr="1" ml="1" variant="outline" fontSize="0.8em" colorScheme="teal">
                  {chain}
                </Badge>{" "}
                chain is currently not supported. We are working on it. You need to be on{" "}
                {SUPPORTED_CHAINS.map((i) => (
                  <Badge key={i} borderRadius="full" px="2" colorScheme="teal" mr="2">
                    {CHAINS[i as keyof typeof CHAINS]}
                  </Badge>
                ))}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setAlertIsOpen(false)}>
                  Close
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </>
  );
}

export default App;

const itheumTokenRoundUtil = (balance: any, decimals: any, BigNumber: any) => {
  const balanceWeiString = balance.toString();
  const balanceWeiBN = BigNumber.from(balanceWeiString);
  const decimalsBN = BigNumber.from(decimals);
  const divisor = BigNumber.from(10).pow(decimalsBN);
  const beforeDecimal = balanceWeiBN.div(divisor);

  return beforeDecimal.toString();
};
