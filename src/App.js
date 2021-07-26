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
import { useMoralis } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';
import PurchasedData from './PurchasedData';
import AdvertisedData from './AdvertisedData';
import ShortAddress from './ShortAddress';
import Tools from './Tools';
import ChainTransactions from './ChainTransactions';
import DataVault from './DataVault';
import DataNFTs from './DataNFTs';
import MyDataNFTs from './DataNFT/MyDataNFTs';
import DataStreams from './DataStreams';
import DataCoalitions from './DataCoalitions';
import TrustedComputation from './TrustedComputation';
import { sleep, contractsForChain } from './util';
import { MENU, ABIS, CHAINS, SUPPORTED_CHAINS, CHAIN_TOKEN_SYMBOL } from './util';
import { chainMeta, ChainMetaContext } from './contexts';
import logo from './img/logo.png';
import logoSml from './img/logo-sml.png';
import chainEth from './img/eth-chain-logo.png';
import chainPol from './img/polygon-chain-logo.png';
import chainBsc from './img/bsc-chain-logo.png';
import chainAvln from './img/avalanche-chain-logo.png';
import moralisIcon from './img/moralis-logo.png';

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
    sellData: 0
  });
  const cancelRef = useRef();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    enableWeb3();
  }, []);

  useEffect(async () => {
    if (user && isWeb3Enabled) {
      const networkId = await web3.eth.net.getId();
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
              <Box mt={5} ml={5} minW="30vh">
                <Stack direction="column" spacing={4} align="left">
                  <Button colorScheme="teal" isDisabled={menuItem === MENU.HOME} variant="solid" onClick={() => (setMenuItem(MENU.HOME))}>Home</Button>
                  
                  <Button colorScheme="teal" isDisabled={menuItem === MENU.SELL} variant="solid" onClick={() => (setMenuItem(MENU.SELL))}>Sell Data</Button>

                  <Accordion defaultIndex={[-1]} allowMultiple>
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">Data Packs</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Stack direction="column" spacing={4} align="left" mt="2">
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.BUY} variant="solid" onClick={() => (setMenuItem(MENU.BUY))}>Buy Data</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.ADVERTISED} variant="solid" onClick={() => (setMenuItem(MENU.ADVERTISED))}>Advertised Data</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} variant="solid" onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">Data NFTs</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Stack direction="column" spacing={4} align="left" mt="2">
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.NFT || menuItem === MENU.NFTMINE} variant="solid" onClick={() => (setMenuItem(MENU.NFT))}>Data NFTs</Button>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">Utils</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Stack direction="column" spacing={4} align="left" mt="2">
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.TX} variant="solid" onClick={() => (setMenuItem(MENU.TX))}>Chain Transactions</Button>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">Labs</Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Stack direction="column" spacing={4} align="left" mt="2">
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.COALITION} variant="solid" onClick={() => (setMenuItem(MENU.COALITION))}>Data Coalitions</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.VAULT} variant="solid" onClick={() => (setMenuItem(MENU.VAULT))}>Data Vault</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.STREAM} variant="solid" onClick={() => (setMenuItem(MENU.STREAM))}>Data Streams</Button>
                          <Button colorScheme="teal" isDisabled={menuItem === MENU.TRUSTEDCOMP} variant="solid" onClick={() => (setMenuItem(MENU.TRUSTEDCOMP))}>Trusted Computation</Button>
                        </Stack>
                      </AccordionPanel>
                    </AccordionItem>
                    
                  </Accordion>

                </Stack>
              </Box>

              <Box minH="80vh" ml={10}>
                <Divider orientation="vertical" />
              </Box>

              <Box ml="10" mt={5} flex="auto">
                <ChainMetaContext.Provider value={chainMeta}>
                  {menuItem === MENU.HOME && <Tools key={rfKeys.tools} onRfMount={() => handleRfMount('tools')} setMenuItem={setMenuItem} itheumAccount={itheumAccount} onRefreshBalance={handleRefreshBalance} onItheumAccount={setItheumAccount} />}
                  {menuItem === MENU.BUY && <BuyData onRefreshBalance={handleRefreshBalance} />}
                  {menuItem === MENU.SELL && <SellData key={rfKeys.sellData} onRfMount={() => handleRfMount('sellData')} itheumAccount={itheumAccount} />}
                  {menuItem === MENU.ADVERTISED && <AdvertisedData />}
                  {menuItem === MENU.PURCHASED && <PurchasedData />}
                  {menuItem === MENU.TX && <ChainTransactions />}
                  {menuItem === MENU.VAULT && <DataVault />}
                  
                  {menuItem === MENU.NFT && <DataNFTs setMenuItem={setMenuItem} />}
                  {menuItem === MENU.NFTMINE && <MyDataNFTs />}
                  
                  {menuItem === MENU.STREAM && <DataStreams />}
                  {menuItem === MENU.COALITION && <DataCoalitions />}
                  {menuItem === MENU.TRUSTEDCOMP && <TrustedComputation />}
                </ChainMetaContext.Provider>
              </Box>
            </Flex>
          </Stack>

          <Flex direction="column" alignItems="flex-end" display="none"> 
            <Text fontSize="xs">Built with</Text>
            <Image
              boxSize="65px"
              height="auto"
              src={moralisIcon}
              alt="Built with Moralis web3"
            />
          </Flex>
          
        </Flex>

        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setAlertIsOpen(false)}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Alert</AlertDialogHeader>

              <AlertDialogBody>
                Sorry the {chain} chain is currently not supported. We are working on it. You need to be on { SUPPORTED_CHAINS.map(i => <Badge key={i} borderRadius="full" px="2" colorScheme="teal">{CHAINS[i]}</Badge>) }
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
              <Tooltip label="Live on Ropsten Test Network">
                <Image src={chainEth} boxSize="50px" width="40px" />
              </Tooltip>
              <Tooltip label="Live on Mumbai Test Network">
                <Image src={chainPol} boxSize="50px" />
              </Tooltip>
              <Tooltip label="Binance Smart Chain - Coming soon...">
                <Image src={chainBsc} boxSize="50px" opacity=".3" />
              </Tooltip>
              <Tooltip label="Avalanche - Coming soon...">
                <Image src={chainAvln} boxSize="50px" opacity=".3" />
              </Tooltip>
            </Flex>
            
            <Flex direction="column" alignItems="center" display="none"> 
              <Text mt="10" fontSize="xs">Built with</Text>
              <Image
                boxSize="65px"
                height="auto"
                src={moralisIcon}
                alt="Built with Moralis web3"
              />
            </Flex> 
          </Stack>
        </Box>
      </Center>      
    </Container>
  );
}

export default App;
