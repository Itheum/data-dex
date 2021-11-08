import { useEffect, useState, useRef } from 'react';
import { Button, Text, Image, Divider, Tooltip, AlertDialog, Badge,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay, useColorMode } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack, Center } from '@chakra-ui/layout';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { GiReceiveMoney } from "react-icons/gi";
import { AiFillHome } from "react-icons/ai";
import { useMoralis } from 'react-moralis';
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
import { sleep, contractsForChain, noChainSupport, qsParams, consoleNotice } from './libs/util';
import { MENU, ABIS, CHAINS, SUPPORTED_CHAINS, CHAIN_TOKEN_SYMBOL } from './libs/util';
import { chainMeta, ChainMetaContext } from './libs/contexts';
import logo from './img/logo.png';
import logoSml from './img/logo-sml.png';
import chainEth from './img/eth-chain-logo.png';
import chainPol from './img/polygon-chain-logo.png';
import chainBsc from './img/bsc-chain-logo.png';
import chainAvln from './img/avalanche-chain-logo.png';
import chainHrmy from './img/harmony-chain-logo.png';
import chainPlaton from './img/platon-chain-logo.png';
import moralisIcon from './img/powered-moralis.png';

function App() {
  const {isAuthenticated, logout, user} = useMoralis();
  const { web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();
  const [menuItem, setMenuItem] = useState(0);
  const [myMydaBal, setMydaBal] = useState(0);
  const [chain, setChain] = useState(0);
  const [itheumAccount, setItheumAccount] = useState(null);
  const [isAlertOpen, setAlertIsOpen] = useState(false);
  const [rfKeys, setRfKeys] = useState({
    tools: 0,
    sellData: 0,
    buyData: 0
  });
  const [splashScreenShown, setSplashScreenShown] = useState({});
  const cancelRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    enableWeb3();

    console.log(consoleNotice);
  }, []);

  useEffect(async () => {
    if (user && isWeb3Enabled) {
      let networkId = await web3.eth.net.getId();

      // S: some boundary conditions for network
      const qsFlags = qsParams();

      // platON testnet reports network ID as 1 on web3/metamask - https://github.com/Itheum/data-dex/issues/51
      if (qsFlags.platon) {
        networkId = parseInt(Object.keys(CHAINS).find(i => CHAINS[i] === 'PlatON - Testnet'), 10);
      }
      // E: some boundary conditions...

      setChain(CHAINS[networkId] || 'Unknown chain');

      if (!SUPPORTED_CHAINS.includes(networkId)) {
        setAlertIsOpen(true);
      } else {
        chainMeta.networkId = networkId;
        chainMeta.contracts = contractsForChain(networkId);
        
        await showMydaBalance();
        await sleep(1);
      }      
    }
  }, [user, isWeb3Enabled]);

  const handleRefreshBalance = async () => {
    await showMydaBalance();
  };

  const showMydaBalance = async () => {
    const walletAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(ABIS.token, chainMeta.contracts.myda);
    
    const decimals = await contract.methods.decimals().call();
    const balance = await contract.methods.balanceOf(walletAddress).call();

    const BN = web3.utils.BN;
    const balanceWeiString = balance.toString();
    const balanceWeiBN = new BN(balanceWeiString);

    const decimalsBN = new BN(decimals);
    const divisor = new BN(10).pow(decimalsBN);

    const beforeDecimal = balanceWeiBN.div(divisor)
    // console.log(beforeDecimal.toString())    // >> 31
    
    // const afterDecimal  = balanceWeiBN.mod(divisor)
    // console.log(afterDecimal.toString())     // >> 415926500000000000
    
    setMydaBal(beforeDecimal.toString());
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
      <Container maxW="container.xxl">
        <Flex direction="column" justify="space-between">
          <Stack spacing={5} mt={5}>
            <Flex>
              <Image
                boxSize="42px"
                height="auto"
                src={logoSml}
                alt="Itheum Data DEX"
              />
              <Box p="2">
                <Heading size="sm">Itheum Data DEX</Heading>
              </Box>
              <Spacer />
              <Box>
                <HStack>                    
                  <Box
                    as="text"
                    p={2}
                    color="white"
                    fontWeight="bold"
                    borderRadius="md"
                    bgGradient="linear(to-l, #7928CA, #FF0080)">{CHAIN_TOKEN_SYMBOL(chainMeta.networkId)} {myMydaBal}
                  </Box>

                  <Box
                    p={2}
                    color="rgb(243, 183, 30)"
                    fontWeight="bold"
                    bg="rgba(243, 132, 30, 0.05)"
                    borderRadius="md">{chain || '...'}
                  </Box>

                  <Text fontSize="xs" align="right">
                    {itheumAccount && <Text>{`${itheumAccount.firstName} ${itheumAccount.lastName}`}</Text>}
                    <ShortAddress address={user.get('ethAddress')} />
                  </Text>
                  
                  <Button onClick={toggleColorMode}>
                    {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                  </Button>

                  <Button onClick={() => logout()} ml="10">Logout</Button>
                </HStack>
              </Box>
            </Flex>            

            <Box></Box>

            <Flex direction="row">
              <Box mt={5} ml={5}>
                <Stack direction="column" spacing={4}>
                  <Flex direction="column" justify="space-between" minH="80vh">

                  <Stack ml="15px" spacing={4}>
                    <Button rightIcon={<AiFillHome />} w={menuButtonW} colorScheme="teal" isDisabled={menuItem === MENU.HOME} variant="solid" onClick={() => (setMenuItem(MENU.HOME))}>Home</Button>
                    <Button rightIcon={<GiReceiveMoney />} w={menuButtonW} colorScheme="teal" isDisabled={menuItem === MENU.SELL} variant="solid" onClick={() => (setMenuItem(MENU.SELL))}>Sell Data</Button>
                  </Stack>

                  <Accordion flexGrow="1" defaultIndex={[-1]} allowToggle={true} w="230px" style={{border: 'solid 1px transparent'}}>
                    <AccordionItem>
                      <AccordionButton>
                        <Button flex="1" colorScheme="teal" variant="outline">Data Packs</Button>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <Stack direction="column" spacing={4} align="left" mt="2" w={menuButtonW}>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.BUY} onClick={() => (setMenuItem(MENU.BUY))}>Buy Data</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.ADVERTISED} onClick={() => (setMenuItem(MENU.ADVERTISED))}>Advertised Data</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.DATAPROOFS} onClick={() => (setMenuItem(MENU.DATAPROOFS))}>Personal Data Proofs</Button>
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
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.NFTMINE || noChainSupport(MENU.NFTMINE, chainMeta.networkId)} onClick={() => {
                            if (splashScreenShown[MENU.NFT]) {
                              setMenuItem(MENU.NFTMINE);
                            } else {
                              doSplashScreenShown(MENU.NFT);
                              setMenuItem(MENU.NFT);
                            }
                          }}>Wallet</Button>
                          
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.NFTALL || noChainSupport(MENU.NFTALL, chainMeta.networkId)} onClick={() => {
                            if (splashScreenShown[MENU.NFT]) {
                              setMenuItem(MENU.NFTALL);
                            } else {
                              doSplashScreenShown(MENU.NFT);
                              setMenuItem(MENU.NFT);
                            }
                          }}>Marketplace</Button>
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
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.COALITIONALL} onClick={() => {
                            if(splashScreenShown[MENU.COALITION]) {
                              setMenuItem(MENU.COALITIONALL);
                            } else {
                              doSplashScreenShown(MENU.COALITION);
                              setMenuItem(MENU.COALITION);
                            }
                          }}>View Coalitions</Button>
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
                          <Button disabled={noChainSupport(MENU.TX, chainMeta.networkId)} colorScheme="teal" isDisabled={menuItem === MENU.TX} onClick={() => (setMenuItem(MENU.TX))}>Chain Transactions</Button>
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

              <Box minH="80vh" ml={5}>
                <Divider orientation="vertical" />
              </Box>

              <Box ml="10" mt={5} flex="auto">
                <ChainMetaContext.Provider value={chainMeta}>
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
                </ChainMetaContext.Provider>
              </Box>
            </Flex>
          </Stack>          
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
      </Container>
    );
  }

  return (
    <Container>
      <Center mt="100">
        <Box p="10" borderWidth="2px" borderRadius="lg" overflow="hidden">
          <Stack >
            <Image
              boxSize="150px"
              height="auto"
              src={logo}
              alt="Itheum Data DEX"
              margin="auto"
            />
            <Heading size="lg" textAlign="center">Itheum Data DEX</Heading>
            <Text>Sell your personal data via secure on-chain exchange</Text>
            <Spacer />
            <Auth />
            <Text textAlign="center" fontSize="sm"  mb="50">Supported Chains</Text>
            <Flex direction="row" justify="space-around">
              <Tooltip label="Live on Mumbai Testnet">
                <Image src={chainPol} boxSize="40px" />
              </Tooltip>
              <Tooltip label="Live on Ropsten & Rinkeby Testnets">
                <Image src={chainEth} boxSize="40px" width="30px" />
              </Tooltip>
              <Tooltip label="Live on Binance Smart Chain Testnet">
                <Image src={chainBsc} boxSize="40px" />
              </Tooltip>
              <Tooltip label="Live on Harmony Testnet">
                <Image src={chainHrmy} boxSize="40px" />
              </Tooltip>
              <Tooltip label="Live on PlatON Testnet">
                <Image src={chainPlaton} boxSize="40px" />
              </Tooltip>
              <Tooltip label="Avalanche - Coming soon...">
                <Image src={chainAvln} boxSize="40px" opacity=".3" />
              </Tooltip>
            </Flex>
            
            <ByMoralisLogo />
          </Stack>
        </Box>
      </Center>      
    </Container>
  );
}

function ByMoralisLogo() {
  return (
    <Flex direction="column" alignItems="center">
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
