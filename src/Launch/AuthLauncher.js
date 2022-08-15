import { useState } from "react";
import { Button, Text, Image, Tooltip, 
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverCloseButton, PopoverHeader, PopoverArrow,
  useColorMode } from "@chakra-ui/react";
import { Container, Heading, Flex, Spacer, Box, Stack, HStack } from "@chakra-ui/layout";
import chainEth from "img/eth-chain-logo.png";
import chainPol from "img/polygon-chain-logo.png";
import chainBsc from "img/bsc-chain-logo.png";
import chainAvln from "img/avalanche-chain-logo.png";
import chainHrmy from "img/harmony-chain-logo.png";
import chainParastate from "img/parastate-chain-logo.png";
import chainElrond from "img/elrond-chain-logo.png";
import logoSmlL from 'img/logo-sml-l.png';
import logoSmlD from 'img/logo-sml-d.png';
import launcherBG from 'img/launch-bg.png';

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : 'version number unknown';

const AuthLauncher = ({ onLaunchMode }) => {

  const { colorMode } = useColorMode();

  return (
    <Container maxW="container.xxl" h="100vh" d="flex" justifyContent="center" alignItems="center" backgroundImage={launcherBG}>
      <Box p={["20px", null, "30px"]} borderWidth="1px" borderRadius="lg" backgroundColor={colorMode === "dark" && "gray.800" || "white"}>
        <Stack>
          <Image w={["70px", null, "90px"]} h={["60px", null, "80px"]} src={colorMode === "dark" ? logoSmlD : logoSmlL} alt="Itheum Data DEX" margin="auto" />
          <Heading size="md" textAlign="center">
            Itheum Data DEX
          </Heading>
          <Text fontSize="sm" textAlign="center">
            Multi-chain Web3 tools for personal data ownership and trade
          </Text>
          <Spacer />

          <HStack justifyContent="center" p={["initial", 8]} spacing={["initial", 6]} flexDirection={["column", "initial"]}>
            <PopupChainSelectorForWallet
              lrgButtonSize={true}
              hideTerms={true}
              onElrondEnvPick={onLaunchMode} />

            <Spacer pt={5} display={["block", "none"]} />

            <Button onClick={() => onLaunchMode('evm')}>
              Connect EVM Wallet
            </Button>
          </HStack>

          <Text textAlign="center" fontSize="sm">
            Supported Chains
          </Text>

          <Flex wrap={["wrap", "nowrap"]} direction="row" justify={"space-around"} w={["300px", "500px"]} align="center">
            <Tooltip label="Live on Elrond Mainnet & Devnet">
              <Image src={chainElrond} boxSize="30px" borderRadius="lg" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Ropsten & Rinkeby Testnets">
              <Image src={chainEth} boxSize="30px" width="20px" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Binance Smart Chain Testnet">
              <Image src={chainBsc} boxSize="30px" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Avalanche C-Chain Testnet">
              <Image src={chainAvln} boxSize="30px" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Mumbai Testnet">
              <Image src={chainPol} boxSize="30px" borderRadius="lg" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Parastate (Polkadot) Testnet">
              <Image src={chainParastate} boxSize="30px" width="25px" m="5px" />
            </Tooltip>
            <Tooltip label="Live on Harmony Testnet">
              <Image src={chainHrmy} boxSize="30px" m="5px" />
            </Tooltip>
          </Flex>

          <Text textAlign="center" fontSize="xx-small">
            {dataDexVersion}
          </Text>

        </Stack>
      </Box>
    </Container>
  );
};

const PopupChainSelectorForWallet = ({onElrondEnvPick}) => {
  const [showElrondEnvPicker, setShowElrondEnvPicker] = useState(false);

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
            <Button>Connect Elrond Wallet</Button>
          </PopoverTrigger>
        </HStack>

        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text fontSize="md">Please pick an Elrond environment</Text>            
          </PopoverHeader>
          <PopoverBody>
              <Button size="sm" onClick={() => {
                setShowElrondEnvPicker(false);
                onElrondEnvPick('elrond', 'mainnet');
              }}> Mainnet
              </Button>

              <Button size="sm" ml="2" onClick={() => {
                setShowElrondEnvPicker(false);
                onElrondEnvPick('elrond', 'devnet');
              }}> Devnet
              </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
};

export default AuthLauncher;
