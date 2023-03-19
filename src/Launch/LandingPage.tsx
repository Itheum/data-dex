import React, { useState, useEffect } from "react";
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
  Text,
  Center,
  Link,
  Card,
  CardBody,
  Stack,
  SimpleGrid,
  useColorMode,
} from "@chakra-ui/react";
import imgHeroDataNFTs from "img/landing/hero-data-nfts.png";
import imgHeroMetaverseMask from "img/landing/hero-metaverse-mask.png";
import logoSmlD from "img/logo-sml-d.png";
import logoSmlL from "img/logo-sml-l.png";
import AppFooter from "Sections/AppFooter";
import RecentDataNFTs from "Sections/RecentDataNFTs";

const LandingPage = ({ onLaunchMode }: { onLaunchMode?: any }) => {
  const { colorMode } = useColorMode();

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";
  let gradientBorder = "linear-gradient(black, black) padding-box, linear-gradient(to right, #FF439D, #00C797) border-box";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
    gradientBorder = "linear-gradient(white, white) padding-box, linear-gradient(to right, #FF439D, #00C797) border-box";
  }

  return (
    <Container maxW="container.xl">
      <Flex
        bgColor={colorMode === "dark" ? "black" : "white"}
        flexDirection="column"
        justifyContent="space-between"
        minH="100vh"
        boxShadow={containerShadow}
        zIndex={2}>

        <Flex
          h="5rem"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={colorMode === "light" ? "white" : "black"}
          borderBottom="solid .1rem"
          borderColor="teal.300"
          p="5">
          <HStack alignItems={"center"} spacing={4}>
            <Image boxSize="48px" height="auto" src={colorMode === "light" ? logoSmlL : logoSmlD} alt="Itheum Data DEX" />

            <Heading size={"md"} display={["none", "block"]}>
              Itheum Data DEX
            </Heading>
          </HStack>

          {onLaunchMode && <PopupChainSelectorForWallet onMxEnvPick={onLaunchMode} />}
        </Flex>

        <Box backgroundColor={colorMode === "light" ? "white" : "black"} flexGrow="1">
          <Flex w="100%"
            h={["40rem", "45rem"]}
            bgImage={imgHeroMetaverseMask}
            bgSize="contain"
            bgPosition="bottom"
            bgRepeat="no-repeat"
            justifyContent="center">

            <Center w="95%" pt="5rem" backgroundColor="none">
              <Flex w="100%" backgroundColor="none" justifyContent={[null, null, null, "space-between"]} flexDirection={["column", null, "row"]}>
                <Box
                  width={["300px", null, null, "500px", "690px"]}
                  backgroundColor="none"
                  textAlign={["center", null, null, "center", "left"]}
                  m={["auto", "initial"]}>
                  <Heading as="h1" size={["2xl", null, null, "3xl", "4xl"]}>
                    Own and trade{" "}
                    <Text as="span" color="teal.300">
                      your data
                    </Text>{" "}
                    in the Web3 Multiverse
                  </Heading>

                  <Text mt="1rem">
                    Lorem ipsum dolor sit amet consectetur. Turpis vulputate vel elementum nibh viverra cras dui faucibus. Risus in sem viverra adipiscing quam
                    in. Dictum aliquam semper orci molesti.
                  </Text>
                </Box>

                <Box backgroundColor="none" mt={["2rem", "initial"]}>
                  <Image boxSize="480px" height="auto" src={imgHeroDataNFTs} alt="Data NFTs Preview" />
                </Box>
              </Flex>
            </Center>
          </Flex>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <RecentDataNFTs headingText="Recent Data NFTs" networkId={"ED"} />
          </Box>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <Heading as="h2" size="lg" textAlign={["center", "initial"]}>
              Data NFT 101
            </Heading>

            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
              {Array.from("123").map(idx => (
                <Card
                  key={idx}
                  variant="outline"
                  backgroundColor="none"
                  border="none"
                >
                  <CardBody>
                    <Box>
                      <Image
                        src="https://www.colorbook.io/imagecreator.php?hex=none&width=350&height=200"
                        alt=">Article Title GOES IN HERE"
                        borderRadius="1.5rem"
                        border=".1rem solid transparent"
                        style={{ "background": gradientBorder }}
                      />
                    </Box>
                    <Stack mt="6" spacing="2">
                      <Text>10 March,2023</Text>
                      <Heading size="md" noOfLines={2} h={{ "xl": "12" }}>Article Title GOES IN HERE, CAPS AND it might be two to three lines long</Heading>
                      <Text noOfLines={2}>Lorem ipsum dolor sit amet consectetur. Tui pis vul vulputate vel elementum nibh viverra cri cras duifa faucibus.....</Text>
                      <Link href="https://chakra-ui.com" isExternal textDecoration="underline">Read More</Link>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          <Box backgroundColor="none" w="95%" m="auto" pt="10" pb="10">
            <Heading as="h2" size="lg" textAlign={["center", "initial"]}>
              Articles
            </Heading>

            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
              {Array.from("123").map(idx => (
                <Card
                  key={idx}
                  variant="outline"
                  backgroundColor="none"
                  border="none"
                >
                  <CardBody>
                    <Box>
                      <Image
                        src="https://www.colorbook.io/imagecreator.php?hex=none&width=350&height=200"
                        alt=">Article Title GOES IN HERE"
                        borderRadius="1.5rem"
                        border=".1rem solid transparent"
                        style={{ "background": gradientBorder }}
                      />
                    </Box>
                    <Stack mt="6" spacing="2">
                      <Text>10 March, 2023</Text>
                      <Heading size="md" noOfLines={2} h={{ "xl": "12" }}>Article Title GOES IN HERE, CAPS AND it might be two to three lines long</Heading>
                      <Text noOfLines={2}>Lorem ipsum dolor sit amet consectetur. Tui pis vul vulputate vel elementum nibh viverra cri cras duifa faucibus.....</Text>
                      <Link href="https://chakra-ui.com" isExternal textDecoration="underline">Read More</Link>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

        </Box>

        <AppFooter />
      </Flex>
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
          <Button colorScheme="teal" fontSize={{ base: "sm", md: "md" }}>
            Connect MultiversX Wallet
          </Button>
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

export default LandingPage;
