import React, { useEffect, useRef, useState } from "react";
import { ExternalLinkIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  List,
  ListIcon,
  ListItem,
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
  Heading,
  Stack,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  Spinner,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { logout } from "@multiversx/sdk-dapp/utils";
import { AiFillHome } from "react-icons/ai";
import { MdDarkMode, MdExpandLess, MdExpandMore, MdLightMode, MdMenu } from "react-icons/md";
import { MdOutlineAccountBalanceWallet, MdOutlineDataSaverOn, MdOnlinePrediction } from "react-icons/md";
import { Outlet, Route, Routes, useLocation, useNavigate, Link as ReactRouterLink } from "react-router-dom";
import SellDataMX from "AdvertiseData/SellDataMultiversX";
import DataCoalitions from "DataCoalition/DataCoalitions";
import DataNFTDetails from "DataNFT/DataNFTDetails";
import DataNFTMarketplaceMultiversX from "DataNFT/DataNFTMarketplaceMultiversX";
import DataNFTs from "DataNFT/DataNFTs";
import MyDataNFTsMx from "DataNFT/MyDataNFTsMultiversX";
import HomeMx from "Home/HomeMultiversX";
import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import { useSessionStorage } from "libs/hooks";
import {
  CHAIN_TOKEN_SYMBOL,
  CHAINS,
  clearAppSessions,
  consoleNotice,
  contractsForChain,
  debugui,
  formatNumberRoundFloor,
  gtagGo,
  MENU,
  PATHS,
  SUPPORTED_CHAINS,
} from "libs/util";
import { checkBalance } from "MultiversX/api";
import ClaimsHistory from "MultiversX/ClaimsHistory";
import DataStreams from "Sections/DataStreams";
import DataVault from "Sections/DataVault";
import TrustedComputation from "Sections/TrustedComputation";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";
import ShortAddress from "UtilComps/ShortAddress";

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
const _chainMetaLocal: {
  networkId: string,
  contracts: any,
} = {
  networkId: "",
  contracts: undefined,
};
const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = `env:${process.env.REACT_APP_ENV_SENTRY_PROFILE}`;

const baseUserContext = {
  isMxAuthenticated: false,
}; // this is needed as context is updating async in this comp using _user is out of sync - @TODO improve pattern

function App({ appConfig }: { appConfig: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const { colorMode, toggleColorMode } = useColorMode();

  const navigateToDiscover = (menuEnum: number) => {
    setMenuItem(menuEnum);
    if (isOpen) onClose();
  };

  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isMxLoggedIn, loginMethod: mxLoginMethod } = useGetLoginInfo();

  const { mxEnvironment } = appConfig;

  const toast = useToast();
  const [menuItem, setMenuItem] = useState(MENU.HOME);
  const [tokenBalance, setTokenBalance] = useState(-1); // -1 is loading, -2 is error
  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
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
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage("itm-wallet-used", null);
  const [loggedInActiveMxWallet, setLoggedInActiveMxWallet] = useState("");

  const [itheumAccount, setItheumAccount] = useState(null);

  // context hooks
  const { user: _user, setUser } = useUser();
  const { setChainMeta } = useChainMeta();

  const navigate = useNavigate();
  const path = pathname?.split("/")[pathname?.split("/")?.length - 1]; // handling Route Path

  useEffect(() => {
    setUser({ ...baseUserContext }); // set base user context for app

    if (path) {
      setMenuItem(PATHS[path as keyof typeof PATHS]?.[0] as number);
    }

    console.log(consoleNotice);
  }, []);

  useEffect(() => {
    // Mx authenticated for 1st time or is a reload.
    // ... get account token balance and claims
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

      const networkId = mxEnvironment === "mainnet" ? "E1" : "ED";

      _chainMetaLocal.networkId = networkId;
      _chainMetaLocal.contracts = contractsForChain(networkId);

      if (walletUsedSession) {
        // note that a user reloaded tab will also gtag login_success
        gtagGo("auth", "login_success", walletUsedSession);
      }

      setChain(CHAINS[networkId] || "Unknown chain");

      setChainMeta({
        networkId,
        contracts: contractsForChain(networkId),
        walletUsed: walletUsedSession,
      });

      setUser({
        ...baseUserContext,
        ..._user,
        isMxAuthenticated: true,
        loggedInAddress: mxAddress,
      });

      if (!SUPPORTED_CHAINS.includes(networkId)) {
        setAlertIsOpen(true);
      } else {
        itheumTokenBalanceUpdate(); // load initial balances (@TODO, after login is done and user reloads page, this method fires 2 times. Here and in the hasPendingTransactions effect. fix @TODO)
      }
    }

    if (mxAddress && isMxLoggedIn) {
      mxSessionInit();
    }
  }, [mxAddress]);

  useEffect(() => {
    // hasPendingTransactions will fire with false during init and then move from true to false each time a transaction is done... so if it's 'false' we need to get balances
    if (!hasPendingTransactions) {
      if (SUPPORTED_CHAINS.includes(_chainMetaLocal.networkId)) {
        itheumTokenBalanceUpdate();
      }
    }
  }, [hasPendingTransactions]);

  // Mx transactions state changed so need new balances
  const itheumTokenBalanceUpdate = async () => {
    if (mxAddress && isMxLoggedIn) {
      setTokenBalance(-1); // -1 is loading

      // get user token balance from mx
      const data = await checkBalance(_chainMetaLocal.contracts.itheumToken, mxAddress, _chainMetaLocal.networkId);

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
    clearAppSessions();

    setUser({ ...baseUserContext });
    setChainMeta({});

    gtagGo("auth", "logout", "el");

    if (mxLoginMethod === "wallet") {
      // if it's web wallet, we should not send redirect url of /, if you do redirects to web wallet and does not come back to data dex
      mxLogout();
    } else {
      // sending in / will reload the data dex after logout is done so it cleans up data dex state
      mxLogout("/");
    }
  };

  debugui(`walletUsedSession ${walletUsedSession}`);
  debugui(`_chainMetaLocal.networkId ${_chainMetaLocal.networkId}`);

  // const screenBreakPoint = useBreakpointValue({ base: "base", md: "md" });
  //// e.g. {screenBreakPoint === "md" && <ShortAddress address={mxAddress} fontSize="md" />}

  const isMenuItemSelected = (currentMenuItem: number) => {
    return menuItem === currentMenuItem;
  };

  const menuButtonDisabledStyle = (currentMenuItem: number) => {
    let styleProps: any = {
      cursor: "not-allowed",
    };
    if (isMenuItemSelected(currentMenuItem)) {
      styleProps = {
        opacity: 1,
        ...styleProps,
      };
    }
    return styleProps;
  };

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
  }

  return (
    <>
      {_user.isMxAuthenticated && (
        <Container maxW="container.xl">
          <Flex
            bgColor={colorMode === "dark" ? "black" : undefined}
            flexDirection="column"
            justifyContent={"space-between"}
            minH="100vh"
            px={4}
            boxShadow={containerShadow}
            zIndex={2}>
            <Flex h="5rem" alignItems={"center"} justifyContent={"space-between"} backgroundColor="none" borderBottom="solid 1px">
              <HStack alignItems={"center"} spacing={4}>
                <IconButton
                  size={"sm"}
                  variant={"ghost"}
                  icon={
                    <MdMenu
                      style={{
                        transform: "translateX(65%)",
                      }}
                    />
                  }
                  display={{
                    md: "none",
                  }}
                  aria-label={"Open Menu"}
                  onClick={isOpen ? onClose : onOpen}
                />
                <Link as={ReactRouterLink} to="/" style={{ textDecoration: "none" }} onClick={() => { navigateToDiscover(MENU.HOME); }}>
                  <HStack>
                    <Image boxSize="50px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />
                    <Heading fontWeight={"normal"} size={"md"}>
                      <Text fontSize="lg">Itheum Data DEX</Text>
                    </Heading>
                  </HStack>
                </Link>
              </HStack>

              <HStack alignItems={"center"} spacing={2}>
                <HStack display={{ base: "none", md: "none", xl: "block" }}>
                  {exploreRouterMenu[0].sectionItems.map((quickMenuItem) => {
                    const { path, menuEnum, shortLbl, Icon } = quickMenuItem;
                    return (
                      <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                        <Button
                          colorScheme="teal"
                          variant="outline"
                          isDisabled={isMenuItemSelected(menuEnum)}
                          _disabled={menuButtonDisabledStyle(menuEnum)}
                          opacity={0.6}
                          key={shortLbl}
                          leftIcon={<Icon size={"1.25em"} />}
                          size="sm"
                          onClick={() => navigateToDiscover(menuEnum)}>
                          {shortLbl}
                        </Button>
                      </Link>
                    );
                  })}
                </HStack>

                <ItheumTokenBalanceBadge tokenBalance={tokenBalance} displayParams={["none", null, "block"]} />

                <LoggedInChainBadge chain={chain} displayParams={["none", null, "block"]} />

                <Box display={{ base: "none", md: "block" }}>
                  {exploreRouterMenu.map((menu) => (
                    <Menu key={menu.sectionId}>
                      <MenuButton as={Button} size={"sm"} rightIcon={<MdExpandMore />}>
                        <ShortAddress address={mxAddress} fontSize="md" />
                      </MenuButton>
                      <MenuList maxW={"fit-content"}>
                        {menu.sectionItems.map((menuItem) => {
                          const { label, path, menuEnum, Icon } = menuItem;
                          return (
                            <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                              <MenuItem key={label} onClick={() => navigateToDiscover(menuEnum)}>
                                <Icon size={"1.25em"} style={{ marginRight: "1rem" }} />
                                {label}
                              </MenuItem>
                            </Link>
                          );
                        })}

                        <MenuDivider />

                        <MenuGroup title="My Address Quick Copy">
                          <MenuItemOption closeOnSelect={false}>
                            <ShortAddress address={mxAddress} fontSize="sm" />
                          </MenuItemOption>

                          <MenuDivider />
                        </MenuGroup>

                        <MenuGroup>
                          {_user.isMxAuthenticated && (
                            <ChainSupportedComponent feature={MENU.CLAIMS}>
                              <MenuItem closeOnSelect={false} onClick={() => setMxShowClaimsHistory(true)}>
                                <Text fontSize="sm">View claims history</Text>
                              </MenuItem>
                            </ChainSupportedComponent>
                          )}

                          <MenuItem onClick={handleLogout} fontSize="sm">
                            Logout
                          </MenuItem>
                        </MenuGroup>
                      </MenuList>
                    </Menu>
                  ))}
                </Box>
                <Link as={ReactRouterLink} to={""} style={{ textDecoration: "none" }}>
                  <IconButton
                    size={"sm"}
                    icon={<AiFillHome />}
                    aria-label={"Back to Home"}
                    isDisabled={isMenuItemSelected(MENU.HOME)}
                    _disabled={menuButtonDisabledStyle(MENU.HOME)}
                    opacity={0.6}
                    onClick={() => {
                      navigateToDiscover(MENU.HOME);
                    }}
                  />
                </Link>

                <IconButton
                  size={"sm"}
                  icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
                  aria-label={"Change Color Theme"}
                  onClick={toggleColorMode}
                />
              </HStack>
            </Flex>

            <Box backgroundColor="none" flexGrow="1" p="5" mt="5">
              <Box>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomeMx
                        key={rfKeys.tools}
                        onRfMount={() => handleRfMount("tools")}
                        setMenuItem={setMenuItem}
                        itheumAccount={itheumAccount}
                        onItheumAccount={setItheumAccount}
                      />
                    }
                  />
                  <Route
                    path="home"
                    element={
                      <HomeMx
                        key={rfKeys.tools}
                        onRfMount={() => handleRfMount("tools")}
                        setMenuItem={setMenuItem}
                        itheumAccount={itheumAccount}
                        onItheumAccount={setItheumAccount}
                      />
                    }
                  />
                  <Route
                    path="tradedata"
                    element={<SellDataMX key={rfKeys.sellData} itheumAccount={itheumAccount} onRfMount={() => handleRfMount("sellData")} />}
                  />
                  <Route path="datanfts" element={<Outlet />}>
                    <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                    <Route path="wallet" element={<MyDataNFTsMx key={rfKeys.dataNFTWallet} onRfMount={() => handleRfMount("dataNFTWallet")} />} />
                    <Route path="nft/:tokenId" element={<DataNFTDetails />} />
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
            </Box>

            <Box backgroundColor="none" height={"5rem"} borderTop="solid 1px">
              <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Text fontSize="xx-small">{dataDexVersion} {nonProdEnv && <>{nonProdEnv}</>}</Text>
                <HStack>
                  <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
                    Terms of Use <ExternalLinkIcon mx="2px" />
                  </Link>
                  <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
                    Privacy Policy <ExternalLinkIcon mx="2px" />
                  </Link>
                </HStack>
              </Flex>
            </Box>
          </Flex>

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

          {mxShowClaimsHistory && (
            <ClaimsHistory mxAddress={mxAddress} networkId={_chainMetaLocal.networkId} onAfterCloseChaimsHistory={() => setMxShowClaimsHistory(false)} />
          )}

          <Drawer placement={"left"} onClose={onClose} isOpen={isOpen} blockScrollOnMount={false}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerHeader borderBottomWidth={"1px"} display={"flex"} alignItems={"center"}>
                <Heading size={"sm"} onClick={onClose}>
                  Itheum Data DEX
                </Heading>
                <DrawerCloseButton />
              </DrawerHeader>
              <DrawerBody p={0}>
                <Accordion allowMultiple>
                  {exploreRouterMenu.map((menu) => (
                    <AccordionItem key={menu.sectionId}>
                      {({ isExpanded }) => (
                        <>
                          <AccordionButton display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                            <Text m={0} fontWeight={"bold"}>
                              <ShortAddress address={mxAddress} fontSize="md" />
                            </Text>
                            {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                          </AccordionButton>
                          <AccordionPanel p={0}>
                            <List>
                              {menu.sectionItems.map((menuItem) => {
                                const { label, menuEnum, path, Icon } = menuItem;
                                return (
                                  <Link as={ReactRouterLink} to={path} style={{ textDecoration: "none" }} key={path}>
                                    <ListItem
                                      as={Button}
                                      variant={"ghost"}
                                      w={"full"}
                                      borderRadius={"0"}
                                      display={"flex"}
                                      justifyContent={"start"}
                                      p={3}
                                      key={label}
                                      onClick={() => navigateToDiscover(menuEnum)}>
                                      <ListIcon
                                        as={() =>
                                          Icon({
                                            size: "1.25em",
                                            style: { marginRight: "0.75rem" },
                                          })
                                        }
                                      />
                                      <Text mt={-1}>{label}</Text>
                                    </ListItem>
                                  </Link>
                                );
                              })}

                              <ListItem
                                as={Button}
                                variant={"ghost"}
                                w={"full"}
                                borderRadius={"0"}
                                display={"flex"}
                                justifyContent={"start"}
                                p={3}
                                onClick={() => setMxShowClaimsHistory(true)}>
                                View claims history
                              </ListItem>

                              <ListItem
                                as={Button}
                                variant={"ghost"}
                                w={"full"}
                                borderRadius={"0"}
                                display={"flex"}
                                justifyContent={"start"}
                                p={3}
                                onClick={handleLogout}>
                                Logout
                              </ListItem>
                            </List>
                          </AccordionPanel>
                        </>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>

                <Stack width="60%" spacing="3" m="1rem auto">
                  <LoggedInChainBadge chain={chain} displayParams={["block", null, "none"]} />

                  <ItheumTokenBalanceBadge tokenBalance={tokenBalance} displayParams={["block", null, "none"]} />
                </Stack>
              </DrawerBody>
              <DrawerFooter display={"flex"} justifyContent={"center"} alignItems={"center"} borderTopWidth={"1px"}>
                <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                  <Text fontSize="xx-small">{dataDexVersion}</Text>
                  <HStack>
                    <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
                      Terms of Use <ExternalLinkIcon mx="2px" />
                    </Link>
                    <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
                      Privacy Policy <ExternalLinkIcon mx="2px" />
                    </Link>
                  </HStack>
                </Flex>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Container>
      )}
    </>
  );
}

export default App;

function ItheumTokenBalanceBadge({ tokenBalance, displayParams }: { tokenBalance: any, displayParams: any }) {
  return (
    <Box
      display={displayParams}
      fontSize={["xs", "md"]}
      minWidth="5.5rem"
      textAlign="center"
      color="white"
      fontWeight="bold"
      borderRadius="md"
      height="2rem"
      padding="6px 11px"
      bgGradient="linear(to-l, #7928CA, #FF0080)">
      {tokenBalance === -1 ? (
        <Spinner size="xs" />
      ) : tokenBalance === -2 ? (
        <WarningTwoIcon />
      ) : (
        <>
          {CHAIN_TOKEN_SYMBOL(_chainMetaLocal.networkId)} {formatNumberRoundFloor(tokenBalance)}
        </>
      )}
    </Box>
  );
}

function LoggedInChainBadge({ chain, displayParams }: { chain: any, displayParams: any }) {
  return (
    <Box
      display={displayParams}
      fontSize={["xs", "md"]}
      textAlign="center"
      color="rgb(243, 183, 30)"
      fontWeight="bold"
      bg="rgba(243, 132, 30, 0.05)"
      borderRadius="md"
      height="2rem"
      padding="6px 11px">
      {chain || "..."}
    </Box>
  );
}
