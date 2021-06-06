import { useEffect, useState } from 'react';
import { Button, Text, SlideFade, useDisclosure } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack, Center } from '@chakra-ui/layout';
import { useMoralis } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';
import PurchasedData from './PurchasedData';
import ShortAddress from './ShortAddress';
import Tools from './Tools';
import { MENU, ABIS, sleep } from './util';
import { mydaContractAddress } from './secrets.js'; 

function App() {
  const { isAuthenticated, logout, user } = useMoralis();
  const { web3 } = useMoralis();
  const [menuItem, setMenuItem] = useState(1);
  const [myMydaBal, setMydaBal] = useState(0);
  const { isOpen, onToggle } = useDisclosure();

  useEffect(async () => {
    if (user && web3) {
      await showMydaBalance();
      await sleep(1);
      onToggle();
    }
  }, [user, web3]);

  const handleRefreshBalance = async () => {
    await showMydaBalance();
  };

  const showMydaBalance = async () => {
    const walletAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(ABIS.token, mydaContractAddress);
    
    const decimals = await contract.methods.decimals().call();
    console.log('🚀 ~ useEffect ~ decimals', decimals);
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

  if (isAuthenticated) {
    return (
      <Container maxW="container.xl">
        <Stack spacing={5}>
          <Box></Box>
          <Flex>
            <Box p="2">
              <Heading size="lg">Itheum Data Dex</Heading>
            </Box>
            <Spacer />
            <Box>
              <HStack>
                <SlideFade in={isOpen} reverse={!isOpen} offsetY="20px">
                  <Box
                    as="text"
                    p={4}
                    color="white"
                    fontWeight="bold"
                    borderRadius="md"
                    bgGradient="linear(to-l, #7928CA, #FF0080)">MYDA {myMydaBal}
                  </Box>
                </SlideFade>
                <Text fontSize="xs"><ShortAddress address={user.get('ethAddress')} /></Text>
                <Button onClick={() => logout()}>Logout</Button>
              </HStack>
            </Box>
          </Flex>

          <Flex direction="column">
            <Box>
              <Stack direction="row" spacing={4} align="center">
                <Button colorScheme="teal" isDisabled={menuItem === MENU.HOME} variant="solid" onClick={() => (setMenuItem(MENU.HOME))}>Home</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.BUY} variant="solid" onClick={() => (setMenuItem(MENU.BUY))}>Buy Data</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.SELL} variant="solid" onClick={() => (setMenuItem(MENU.SELL))}>Sell Data</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} variant="solid" onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.TOOLS} variant="solid" onClick={() => (setMenuItem(MENU.TOOLS))}>Tools</Button>
              </Stack>
            </Box>
            <Box>
              {menuItem === MENU.BUY && <BuyData onRefreshBalance={handleRefreshBalance} />}
              {menuItem === MENU.SELL && <SellData />}
              {menuItem === MENU.PURCHASED && <PurchasedData />}
              {menuItem === MENU.TOOLS && <Tools onRefreshBalance={handleRefreshBalance} />}
            </Box>
          </Flex>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Center h="500px">
        <Stack>
          <Box></Box>
          <Heading size="lg">Itheum Data Dex</Heading>
          <Auth />
        </Stack>
      </Center>
    </Container>
  );
}

export default App;
