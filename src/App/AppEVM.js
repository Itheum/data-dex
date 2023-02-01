import { useEffect, useState, useRef, React } from 'react';
import { Outlet, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Button, Text, Image, AlertDialog, Badge, Spinner, IconButton,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, 
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, 
  Link, Menu, MenuButton, MenuList, MenuItem, MenuGroup, MenuDivider, MenuItemOption,
  useColorMode, useBreakpointValue } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack } from '@chakra-ui/layout';
import { SunIcon, MoonIcon, ExternalLinkIcon, WarningTwoIcon, HamburgerIcon } from '@chakra-ui/icons';
import { GiReceiveMoney } from 'react-icons/gi';
import { AiFillHome } from 'react-icons/ai';
import { IoConstructOutline } from 'react-icons/io5';
import SellDataEVM from 'AdvertiseData/SellDataEVM';
import BuyData from 'DataPack/BuyData';
import PurchasedData from 'DataPack/PurchasedData';
import AdvertisedData from 'DataPack/AdvertisedData';
import PersonalDataProofs from 'DataPack/PersonalDataProofs';
import ShortAddress from 'UtilComps/ShortAddress';
import HomeEVM from 'Home/HomeEVM';
import ChainTransactions from 'Sections/ChainTransactions';
import DataVault from 'Sections/DataVault';
import DataNFTs from 'DataNFT/DataNFTs';
import MyDataNFTsEVM from 'DataNFT/MyDataNFTsEVM';
import DataNFTMarketplace from 'DataNFT/DataNFTMarketplace';
import DataStreams from 'Sections/DataStreams';
import DataCoalitions from 'DataCoalition/DataCoalitions';
import DataCoalitionsViewAll from 'DataCoalition/DataCoalitionsViewAll';
import TrustedComputation from 'Sections/TrustedComputation';
import ChainSupportedInput from 'UtilComps/ChainSupportedInput';
import { itheumTokenRoundUtil, contractsForChain, notSupportedOnChain, consoleNotice, gtagGo, debugui, clearAppSessions } from 'libs/util';
import { MENU, CHAINS, SUPPORTED_CHAINS, CHAIN_TOKEN_SYMBOL, PATHS } from 'libs/util';
import { ABIS } from 'EVM/ABIs';
import { useUser } from 'store/UserContext';
import { useChainMeta } from 'store/ChainMetaContext';
import { useSessionStorage } from 'libs/hooks';
import logoSmlD from 'img/logo-sml-d.png';
import logoSmlL from 'img/logo-sml-l.png';
import { useMoralis } from 'react-moralis';

const _chainMetaLocal = {};
const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : 'version number unknown';

const baseUserContext = {
  isMoralisAuthenticated: false,
  isMxAuthenticated: false,
}; // this is needed as context is updating aync in this comp using _user is out of sync - @TODO improve pattern

function App({ appConfig }) {
  const {
    onMoralisLogout
  } = appConfig;

  const {
    isAuthenticated,
    user,
    Moralis: { web3Library: ethers },
  } = useMoralis();

  const { web3: web3Provider, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();

  const [menuItem, setMenuItem] = useState(MENU.HOME);
  const [tokenBal, setTokenBal] = useState(-1); // -1 is loading, -2 is error
  const [chain, setChain] = useState(0);
  const [itheumAccount, setItheumAccount] = useState(null);
  const [isAlertOpen, setAlertIsOpen] = useState(false);
  const [rfKeys, setRfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0,
    auth: 0,
  });
  const [splashScreenShown, setSplashScreenShown] = useState({});
  const cancelRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { pathname } = useLocation();
  const [walletUsedSession, setWalletUsedSession] = useSessionStorage('itm-wallet-used', null);

  // context hooks
  const { user: _user, setUser } = useUser();
  const { setChainMeta } = useChainMeta();

  const navigate = useNavigate();
  const path = pathname?.split('/')[pathname?.split('/')?.length - 1]; // handling Route Path

  useEffect(() => {
    setUser({ ...baseUserContext }); // set base user context for app

    if (path) {
      setMenuItem(PATHS[path]?.[0]);
    }

    console.log(consoleNotice);
  }, []);

  useEffect(() => {
    // Moralis authenticated for 1st time or is a reload.
    // ... on reload we restore their web3Session to ethers.js
    if (user && isAuthenticated) {
      setUser({
        ...baseUserContext,
        ..._user,
        isMoralisAuthenticated: isAuthenticated,
        loggedInAddress: user.get('ethAddress')
      });

      enableWeb3(); // default to metamask
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    async function getBalances() {
      // user is Moralis authenticated and we have a web3 provider to talk to chain
      if (user && isWeb3Enabled) {
        const networkId = web3Provider.network.chainId;

        setChain(CHAINS[networkId] || 'Unknown chain');

        if (!SUPPORTED_CHAINS.includes(networkId)) {
          setAlertIsOpen(true);
        } else {
          _chainMetaLocal.networkId = networkId;
          _chainMetaLocal.contracts = contractsForChain(networkId);

          if (walletUsedSession) {
            gtagGo('auth', 'login_success', walletUsedSession);
          }

          setChainMeta({
            networkId,
            contracts: contractsForChain(networkId)
          });

          await web3_getTokenBalance(); // get itheum token balance from EVM
        }
      }
    }

    getBalances();
  }, [user, isWeb3Enabled]);

  const handleRefreshTokenBalance = async () => {
    await web3_getTokenBalance();
  };

  const web3_getTokenBalance = async () => {
    if (!_chainMetaLocal.contracts) {
      return;
    }

    setTokenBal(-1); // -1 is loading

    const walletAddress = user.get('ethAddress');

    /*
    // Example of running a contract via moralis's runContractFunction (for reference)
    // you will need const Web3Api = useMoralisWeb3Api();

    let options = {
      chain: CHAIN_NAMES[_chainMetaLocal.networkId],
      address: _chainMetaLocal.contracts.itheumToken,
      function_name: 'decimals',
      abi: ABIS.token,
    };
    
    const decimals = await Web3Api.native.runContractFunction(options);

    options = {...options, function_name: 'balanceOf', params: {account: walletAddress}};
    const balance = await Web3Api.native.runContractFunction(options);
    */

    // call contract via ethers
    const contract = new ethers.Contract(_chainMetaLocal.contracts.itheumToken, ABIS.token, web3Provider);
    const balance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();

    // show the token balance in readable format
    setTokenBal(itheumTokenRoundUtil(balance, decimals, ethers.BigNumber));
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

    gtagGo('auth', 'logout', 'evm');
    onMoralisLogout();  
  };
  
  debugui(`walletUsedSession ${walletUsedSession}`);

  const menuButtonW = '180px';
  const screenBreakPoint = useBreakpointValue({ base: 'base', md: 'md' });

  return (
    <>
      {_user.isMoralisAuthenticated&& (
        <Container maxW="container.xxl" h="100vh" display="flex" justifyContent="center" alignItems="center">
          <Flex h="100vh" w="100vw" direction={{ base: 'column', md: 'column' }}>
            <HStack h="10vh" p="5">
              <Image boxSize="50px" height="auto" src={colorMode === 'light' ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />

              <Heading display={['none', 'initial']}>
                <Text fontSize="sm">Itheum Data DEX</Text>
                <Text fontSize="xx-small">{dataDexVersion}</Text>
              </Heading>

              <Spacer />

              <HStack>
                <Box as="text" fontSize={['sm', 'md']} minWidth="5.5rem" align="center" p="11.3px" color="white" fontWeight="bold" borderRadius="md" bgGradient="linear(to-l, #7928CA, #FF0080)">
                  {(tokenBal === -1) ? <Spinner size="xs" /> : 
                      (tokenBal === -2) ? <WarningTwoIcon /> : <>{CHAIN_TOKEN_SYMBOL(_chainMetaLocal.networkId)} {tokenBal}</>
                  }
                </Box>

                <Box display={['none', null, 'block']} fontSize={['xs', 'md']} align="center" p="11.3px" color="rgb(243, 183, 30)" fontWeight="bold" bg="rgba(243, 132, 30, 0.05)" borderRadius="md">
                  {chain || '...'}
                </Box>

                <Button display={['none', 'initial']} onClick={toggleColorMode}>{colorMode === 'light' ? <MoonIcon /> : <SunIcon />}</Button>
              </HStack>

              <Menu>
                <MenuButton as={Button} colorScheme='teal'>
                  {screenBreakPoint === 'md' && <ShortAddress address={user.get('ethAddress')} fontSize="md" />}
                  <IconButton aria-label='Menu' icon={<HamburgerIcon />} display={['block', 'none']} />
                </MenuButton>
                <MenuList>
                  <MenuGroup title='My Address Quick Copy'>
                    <MenuItemOption closeOnSelect={false}>
                      <ShortAddress address={user.get('ethAddress')} fontSize="sm" />
                    </MenuItemOption>

                    <MenuDivider />
                  </MenuGroup>

                  <MenuGroup>
                    <MenuItem onClick={handleLogout} fontSize="sm">
                      Logout
                    </MenuItem>
                  </MenuGroup>

                  <MenuDivider display={['block', null, 'none']} />

                  <MenuGroup>
                    <MenuItem closeOnSelect={false} display={['block', null, 'none']}>
                      <Box fontSize={['xs', 'sm']} align="center" p={2} color="rgb(243, 183, 30)" fontWeight="bold" bg="rgba(243, 132, 30, 0.05)" borderRadius="md">
                        {chain || '...'}
                      </Box>
                    </MenuItem>
                  </MenuGroup>
                </MenuList>
              </Menu>
            </HStack>

            <HStack alignItems={['center', , 'flex-start']} flexDirection={['column', , 'row']} pt={5}>
              <Box>
                <Button display={['block', null, 'none']} colorScheme="teal" variant="solid" m="auto" mb={5} onClick={() => setShowMobileMenu(!showMobileMenu)}>
                  Main menu
                </Button>

                <Stack direction="column" spacing={4} display={[(showMobileMenu && 'block') || 'none', , 'block']}>
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
                      <HStack justify="center" pr="10" opacity={.8}>
                        <IoConstructOutline />
                        <Text fontSize="xs" as="i">Feature Coming Soon</Text>
                      </HStack>

                      <Button
                        rightIcon={<AiFillHome />}
                        w={menuButtonW}
                        colorScheme="teal"
                        isDisabled={menuItem === MENU.HOME}
                        variant="solid"
                        onClick={() => {
                          setMenuItem(MENU.HOME);
                          navigate('home');
                          setShowMobileMenu(false);
                        }}
                      >
                        Home
                      </Button>

                      <ChainSupportedInput feature={MENU.SELL}>
                        <Button
                          rightIcon={<GiReceiveMoney />}
                          w={menuButtonW}
                          colorScheme="teal"
                          isDisabled={menuItem === MENU.SELL}
                          variant="solid"
                          onClick={() => {
                            setMenuItem(MENU.SELL);
                            navigate('selldata');
                            setShowMobileMenu(false);
                          }}
                        >
                          Trade Data
                        </Button>
                      </ChainSupportedInput>
                    </Stack>

                    <Accordion flexGrow="1" defaultIndex={path ? PATHS[path][1] : [-1]} allowToggle={true} w="230px" style={{ border: 'solid 1px transparent' }}>
                      <AccordionItem>
                        <AccordionButton>
                          <Button flex="1" colorScheme="teal" variant="outline">
                            Data Packs
                          </Button>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                            <ChainSupportedInput feature={MENU.BUY}>
                              <Button
                                colorScheme="teal"
                                isDisabled={menuItem === MENU.BUY}
                                onClick={() => {
                                  setMenuItem(MENU.BUY);
                                  navigate('datapacks/buydata');
                                  setShowMobileMenu(false);
                                }}
                              >
                                Buy Data
                              </Button>
                            </ChainSupportedInput>
                            <ChainSupportedInput feature={MENU.ADVERTISED}>
                              <Button
                                colorScheme="teal"
                                isDisabled={menuItem === MENU.ADVERTISED}
                                onClick={() => {
                                  setMenuItem(MENU.ADVERTISED);
                                  navigate('datapacks/advertiseddata');
                                  setShowMobileMenu(false);
                                }}
                              >
                                Advertised Data
                              </Button>
                            </ChainSupportedInput>
                            <ChainSupportedInput feature={MENU.PURCHASED}>
                              <Button
                                colorScheme="teal"
                                isDisabled={menuItem === MENU.PURCHASED}
                                onClick={() => {
                                  setMenuItem(MENU.PURCHASED);
                                  navigate('datapacks/purchaseddata');
                                  setShowMobileMenu(false);
                                }}
                              >
                                Purchased Data
                              </Button>
                            </ChainSupportedInput>
                            <ChainSupportedInput feature={MENU.DATAPROOFS}>
                              <Button
                                colorScheme="teal"
                                isDisabled={menuItem === MENU.DATAPROOFS}
                                onClick={() => {
                                  setMenuItem(MENU.DATAPROOFS);
                                  navigate('datapacks/personaldataproof');
                                  setShowMobileMenu(false);
                                }}
                              >
                                Personal Data Proofs
                              </Button>
                            </ChainSupportedInput>
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>

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
                                isDisabled={menuItem === MENU.NFTMINE || notSupportedOnChain(MENU.NFTMINE, _chainMetaLocal.networkId)}
                                onClick={() => {
                                  if (splashScreenShown[MENU.NFT]) {
                                    navigate('datanfts/wallet');
                                    setMenuItem(MENU.NFTMINE);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.NFT);
                                    navigate('datanfts');
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
                                isDisabled={menuItem === MENU.NFTALL || notSupportedOnChain(MENU.NFTALL, _chainMetaLocal.networkId)}
                                onClick={() => {
                                  if (splashScreenShown[MENU.NFT]) {
                                    navigate('datanfts/marketplace');
                                    setMenuItem(MENU.NFTALL);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.NFT);
                                    navigate('datanfts');
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
                                isDisabled={menuItem === MENU.COALITIONALL}
                                onClick={() => {
                                  if (splashScreenShown[MENU.COALITION]) {
                                    navigate('datacoalitions/viewcoalitions');
                                    setMenuItem(MENU.COALITIONALL);
                                    setShowMobileMenu(false);
                                  } else {
                                    doSplashScreenShown(MENU.COALITION);
                                    navigate('datacoalitions');
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
                            Utils
                          </Button>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                            <ChainSupportedInput feature={MENU.TX}>
                              <Button
                                disabled={notSupportedOnChain(MENU.TX, _chainMetaLocal.networkId)}
                                colorScheme="teal"
                                onClick={() => {
                                  setMenuItem(MENU.TX);
                                  navigate('utils/chaintransactions');
                                  setShowMobileMenu(false);
                                }}
                              >
                                Chain Transactions
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
                            <Button
                              colorScheme="teal"
                              isDisabled={menuItem === MENU.VAULT}
                              onClick={() => {
                                setMenuItem(MENU.VAULT);
                                navigate('labs/datavault');
                                setShowMobileMenu(false);
                              }}
                            >
                              Data Vault
                            </Button>
                            <Button
                              colorScheme="teal"
                              isDisabled={menuItem === MENU.STREAM}
                              onClick={() => {
                                setMenuItem(MENU.STREAM);
                                navigate('labs/datastreams');
                                setShowMobileMenu(false);
                              }}
                            >
                              Data Streams
                            </Button>
                            <Button
                              colorScheme="teal"
                              isDisabled={menuItem === MENU.TRUSTEDCOMP}
                              onClick={() => {
                                setMenuItem(MENU.TRUSTEDCOMP);
                                navigate('labs/trustedcomputation');
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

              <Box w={[null, 'full']}>
                <Routes>
                  <Route path="/" element={<HomeEVM key={rfKeys.tools} onRfMount={() => handleRfMount('tools')} setMenuItem={setMenuItem} itheumAccount={itheumAccount} onRefreshTokenBalance={handleRefreshTokenBalance} onItheumAccount={setItheumAccount} />}/>
                  <Route path="home" element={<HomeEVM key={rfKeys.tools} onRfMount={() => handleRfMount('tools')} setMenuItem={setMenuItem} itheumAccount={itheumAccount} onRefreshTokenBalance={handleRefreshTokenBalance} onItheumAccount={setItheumAccount} />}/>
                  <Route path="selldata" element={<SellDataEVM key={rfKeys.sellData} onRfMount={() => handleRfMount('sellData')} itheumAccount={itheumAccount} />} />
                  <Route path="datapacks" element={<Outlet />}>
                    <Route path="buydata" element={<BuyData key={rfKeys.buyData} onRfMount={() => handleRfMount('buyData')} onRefreshTokenBalance={handleRefreshTokenBalance} />} />
                    <Route path="advertiseddata" element={<AdvertisedData />} />
                    <Route path="purchaseddata" element={<PurchasedData />} />
                    <Route path="personaldataproof" element={<PersonalDataProofs />} />
                  </Route>
                  <Route path="datanfts" element={<Outlet />}>
                    <Route path="" element={<DataNFTs setMenuItem={setMenuItem} />} />
                    <Route path="wallet" element={<MyDataNFTsEVM />} />
                    <Route path="marketplace" element={<DataNFTMarketplace />} />
                  </Route>
                  <Route path="datacoalitions" element={<Outlet />}>
                    <Route path="" element={<DataCoalitions setMenuItem={setMenuItem} />} />
                    <Route path="viewcoalitions" element={<DataCoalitionsViewAll />} />
                  </Route>
                  <Route paths="utils" element={<Outlet />}>
                    <Route path="chaintransactions" element={<ChainTransactions />} />
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
                  Sorry the <Badge mb="1" mr="1" ml="1" variant='outline' fontSize='0.8em' colorScheme="teal">{chain}</Badge> chain is currently not supported. We are working on it. You need to be on{' '}
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

        </Container>
      )}
    </>
  );
}

export default App;
