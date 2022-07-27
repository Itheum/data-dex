import { useState } from "react";
import { Button, Text, Image, Tooltip, 
  Popover, PopoverTrigger, PopoverContent, PopoverBody, RadioGroup, Radio, } from "@chakra-ui/react";
import { Container, Heading, Flex, Spacer, Box, Stack, HStack } from "@chakra-ui/layout";

import logo from "./img/logo.png";
import chainEth from "./img/eth-chain-logo.png";
import chainPol from "./img/polygon-chain-logo.png";
import chainBsc from "./img/bsc-chain-logo.png";
import chainAvln from "./img/avalanche-chain-logo.png";
import chainHrmy from "./img/harmony-chain-logo.png";
import chainPlaton from "./img/platon-chain-logo.png";
import chainParastate from "./img/parastate-chain-logo.png";
import chainElrond from "./img/elrond-chain-logo.png";
import chainHedera from "./img/hedera-chain-logo.png";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : 'version number unknown';

const AuthLauncher = ({ onLaunchMode }) => {
  return (
    <Container maxW="container.xxl" h="100vh" d="flex" justifyContent="center" alignItems="center">
      <Flex justify="center" direction="column">
        <Box p={["20px", null, "30px"]} borderWidth="2px" borderRadius="lg">
          <Stack>
            <Image w={["70px", null, "90px"]} h={["60px", null, "80px"]} src={logo} alt="Itheum Data DEX" margin="auto" />
            <Heading size="md" textAlign="center">
              Itheum Data DEX
            </Heading>
            <Text fontSize="sm" textAlign="center">
              Trade your personal data via secure on-chain exchange
            </Text>
            <Spacer />

            <HStack justifyContent="center" p="3" spacing={6}>
              <PopupChainSelectorForWallet
                lrgButtonSize={true}
                hideTerms={true}
                onElrondEnvPick={onLaunchMode} />

              <Button onClick={() => onLaunchMode('evm')}>
                Connect my EVM Wallet
              </Button>
            </HStack>

            <Text textAlign="center" fontSize="sm">
              Supported Chains
            </Text>

            <Flex wrap={["wrap", "nowrap"]} direction="row" justify={["start", "space-around"]} w={["300px", "500px"]}>
              <Tooltip label="Live on Devnet">
                <Image src={chainElrond} boxSize="40px" borderRadius="lg" m="5px" />
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

            <Text textAlign="center" fontSize="xx-small">
              {dataDexVersion}
            </Text>

          </Stack>
        </Box>
      </Flex>
    </Container>
  );
};

const PopupChainSelectorForWallet = ({onElrondEnvPick}) => {
  const [showElrondEnvPicker, setShowElrondEnvPicker] = useState(false);
  const [elrondEnv, setElrondEnv] = useState('devnet');

  return (
    <Popover
      isOpen={showElrondEnvPicker}
      onOpen={() => setShowElrondEnvPicker(true)}
      onClose={() => setShowElrondEnvPicker(false)}
      closeOnBlur={true}
      isLazy
      lazyBehavior='keepMounted'>
        <HStack>              
          <PopoverTrigger>
            <Button>Connect my Elrond Wallet</Button>
          </PopoverTrigger>
        </HStack>

        <PopoverContent>
          <PopoverBody>
            <Text fontSize="sm" mt="2" mb="2">Please pick a Elrond environment</Text>
              <RadioGroup value={elrondEnv} onChange={networkCode => setElrondEnv(networkCode)}>
                <Radio value="devnet" p="1"><Text fontSize="sm">Devnet</Text></Radio>
                <Radio value="mainnet" p="1"><Text fontSize="sm">Mainnet</Text></Radio>
              </RadioGroup>

              <Button mt="4" onClick={() => {
                setShowElrondEnvPicker(false); 
                onElrondEnvPick('elrond', elrondEnv);
              }}> Select Wallet
              </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
};

export default AuthLauncher;
