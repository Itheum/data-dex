import React, {useEffect, useRef, useState} from "react";
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
import {useGetAccountInfo, useGetLoginInfo} from "@multiversx/sdk-dapp/hooks/account";
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import {logout} from "@multiversx/sdk-dapp/utils";
import {Outlet, Route, Routes, useLocation} from "react-router-dom";
import SellDataMX from "AdvertiseData/SellDataMultiversX";
import DataCoalitions from "DataCoalition/DataCoalitions";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import DataNFTMarketplaceMultiversX from "DataNFT/DataNFTMarketplaceMultiversX";
import DataNFTs from "DataNFT/DataNFTs";
import MyDataNFTsMx from "DataNFT/MyDataNFTsMultiversX";
import HomeMx from "Home/HomeMultiversX";
import LandingPage from "Launch/LandingPage";
import {useLocalStorage} from "libs/hooks";
import {CHAINS, clearAppSessionsLaunchMode, consoleNotice, gtagGo, MENU, PATHS, SUPPORTED_CHAINS,} from "libs/util";
import {checkBalance} from "MultiversX/api";
import AppFooter from "Sections/AppFooter";
import AppHeader from "Sections/AppHeader";
import DataStreams from "Sections/DataStreams";
import DataVault from "Sections/DataVault";
import TrustedComputation from "Sections/TrustedComputation";
import {useChainMeta} from "store/ChainMetaContext";
import {MdOnlinePrediction, MdOutlineAccountBalanceWallet, MdOutlineDataSaverOn} from "react-icons/md";

const exploreRouterMenu = [
  {
    sectionId: "Movies",
    sectionLabel: "Movies",
    sectionItems: [
      {
        menuEnum: MENU.SELL,
        path: "tradedata",
        label: "Trade Data",
        shortLbl: "Trade",
        Icon: MdOutlineDataSaverOn,
      },
      {
        menuEnum: MENU.NFTMINE,
        path: "datanfts/wallet",
        label: "Data NFT Wallet",
        shortLbl: "Wallet",
        Icon: MdOutlineAccountBalanceWallet,
      },
      {
        menuEnum: MENU.NFTALL,
        path: "datanfts/marketplace/market/0",
        label: "Data NFT Marketplace",
        shortLbl: "Market",
        Icon: MdOnlinePrediction,
      },
    ],
  },
];

const mxLogout = logout;

function App({ appConfig, resetAppContexts, onLaunchMode }: { appConfig: any, resetAppContexts: any, onLaunchMode: any }) {
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
  const [walletUsedSession, setWalletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [loggedInActiveMxWallet, setLoggedInActiveMxWallet] = useState("");
  const [itheumAccount, setItheumAccount] = useState(null);

  // context hooks
  const { chainMeta: _chainMeta } = useChainMeta();

  let path = pathname?.split("/")[pathname?.split("/")?.length - 1]; // handling Route Path

  useEffect(() => {
    // console.log('********** AppMultiversX LOAD _chainMeta ', _chainMeta);

    if (path) {
      // we can use - to tag path keys. e.g. offer-44 is path key offer. So remove anything after - if needed
      // also, NFTDETAILS key is for path like DATANFTFT2-71ac28-79 so allow for this custom logic
      if (path.includes('DATANFT')) {
        path = 'nftdetails';
      }
      else if (path.includes('-')) {
        path = path.split('-')[0];
      }

      setMenuItem(PATHS[path as keyof typeof PATHS]?.[0] as number);
    }

    console.log(consoleNotice);
  }, []);

  useEffect(() => {
    if (_chainMeta?.networkId) {
      const networkId = mxEnvironment === "mainnet" ? "E1" : "ED";

      setChain(CHAINS[networkId] || "Unknown chain");

      if (!SUPPORTED_CHAINS.includes(networkId)) {
        setAlertIsOpen(true);
      } else {
        itheumTokenBalanceUpdate(); // load initial balances (@TODO, after login is done and user reloads page, this method fires 2 times. Here and in the hasPendingTransactions effect. fix @TODO)
      }
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

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
  }

  return (
    <>
      <Container maxW="container.xl">
        <Flex
          bgColor={colorMode === "dark" ? "black" : "white"}
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
          />

          {/* App Body */}
          <Box backgroundColor="none" flexGrow="1" p={menuItem !== MENU.LANDING ? "5" : "0"} mt={menuItem !== MENU.LANDING ? "5" : "0"}>
            <Routes>

              <Route path="/"
                element={
                  <LandingPage />
                }
              />

              <Route path="home"
                element={
                  <HomeMx
                    key={rfKeys.tools}
                    onRfMount={() => handleRfMount("tools")}
                    setMenuItem={setMenuItem}
                    itheumAccount={itheumAccount}
                    onItheumAccount={setItheumAccount}
                  />}
              />

              <Route
                path="tradedata"
                element={<SellDataMX key={rfKeys.sellData} itheumAccount={itheumAccount} onRfMount={() => handleRfMount("sellData")} />}
              />

              <Route path="datanfts" element={<Outlet />}>
                <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                <Route path="wallet" element={<MyDataNFTsMx key={rfKeys.dataNFTWallet} onRfMount={() => handleRfMount("dataNFTWallet")} />} />
                <Route path="marketplace/:tokenId/:offerId?" element={<DataNFTDetails />} />
                <Route path="marketplace/my" element={<DataNFTMarketplaceMultiversX tabState={2} />} />
                <Route path="marketplace/market/:pageNumber" element={<DataNFTMarketplaceMultiversX tabState={1} />} />
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
