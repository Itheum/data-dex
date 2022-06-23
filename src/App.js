import { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import { Button, Text, Image, Divider, Tooltip, AlertDialog, Badge,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay, useColorMode, Link,
  Menu, MenuButton, MenuList, MenuItem, IconButton, MenuGroup, MenuDivider } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack, VStack } from '@chakra-ui/layout';
import { SunIcon, MoonIcon, ExternalLinkIcon, HamburgerIcon } from '@chakra-ui/icons';
import { GiReceiveMoney } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';
import PurchasedData from './PurchasedData';
import AdvertisedData from './AdvertisedData';
import PersonalDataProofs from './PersonalDataProofs';
import ShortAddress from './UtilComps/ShortAddress';
import Tools from './Tools';
import ChainTransactions from './ChainTransactions';
import DataVault from './DataVault';
import DataNFTs from './DataNFTs';
import MyDataNFTs from './DataNFT/MyDataNFTs';
import DataNFTMarketplace from './DataNFT/DataNFTMarketplace';
import DataStreams from './DataStreams';
import DataCoalitions from './DataCoalitions';
import DataCoalitionsViewAll from './DataCoalition/DataCoalitionsViewAll';
import TrustedComputation from './TrustedComputation';
import { itheumTokenRoundUtil, sleep, contractsForChain, noChainSupport, qsParams, consoleNotice, config } from './libs/util';
import { MENU, ABIS, CHAINS, SUPPORTED_CHAINS, CHAIN_TOKEN_SYMBOL, CHAIN_NAMES, CLAIM_TYPES } from './libs/util';
import logo from './img/logo.png';
import logoSmlD from './img/logo-sml-d.png';
import logoSmlL from './img/logo-sml-l.png';
import chainEth from './img/eth-chain-logo.png';
import chainPol from './img/polygon-chain-logo.png';
import chainBsc from './img/bsc-chain-logo.png';
import chainAvln from './img/avalanche-chain-logo.png';
import chainHrmy from './img/harmony-chain-logo.png';
import chainPlaton from './img/platon-chain-logo.png';
import chainParastate from './img/parastate-chain-logo.png';
import chainElrond from './img/elrond-chain-logo.png';
import chainHedera from './img/hedera-chain-logo.png';
import moralisIcon from './img/powered-moralis.png';
import { useUser } from './store/UserContext';
import { useChainMeta } from './store/ChainMetaContext';
import AlertOverlay from './UtilComps/AlertOverlay';
import ChainSupportedInput from './UtilComps/ChainSupportedInput';

const _chainMetaLocal = {};

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : 'version number unknown';

function App() {
  const {isAuthenticated, logout, user, Moralis: {web3Library: ethers}} = useMoralis();
  const { web3: web3Provider, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();
  const [menuItem, setMenuItem] = useState(0);
  const [tokenBal, setTokenBal] = useState(0);
  const [chain, setChain] = useState(0);
  const [itheumAccount, setItheumAccount] = useState(null);
  const [isAlertOpen, setAlertIsOpen] = useState(false);
  const [rfKeys, setRfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0,
    auth: 0
  });
  const [splashScreenShown, setSplashScreenShown] = useState({});
  const cancelRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode(); 
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [getClaimesError, setGetClaimsError] = useState(null);
  
  // context hooks
  const { user: _user, setUser } = useUser();
  const { setChainMeta } = useChainMeta();

  useEffect(() => {
    setUser({
      isAuthenticated,
      claimBalanceValues: ['-1', '-1', '-1'],
      claimBalanceDates: [0, 0, 0],
    });

    console.log(consoleNotice);
  },[]);

  useEffect(() => {
    // this ensure that if the user reloads the page when logged in, we restore their web3Session to ethers.js
    if (user && isAuthenticated) {
      enableWeb3(); // default to metamask
    }
  }, [user, isAuthenticated]);

  useEffect(async () => {
    if (user && isWeb3Enabled) {
      const networkId = web3Provider.network.chainId; 

      setChain(CHAINS[networkId] || 'Unknown chain');

      if (!SUPPORTED_CHAINS.includes(networkId)) {
        setAlertIsOpen(true);
      } else {
        _chainMetaLocal.networkId = networkId;
        _chainMetaLocal.contracts = contractsForChain(networkId);
        
        setChainMeta({
          networkId,
          contracts: contractsForChain(networkId)
        });
        
        await web3_getTokenBalance();
        await sleep(1);

        await web_getClaimBalance();
        await sleep(1);
      }      
    }
  }, [user, isWeb3Enabled]);

  const handleRefreshBalance = async () => {
    await web3_getTokenBalance();
    await web_getClaimBalance();
  };

  const web_getClaimBalance = async () => {
    const walletAddress = user.get('ethAddress');
    const contract = new ethers.Contract(_chainMetaLocal.contracts.claims, ABIS.claims, web3Provider);

    const keys = Object.keys(CLAIM_TYPES);
    
    const values = keys.map((el) => {
      return CLAIM_TYPES[el]
    });
    
    // queue all smart contract calls
    const hexDataPromiseArray =  values.map(async (el) => {
      let a = await contract.deposits(walletAddress, el);
      return a;
    });

    try {
      const claimBalanceResponse = (await Promise.all(hexDataPromiseArray)).map((el) => {
        const date = new Date((parseInt((el.lastDeposited._hex.toString()),16))*1000);
        const value = (parseInt(el.amount._hex.toString(),16))/(10**18);
        return { values: value , dates: date}
      });

      const valuesArray = claimBalanceResponse.map((el) => {
        return el['values'];
      });
  
      const datesArray = claimBalanceResponse.map((el) => {
        return el['dates'];
      });
  
      await setUser({
        ..._user,
        claimBalanceValues: valuesArray,
        claimBalanceDates: datesArray
      });
    } catch(e) {
      console.error(e);
      setGetClaimsError({
        errContextMsg: 'Could not get your claims information from the blockchain',
        rawError: e
      });
    }
  };

  useEffect(() => {
    if (_user && _user.isAuthenticated) {
      web3_getTokenBalance();
    }
  },[_user.claimBalanceValues]);

  const web3_getTokenBalance = async () => {
    const walletAddress = user.get('ethAddress');
    
    /*
    // Example of running a contract via moralis's runContractFunction (for reference)
    // you will need const Web3Api = useMoralisWeb3Api();

    let options = {
      chain: CHAIN_NAMES[chainMeta.networkId],
      address: chainMeta.contracts.itheumToken,
      function_name: "decimals",
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
  }

  // utility that will reload a component and reset it's state
  const handleRfMount = key => {
    const reRf = {...rfKeys, [key]: Date.now()}
    setRfKeys(reRf);
  }

  const doSplashScreenShown = menuItem => {
    setSplashScreenShown({...splashScreenShown, [menuItem]: true})
  }

  const menuButtonW = '180px';

  if (isAuthenticated) {
    return (
      <Container maxW="container.xxl" h="100vh" d="flex" justifyContent="center" alignItems="center">
        <Flex h="100vh" w="100vw" direction={{'base': 'column', md:"column"}}>
          <HStack h="10vh" p="5">
            
            <Image boxSize="50px"
              height="auto"
              src={colorMode === "light" ? logoSmlL : logoSmlD}
              alt="Itheum Data DEX" />
            
            <Heading>
              <Text fontSize={["xs", "sm"]}>Itheum Data DEX</Text>
              <Text fontSize="xx-small">{dataDexVersion}</Text>
            </Heading>
            
            <Spacer />

            <HStack>
              <Box
                as="text"
                fontSize={["xs", "sm"]}
                minWidth={"5.5rem"}
                align="center"
                p={2}
                color="white"
                fontWeight="bold"
                borderRadius="md"
                bgGradient="linear(to-l, #7928CA, #FF0080)">{CHAIN_TOKEN_SYMBOL(_chainMetaLocal.networkId)} {tokenBal}
              </Box>

              <Box
                display={['none', null, 'block']}
                fontSize={["xs", "sm"]}
                align="center"
                p={2}
                color="rgb(243, 183, 30)"
                fontWeight="bold"
                bg="rgba(243, 132, 30, 0.05)"
                borderRadius="md">{chain || '...'}
              </Box>

              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>

            </HStack>

            <Menu>
              <MenuButton
                as={IconButton}
                aria-label='Options'
                icon={<HamburgerIcon />}
                variant='outline'
              />
              <MenuList>
                <MenuGroup>
                  <MenuItem closeOnSelect={false}>
                    <Text fontSize="xs">
                      {itheumAccount && <Text>{`${itheumAccount.firstName} ${itheumAccount.lastName}`}</Text>}
                      <ShortAddress address={user.get('ethAddress')} />
                    </Text>
                  </MenuItem>
                  <MenuItem onClick={() => logout()} fontSize="sm">
                    Logout
                  </MenuItem>
                </MenuGroup>

                <MenuDivider display={['block', null, 'none']} />

                <MenuGroup>
                  <MenuItem closeOnSelect={false} display={['block', null, 'none']}>
                    <Box
                      fontSize={["xs", "sm"]}
                      align="center"
                      p={2}
                      color="rgb(243, 183, 30)"
                      fontWeight="bold"
                      bg="rgba(243, 132, 30, 0.05)"
                      borderRadius="md">{chain || '...'}
                    </Box>
                  </MenuItem>
                  
                </MenuGroup>
              </MenuList>
            </Menu>
          </HStack>

          <HStack alignItems={["center",,"flex-start"]} flexDirection={["column",,"row"]} backgroundColor={"blue1"} pt={5}>
            
            <Box backgroundColor={"green1"}>
              <Button display={["block", null, "none"]} 
                colorScheme="teal" 
                variant="solid"
                m="auto"
                mb={5}
                onClick={() => setShowMobileMenu(!showMobileMenu)}>Main menu</Button>
              
              <Stack direction="column" spacing={4} display={[showMobileMenu && "block" || "none", , "block"]}>
                <HStack pl="3">                    
                    <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>Terms of Use <ExternalLinkIcon mx="2px" /></Link>
                    <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>Privacy Policy <ExternalLinkIcon mx="2px" /></Link>
                </HStack>

                <Flex direction="column" justify="space-between" minH="80vh">

                  <Stack ml="15px" spacing={4}>
                    <Button rightIcon={<AiFillHome />} w={menuButtonW} colorScheme="teal" isDisabled={menuItem === MENU.HOME} variant="solid" onClick={() => (setMenuItem(MENU.HOME))}>Home</Button>
                    <Button rightIcon={<GiReceiveMoney />} w={menuButtonW} colorScheme="teal" isDisabled={menuItem === MENU.SELL} variant="solid" onClick={() => (setMenuItem(MENU.SELL))}>Trade Data</Button>
                  </Stack>

                  <Accordion flexGrow="1" defaultIndex={[-1]} allowToggle={true} w="230px" style={{border: 'solid 1px transparent'}}>
                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Data Packs</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                          <ChainSupportedInput feature={MENU.BUY}><Button colorScheme="teal" isDisabled={menuItem === MENU.BUY} onClick={() => (setMenuItem(MENU.BUY))}>Buy Data</Button></ChainSupportedInput>
                          <ChainSupportedInput feature={MENU.ADVERTISED}><Button colorScheme="teal" isDisabled={menuItem === MENU.ADVERTISED} onClick={() => (setMenuItem(MENU.ADVERTISED))}>Advertised Data</Button></ChainSupportedInput>
                          <ChainSupportedInput feature={MENU.PURCHASED}><Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button></ChainSupportedInput>
                          <ChainSupportedInput feature={MENU.DATAPROOFS}><Button colorScheme="teal" isDisabled={menuItem === MENU.DATAPROOFS} onClick={() => (setMenuItem(MENU.DATAPROOFS))}>Personal Data Proofs</Button></ChainSupportedInput>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Data NFTs</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                          <ChainSupportedInput feature={MENU.NFTMINE}>
                            <Button colorScheme="teal" isDisabled={menuItem === MENU.NFTMINE || noChainSupport(MENU.NFTMINE, _chainMetaLocal.networkId)} onClick={() => {
                              if (splashScreenShown[MENU.NFT]) {
                                setMenuItem(MENU.NFTMINE);
                              } else {
                                doSplashScreenShown(MENU.NFT);
                                setMenuItem(MENU.NFT);
                              }
                            }}>Wallet</Button>
                          </ChainSupportedInput>
                          
                          <ChainSupportedInput feature={MENU.NFTALL}>
                            <Button colorScheme="teal" isDisabled={menuItem === MENU.NFTALL || noChainSupport(MENU.NFTALL, _chainMetaLocal.networkId)} onClick={() => {
                              if (splashScreenShown[MENU.NFT]) {
                                setMenuItem(MENU.NFTALL);
                              } else {
                                doSplashScreenShown(MENU.NFT);
                                setMenuItem(MENU.NFT);
                              }
                            }}>Marketplace</Button>
                          </ChainSupportedInput>
                          
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Data Coalitions</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                        <ChainSupportedInput feature={MENU.COALITION}>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.COALITIONALL} onClick={() => {
                            if(splashScreenShown[MENU.COALITION]) {
                              setMenuItem(MENU.COALITIONALL);
                            } else {
                              doSplashScreenShown(MENU.COALITION);
                              setMenuItem(MENU.COALITION);
                            }
                          }}>View Coalitions</Button>
                          </ChainSupportedInput>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Utils</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                          <ChainSupportedInput feature={MENU.TX}>
                            <Button disabled={noChainSupport(MENU.TX, _chainMetaLocal.networkId)} colorScheme="teal" isDisabled={menuItem === MENU.TX} onClick={() => (setMenuItem(MENU.TX))}>Chain Transactions</Button>
                          </ChainSupportedInput>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Labs</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.VAULT} onClick={() => (setMenuItem(MENU.VAULT))}>Data Vault</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.STREAM} onClick={() => (setMenuItem(MENU.STREAM))}>Data Streams</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.TRUSTEDCOMP} onClick={() => (setMenuItem(MENU.TRUSTEDCOMP))}>Trusted Computation</Button>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>
                    
                  </Accordion>

                  <ByMoralisLogo />
              
                </Flex>
              </Stack>
            </Box>

            <Box backgroundColor={"red1"} pl={5} w="full">
              {menuItem === MENU.HOME && <Tools key={rfKeys.tools} onRfMount={() => handleRfMount('tools')} setMenuItem={setMenuItem} itheumAccount={itheumAccount} onRefreshBalance={handleRefreshBalance} onItheumAccount={setItheumAccount} />}
              {menuItem === MENU.BUY && <BuyData key={rfKeys.buyData} onRfMount={() => handleRfMount('buyData')} onRefreshBalance={handleRefreshBalance} />}
              {menuItem === MENU.SELL && <SellData key={rfKeys.sellData} onRfMount={() => handleRfMount('sellData')} itheumAccount={itheumAccount} />}
              {menuItem === MENU.ADVERTISED && <AdvertisedData />}
              {menuItem === MENU.PURCHASED && <PurchasedData />}
              {menuItem === MENU.DATAPROOFS && <PersonalDataProofs />}
              {menuItem === MENU.TX && <ChainTransactions />}
              {menuItem === MENU.VAULT && <DataVault />}
              
              {menuItem === MENU.NFT && <DataNFTs setMenuItem={setMenuItem} />}
              {menuItem === MENU.NFTMINE && <MyDataNFTs />}
              {menuItem === MENU.NFTALL && <DataNFTMarketplace />}
              
              {menuItem === MENU.COALITION && <DataCoalitions setMenuItem={setMenuItem} />}
              {menuItem === MENU.COALITIONALL && <DataCoalitionsViewAll />}

              {menuItem === MENU.STREAM && <DataStreams />}
              {menuItem === MENU.TRUSTEDCOMP && <TrustedComputation />}
            </Box>
          </HStack>
         
        </Flex>

        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setAlertIsOpen(false)}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Alert</AlertDialogHeader>

              <AlertDialogBody>
                Sorry the {chain} chain is currently not supported. We are working on it. You need to be on { SUPPORTED_CHAINS.map(i => <Badge key={i} borderRadius="full" px="2" colorScheme="teal" mr="2">{CHAINS[i]}</Badge>) }
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setAlertIsOpen(false)}>
                  Cancel
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {getClaimesError && <AlertOverlay errorData={getClaimesError} onClose={() => console.log}/>}
        
      </Container>
    );
  }

  return (
    <Container maxW="container.xxl" h="100vh" d="flex" justifyContent="center" alignItems="center">
      <Flex justify="center" direction="column">
        <Box p={["20px", null, "30px"]} borderWidth="2px" borderRadius="lg">
          <Stack>
            <Image
              w={["70px", null, "90px"]}
              h={["60px", null, "80px"]}
              src={logo}
              alt="Itheum Data DEX"
              margin="auto"
            />
            <Heading size="md" textAlign="center">Itheum Data DEX</Heading>            
            <Text fontSize="sm" textAlign="center">Trade your personal data via secure on-chain exchange</Text>
            <Spacer />
            <Auth key={rfKeys.auth} />

            <Text textAlign="center" fontSize="sm">Supported Chains</Text>
            
            <Flex wrap={["wrap", "nowrap"]} direction="row" justify={["start", "space-around"]} w={["300px", "500px"]}>
              <Tooltip label="Elrond - Coming soon...">
                <Image src={chainElrond} boxSize="40px" opacity=".3" borderRadius="lg" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Ropsten & Rinkeby Testnets">
                <Image src={chainEth} boxSize="40px" width="30px" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Binance Smart Chain Testnet">
                <Image src={chainBsc} boxSize="40px" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Avalanche C-Chain Testnet">
                <Image src={chainAvln} boxSize="40px" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Mumbai Testnet">
                <Image src={chainPol} boxSize="40px" borderRadius="lg" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Parastate Testnet">
                <Image src={chainParastate} boxSize="40px" width="30px" m="5px" />
              </Tooltip>
              <Tooltip label="Live on PlatON Testnet">
                <Image src={chainPlaton} boxSize="40px" m="5px" />
              </Tooltip>
              <Tooltip label="Live on Harmony Testnet">
                <Image src={chainHrmy} boxSize="40px" m="5px" />
              </Tooltip>
              <Tooltip label="Hedera - Coming soon...">
                <Image src={chainHedera} boxSize="40px" opacity=".3" m="5px" />
              </Tooltip>              
            </Flex>

            <Text textAlign="center" fontSize="xx-small">{dataDexVersion}</Text>
            
            <ByMoralisLogo />
          </Stack>
        </Box>
      </Flex>      
    </Container>
  );
}

function ByMoralisLogo() {
  return (
    <Flex direction="column" alignItems="center" display="none">
      <Image
        mt="10"
        borderRadius="lg"
        boxSize="180px"
        height="auto"
        src={moralisIcon}
        alt="Built with Moralis web3"
      />
    </Flex>
  );
}

export default App;
