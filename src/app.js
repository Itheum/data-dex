import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { Container, Heading, Flex, Spacer, Box, Stack } from '@chakra-ui/layout';
import { useMoralis } from 'react-moralis';
import { Auth } from './Auth';
import SellData from './SellData';
import BuyData from './BuyData';

const MENU = {
  BUY: 1,
  SELL: 2,
  PURCHASED: 3
};

function App() {
  const { isAuthenticated, logout } = useMoralis();
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
              <Button onClick={() => logout()}>Logout</Button>
            </Box>
          </Flex>

          <Flex direction="column">
            <Box>
              <Stack direction="row" spacing={4} align="center">
                <Button colorScheme="teal" isDisabled={menuItem === MENU.BUY} variant="solid" onClick={() => (setMenuItem(MENU.BUY))}>Buy Data</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.SELL} variant="solid" onClick={() => (setMenuItem(MENU.SELL))}>Sell Data</Button>
                <Button colorScheme="teal" isDisabled={menuItem === MENU.PURCHASED} variant="solid" onClick={() => (setMenuItem(MENU.PURCHASED))}>Purchased Data</Button>
              </Stack>
            </Box>
            <Box>
              {menuItem === MENU.BUY && <BuyData />}
              {menuItem === MENU.SELL && <SellData />}
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
