import React, { useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Wrap,
  WrapItem,
  Text,
  Center,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";

const dataDexVersion = process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : "version number unknown";
const nonProdEnv = process.env.NODE_ENV !== 'production' ? `env:${process.env.NODE_ENV}` : `env:${process.env.NODE_ENV}`;

const AuthLauncher = ({ onLaunchMode }: { onLaunchMode: any }) => {
  const { colorMode } = useColorMode();

  return (
    <Container maxW="container.xbl">
      <Container maxW="container.xl">
        <Flex bg={"none"} flexDirection="column" justifyContent={"space-between"} minH="100vh" px={4} boxShadow={"xl"} zIndex={2}>
          <Flex
            h="5rem"
            alignItems={"center"}
            justifyContent={"space-between"}
            backgroundColor={colorMode === "light" ? "white" : "black"}
            borderBottom="solid 1px"
            p="5">
            <HStack alignItems={"center"} spacing={4}>
              <Image boxSize="50px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />
              <Heading fontWeight={"normal"} size={"md"}>
                <Text fontSize="lg">Itheum Data DEX</Text>
              </Heading>
            </HStack>

            <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />
          </Flex>

          <Box backgroundColor={colorMode === "light" ? "white" : "black"} flexGrow="1">
            <Box w="100%" h="400px" bgGradient="linear(to-r, green.200, pink.500)">
              <Center h="100%">
                <Heading color="#000">Own and trade your data in the Web3 Multiverse</Heading>
              </Center>
            </Box>

            <Box p="5">
              <Heading as="h2" size="lg">
                Recent Data NFTs
              </Heading>

              <Wrap spacing="50px" mt="20px">
                <WrapItem>
                  <Image w="250px" src="https://devnet-media.elrond.com/nfts/asset/bafkreidm2ezl6a2zeze2rgy6n5r7ehx5vxerymiglev2wtecvvztrlizka" />
                </WrapItem>
                <WrapItem>
                  <Image w="250px" src="https://devnet-media.elrond.com/nfts/asset/bafkreih7pf65lgyi5gm7n3aapvyai5b23m7tz5m5iwdclw6y4ecwsg35du" />
                </WrapItem>
                <WrapItem>
                  <Image w="250px" src="https://devnet-media.elrond.com/nfts/asset/bafkreicqtuzy5pkbtccckzbfjwfm2qwydnhk4xwgcjchmki5udjqtsc3uq" />
                </WrapItem>
                <WrapItem>
                  <Image w="250px" src="https://devnet-media.elrond.com/nfts/asset/bafkreifw3v3f2xmlhexyh3mgoj4e7uhfguzl6mawdm5ffl7qjcew3i2lzy" />
                </WrapItem>
              </Wrap>
            </Box>

            <Box p="5">
              <Heading as="h2" size="lg">
                Data NFT 101
              </Heading>

              <Wrap spacing="50px" mt="20px">
                <WrapItem>
                  <Center w="250px" h="180px" bg="red.200">
                    Box 1
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="green.200">
                    Box 2
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="tomato">
                    Box 3
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="blue.200">
                    Box 4
                  </Center>
                </WrapItem>
              </Wrap>
            </Box>

            <Box p="5">
              <Heading as="h2" size="lg">
                Notable Articles
              </Heading>

              <Wrap spacing="50px" mt="20px">
                <WrapItem>
                  <Center w="250px" h="180px" bg="red.200">
                    Box 1
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="green.200">
                    Box 2
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="tomato">
                    Box 3
                  </Center>
                </WrapItem>
                <WrapItem>
                  <Center w="250px" h="180px" bg="blue.200">
                    Box 4
                  </Center>
                </WrapItem>
              </Wrap>
            </Box>
          </Box>

          <Box backgroundColor={colorMode === "light" ? "white" : "black"} height={"5rem"} borderTop="solid 1px">
            <Flex flexDirection="column" alignItems="center" justifyContent="center" height="100%">
              <Text fontSize="xx-small">{dataDexVersion} {nonProdEnv && <>{nonProdEnv}</>}</Text>
              <HStack>
                <Link fontSize="xs" href="https://itheum.com/termsofuse" isExternal>
                  Terms of Use <ExternalLinkIcon mx="2px" />
                </Link>
                <Link fontSize="xs" href="https://itheum.com/privacypolicy" isExternal>
                  Privacy Policy <ExternalLinkIcon mx="2px" />
                </Link>
              </HStack>
            </Flex>
          </Box>
        </Flex>
      </Container>
    </Container>
  );
};

const PopupChainSelectorForWallet = ({ onMxEnvPick }: { onMxEnvPick: any }) => {
  const [showMxEnvPicker, setShowMxEnvPicker] = useState(false);

  return (
    <Popover
      isOpen={showMxEnvPicker}
      onOpen={() => setShowMxEnvPicker(true)}
      onClose={() => setShowMxEnvPicker(false)}
      closeOnBlur={true}
      isLazy
      lazyBehavior="keepMounted">
      <HStack>
        <PopoverTrigger>
          <Button>Connect MultiversX Wallet</Button>
        </PopoverTrigger>
      </HStack>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Text fontSize="md">Please pick a MultiversX environment</Text>
        </PopoverHeader>
        <PopoverBody>
          <Button
            size="sm"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "mainnet");
            }}>
            {" "}
            Mainnet
          </Button>

          <Button
            size="sm"
            ml="2"
            onClick={() => {
              setShowMxEnvPicker(false);
              onMxEnvPick("mx", "devnet");
            }}>
            {" "}
            Devnet
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default AuthLauncher;
