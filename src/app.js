import { useState } from 'react';
import { Button, Text } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack, HStack } from '@chakra-ui/layout';
import { useMoralis } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';
import PendingDataOrders from './PendingDataOrders';
import { MENU } from './util';

function App() {
  const { isAuthenticated, logout, user } = useMoralis();
  const [menuItem, setMenuItem] = useState(1);

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
                <Text fontSize="xs">{user.get('ethAddress')}</Text>
                <Button onClick={() => logout()}>Logout</Button>
              </HStack>
            </Box>
          </Flex>

          <Flex direction="column">
            <Box>
              <Stack direction="row" spacing={4} align="center">
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
      <Heading size="lg">Itheum Data Dex</Heading>
      <Auth />
    </Container>
  );
}

export default App;
