import React, { useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Image,
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
import { styleStrings } from "libs/util";
import RecentDataNFTs from "Sections/RecentDataNFTs";
// import { useChainMeta } from "store/ChainMetaContext";

const LandingPage = () => {
  const { colorMode } = useColorMode();
  // const { chainMeta: _chainMeta } = useChainMeta();

  // useEffect(() => {
  //   console.log('********** AppHeader LOAD _chainMeta ', _chainMeta);
  // }, []);

  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";
  let gradientBorder = styleStrings.gradientBorderMulticolor;

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
    gradientBorder = styleStrings.gradientBorderMulticolorLight;
  }

  return (
    <Box>
      <Flex
        bgColor={colorMode === "dark" ? "black" : "white"}
        flexDirection="column"
        justifyContent="space-between"
        minH="100vh"
        boxShadow={containerShadow}
        zIndex={2}>

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
            <RecentDataNFTs headingText="Recent Data NFTs" networkId={"ED"} borderMultiColorStyle={true} />
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
      </Flex>
    </Box>
  );
};

export default LandingPage;
