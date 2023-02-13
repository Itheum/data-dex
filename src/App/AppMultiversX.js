import { useEffect, useState, useRef, React } from "react";
import { SunIcon, MoonIcon, ExternalLinkIcon, WarningTwoIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Container, Heading, Flex, Spacer, Box, Stack, HStack } from "@chakra-ui/layout";
import {
  Button,
  Text,
  Image,
  AlertDialog,
  Badge,
  Spinner,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  MenuItemOption,
  useToast,
  useColorMode,
  useBreakpointValue,
} from "@chakra-ui/react";
// import { style } from "@motionone/dom";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import { logout } from "@multiversx/sdk-dapp/utils";
import { AiFillHome } from "react-icons/ai";
import { IoConstructOutline } from "react-icons/io5";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import SellDataMX from "AdvertiseData/SellDataMultiversX";
import DataCoalitions from "DataCoalition/DataCoalitions";
import DataNFTMarketplaceMultiversX from "DataNFT/DataNFTMarketplaceMultiversX";
import DataNFTs from "DataNFT/DataNFTs";
import MyDataNFTsMx from "DataNFT/MyDataNFTsMultiversX";
import HomeMx from "Home/HomeMultiversX";
import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import { useSessionStorage } from "libs/hooks";
import { MENU, CHAINS, SUPPORTED_CHAINS, CHAIN_TOKEN_SYMBOL, PATHS } from "libs/util";
import { contractsForChain, notSupportedOnChain, consoleNotice, gtagGo, debugui, clearAppSessions } from "libs/util";

import { formatNumberRoundFloor } from "libs/util";
import { checkBalance } from "MultiversX/api";
import ClaimsHistory from "MultiversX/ClaimsHistory";
import DataStreams from "Sections/DataStreams";
import DataVault from "Sections/DataVault";
import TrustedComputation from "Sections/TrustedComputation";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";
import ChainSupportedComponent from "UtilComps/ChainSupportedComponent";
import ChainSupportedInput from "UtilComps/ChainSupportedInput";
import ShortAddress from "UtilComps/ShortAddress";

const mxLogout = logout;
const _chainMetaLocal = {};
const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const baseUserContext = {
  isMoralisAuthenticated: false,
  isMxAuthenticated: false,
}; // this is needed as context is updating async in this comp using _user is out of sync - @TODO improve pattern

function App({ appConfig }) {
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { isLoggedIn: isMxLoggedIn, loginMethod: mxLoginMethod } = useGetLoginInfo();

  const { mxEnvironment } = appConfig;

  const toast = useToast();
  const [menuItem, setMenuItem] = useState(MENU.HOME);
  const [tokenBalance, setTokenBalance] = useState(-1); // -1 is loading, -2 is error
  const [mxShowClaimsHistory, setMxShowClaimsHistory] = useState(false);
  const [chain, setChain] = useState(0);
  const [isAlertOpen, setAlertIsOpen] = useState(false);
  const [rfKeys, setRfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0,
    auth: 0,
    dataNFTWallet: 0,
  });
  const [splashScreenShown, setSplashScreenShown] = useState({});
  const cancelRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { pathname } = useLocation();
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage("itm-wallet-used", null);
  const [loggedInActiveMxWallet, setLoggedInActiveMxWallet] = useState(null);

  const [itheumAccount, setItheumAccount] = useState(null);

  // context hooks
  const { user: _user, setUser } = useUser();
  const { setChainMeta } = useChainMeta();

  const navigate = useNavigate();
  const path = pathname?.split("/")[pathname?.split("/")?.length - 1]; // handling Route Path

  useEffect(() => {
    setUser({ ...baseUserContext }); // set base user context for app

    if (path) {
      setMenuItem(PATHS[path]?.[0]);
    }

    console.log(consoleNotice);
  }, []);

  useEffect(() => {
    // Mx authenticated for 1st time or is a reload.
    // ... get account token balance and claims
    async function mxSessionInit() {
      // when user disconnects in xPortal App, it comes to this route. So we need to logout the user
      // ... also do the loggedInActiveMxWallet check to make sure mx addresses didnt swap midway (see below for why)
      if (path === "unlock" || (loggedInActiveMxWallet !== null && loggedInActiveMxWallet !== mxAddress)) {
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
    // hasPendingTransactions will fire with false during init and then move from true to false each time a tranasaction is done... so if it's 'false' we need to get balances
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
      } else if (data.error) {
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
  const handleRfMount = (key) => {
    const reRf = { ...rfKeys, [key]: Date.now() };
    setRfKeys(reRf);
  };

  const doSplashScreenShown = (menuItem) => {
    setSplashScreenShown({ ...splashScreenShown, [menuItem]: true });
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

  const menuButtonW = "180px";
  const screenBreakPoint = useBreakpointValue({ base: "base", md: "md" });

  const isMenuItemSelected = (currentMenuItem) => {
    return menuItem === currentMenuItem;
  };

  const menuButtonDisabledStyle = (currentMenuItem) => {
    let styleProps = {
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

  return (
    <>
      {_user.isMxAuthenticated && (
        <Container maxW="container.xxl" h="100vh" display="flex" justifyContent="center" alignItems="center">
          <Flex h="100vh" w="100vw" direction={{ base: "column", md: "column" }}>
            <HStack h="10vh" p="5">
              <Image boxSize="50px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />

              <Heading display={["none", "initial"]}>
                <Text fontSize="sm">Itheum Data DEX</Text>
                <Text fontSize="xx-small">{dataDexVersion}</Text>
              </Heading>

              <Spacer />

              <HStack>
                <Box
                  as="text"
                  fontSize={["sm", "md"]}
                  minWidth="5.5rem"
                  align="center"
                  p="11.3px"
                  color="white"
                  fontWeight="bold"
                  borderRadius="md"
                  bgGradient="linear(to-l, #7928CA, #FF0080)"
                >
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

                <Box
                  display={["none", null, "block"]}
                  fontSize={["xs", "md"]}
                  align="center"
                  p="11.3px"
                  color="rgb(243, 183, 30)"
                  fontWeight="bold"
                  bg="rgba(243, 132, 30, 0.05)"
                  borderRadius="md"
                >
                  {chain || "..."}
                </Box>

                <Button display={["none", "initial"]} onClick={toggleColorMode}>
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
              </HStack>

              <Menu>
                <MenuButton as={Button} colorScheme="teal">
                  {screenBreakPoint === "md" && <ShortAddress address={mxAddress} fontSize="md" />}
                  <IconButton aria-label="Menu" icon={<HamburgerIcon />} display={["block", "none"]} />
                </MenuButton>
                <MenuList>
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

                  <MenuDivider display={["block", null, "none"]} />

                  <MenuGroup>
                    <MenuItem closeOnSelect={false} display={["block", null, "none"]}>
                      <Box
                        fontSize={["xs", "sm"]}
                        align="center"
                        p={2}
                        color="rgb(243, 183, 30)"
                        fontWeight="bold"
                        bg="rgba(243, 132, 30, 0.05)"
                        borderRadius="md"
                      >
                        {chain || "..."}
                      </Box>
                    </MenuItem>
                  </MenuGroup>
                </MenuList>
              </Menu>
            </HStack>

            <HStack alignItems={["center", "flex-start"]} flexDirection={["column", "row"]} pt={5}>
              <Box>
                <Button display={["block", null, "none"]} colorScheme="teal" m="auto" mb={5} onClick={() => setShowMobileMenu(!showMobileMenu)}>
                  Main menu
                </Button>

                <Stack direction="column" spacing={4} display={[(showMobileMenu && "block") || "none", "block"]}>
                  <HStack pl="3">
                    <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
                      Terms of Use <ExternalLinkIcon mx="2px" />
                    </Link>
                    <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
                      Privacy Policy <ExternalLinkIcon mx="2px" />
                    </Link>
                  </HStack>

                  <Flex direction="column" justify="space-between">
                    <Stack ml="15px" spacing={4}>
                      <HStack justify="center" pr="10" opacity={0.8}>
                        <IoConstructOutline />
                        <Text fontSize="xs" as="i">
                          Feature Coming Soon
                        </Text>
                      </HStack>

                      <Button
                        leftIcon={<AiFillHome />}
                        w={menuButtonW}
                        colorScheme="teal"
                        isDisabled={isMenuItemSelected(MENU.HOME)}
                        _disabled={menuButtonDisabledStyle(MENU.HOME)}
                        opacity={0.6}
                        onClick={() => {
                          setMenuItem(MENU.HOME);
                          navigate("home");
                          setShowMobileMenu(false);
                        }}
                      >
                        Home
                      </Button>

                      <ChainSupportedInput feature={MENU.SELL}>
                        <Button
                          w={menuButtonW}
                          colorScheme="teal"
                          isDisabled={isMenuItemSelected(MENU.SELL)}
                          _disabled={menuButtonDisabledStyle(MENU.SELL)}
                          opacity={0.6}
                          onClick={() => {
                            setMenuItem(MENU.SELL);
                            navigate("selldata");
                            setShowMobileMenu(false);
                          }}
                        >
                          Trade Data
                        </Button>
                      </ChainSupportedInput>
                    </Stack>

                    <Accordion
                      flexGrow="1"
                      defaultIndex={path ? PATHS[path][1] : [-1]}
                      allowToggle={true}
                      w="230px"
                      style={{ border: "solid 1px transparent" }}
                    >
                      <AccordionItem>
                        <AccordionButton>
                          <Button flex="1" colorScheme="teal" variant="outline">
                            Data NFTs
                          </Button>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                            <ChainSupportedInput feature={MENU.NFTMINE}>
                              <Button
                                colorScheme="teal"
                                isDisabled={isMenuItemSelected(MENU.NFTMINE)}
                                _disabled={menuButtonDisabledStyle(MENU.NFTMINE)}
                                opacity={0.6}
                                onClick={() => {
                                  if (splashScreenShown[MENU.NFT]) {
                                    navigate("datanfts/wallet");
                                    setMenuItem(MENU.NFTMINE);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.NFT);
                                    navigate("datanfts");
                                    setMenuItem(MENU.NFTMINE);
                                    setShowMobileMenu(false);
                                  }
                                }}
                              >
                                Wallet
                              </Button>
                            </ChainSupportedInput>

                            <ChainSupportedInput feature={MENU.NFTALL}>
                              <Button
                                colorScheme="teal"
                                isDisabled={isMenuItemSelected(MENU.NFTALL)}
                                _disabled={menuButtonDisabledStyle(MENU.NFTALL)}
                                opacity={0.6}
                                onClick={() => {
                                  if (splashScreenShown[MENU.NFT]) {
                                    navigate("datanfts/marketplace");
                                    setMenuItem(MENU.NFTALL);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.NFT);
                                    navigate("datanfts");
                                    setMenuItem(MENU.NFTALL);
                                    setShowMobileMenu(false);
                                  }
                                }}
                              >
                                Marketplace
                              </Button>
                            </ChainSupportedInput>
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem>
                        <AccordionButton>
                          <Button flex="1" colorScheme="teal" variant="outline">
                            Data Coalitions
                          </Button>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                            <ChainSupportedInput feature={MENU.COALITION}>
                              <Button
                                colorScheme="teal"
                                isDisabled={isMenuItemSelected(MENU.COALITIONALL)}
                                _disabled={menuButtonDisabledStyle(MENU.COALITIONALL)}
                                opacity={0.6}
                                onClick={() => {
                                  if (splashScreenShown[MENU.COALITION]) {
                                    navigate("datacoalitions/viewcoalitions");
                                    setMenuItem(MENU.COALITIONALL);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.COALITION);
                                    navigate("datacoalitions");
                                    setMenuItem(MENU.COALITION);
                                    setShowMobileMenu(false);
                                  }
                                }}
                              >
                                View Coalitions
                              </Button>
                            </ChainSupportedInput>
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem>
                        <AccordionButton>
                          <Button flex="1" colorScheme="teal" variant="outline">
                            Labs
                          </Button>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                            <ChainSupportedInput feature={MENU.VAULT}>
                              <Button
                                colorScheme="teal"
                                isDisabled={isMenuItemSelected(MENU.VAULT)}
                                _disabled={menuButtonDisabledStyle(MENU.VAULT)}
                                opacity={0.6}
                                onClick={() => {
                                  setMenuItem(MENU.VAULT);
                                  navigate("labs/datavault");
                                  setShowMobileMenu(false);
                                }}
                              >
                                Data Vault
                              </Button>
                            </ChainSupportedInput>
                            <Button
                              colorScheme="teal"
                              isDisabled={isMenuItemSelected(MENU.STREAM)}
                              _disabled={menuButtonDisabledStyle(MENU.STREAM)}
                              opacity={0.6}
                              onClick={() => {
                                setMenuItem(MENU.STREAM);
                                navigate("labs/datastreams");
                                setShowMobileMenu(false);
                              }}
                            >
                              Data Streams
                            </Button>
                            <Button
                              colorScheme="teal"
                              isDisabled={isMenuItemSelected(MENU.TRUSTEDCOMP)}
                              _disabled={menuButtonDisabledStyle(MENU.TRUSTEDCOMP)}
                              opacity={0.6}
                              onClick={() => {
                                setMenuItem(MENU.TRUSTEDCOMP);
                                navigate("labs/trustedcomputation");
                                setShowMobileMenu(false);
                              }}
                            >
                              Trusted Computation
                            </Button>
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </Flex>
                </Stack>
              </Box>

              <Box w={[null, "full"]}>
                <Routes>
                  <Route path="/"
                    element={<HomeMx
                      key={rfKeys.tools}
                      onRfMount={() => handleRfMount("tools")}
                      setMenuItem={setMenuItem}
                      itheumAccount={itheumAccount}
                      onItheumAccount={setItheumAccount} />}
                  />
                  <Route path="home"
                    element={<HomeMx
                      key={rfKeys.tools}
                      onRfMount={() => handleRfMount("tools")}
                      setMenuItem={setMenuItem}
                      itheumAccount={itheumAccount}
                      onItheumAccount={setItheumAccount} />}
                  />
                  <Route path="selldata"
                    element={<SellDataMX
                      key={rfKeys.sellData}
                      itheumAccount={itheumAccount}
                      onRfMount={() => handleRfMount("sellData")} />}
                  />
                  <Route path="datanfts" element={<Outlet />}>
                    <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                    <Route path="wallet" element={<MyDataNFTsMx key={rfKeys.dataNFTWallet} onRfMount={() => handleRfMount("dataNFTWallet")} />} />
                    <Route path="marketplace" element={<DataNFTMarketplaceMultiversX />} />
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
            </HStack>
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
                      {CHAINS[i]}
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
        </Container>
      )}
    </>
  );
}

export default App;
