import { useEffect, useState } from 'react';
import { Button, Text } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack, Center } from '@chakra-ui/layout';
import { useMoralis } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';
import PendingDataOrders from './PendingDataOrders';
import ShortAddress from './ShortAddress';
import { MENU } from './util';
import { mydaContractAddress } from './secrets.js'; 

function App() {
  const { isAuthenticated, logout, user } = useMoralis();
  const { web3 } = useMoralis();
  const [menuItem, setMenuItem] = useState(2);
  const [myMydaBal, setMydaBal] = useState(0);

  useEffect(async () => {
    if (user && web3) {
      const minABI = [
        // balanceOf
        {
          "constant":true,
          "inputs":[{"name":"_owner","type":"address"}],
          "name":"balanceOf",
          "outputs":[{"name":"balance","type":"uint256"}],
          "type":"function"
        },
        // decimals
        {
          "constant":true,
          "inputs":[],
          "name":"decimals",
          "outputs":[{"name":"","type":"uint8"}],
          "type":"function"
        }
      ];

      const tokenAddress = mydaContractAddress;
      const walletAddress = user.get('ethAddress');
      const contract = new web3.eth.Contract(minABI, tokenAddress);
      
      const decimals = await contract.methods.decimals().call();
      const balance = await contract.methods.balanceOf(walletAddress).call();

      const BN = web3.utils.BN;
      const balanceWeiString = balance.toString();
      const balanceWeiBN = new BN(balanceWeiString);

      const decimalsBN = new BN(decimals);
      const divisor = new BN(10).pow(decimalsBN);

      const beforeDecimal = balanceWeiBN.div(divisor)
      console.log(beforeDecimal.toString())    // >> 31
      
      // const afterDecimal  = balanceWeiBN.mod(divisor)
      // console.log(afterDecimal.toString())     // >> 415926500000000000
      
      setMydaBal(beforeDecimal.toString());
    }
  }, [user, web3]);

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
                <Box
                  as="text"
                  p={4}
                  color="white"
                  fontWeight="bold"
                  borderRadius="md"
                  bgGradient="linear(to-l, #7928CA, #FF0080)">MYDA {myMydaBal}
                </Box>
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
                <Button colorScheme="teal" isDisabled={menuItem === MENU.PENDING} variant="solid" onClick={() => (setMenuItem(MENU.PENDING))}>Pending Data Orders</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} variant="solid" onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button>
              </Stack>
            </Box>
            <Box>
              {menuItem === MENU.BUY && <BuyData />}
              {menuItem === MENU.SELL && <SellData />}
              {menuItem === MENU.PENDING && <PendingDataOrders />}
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
