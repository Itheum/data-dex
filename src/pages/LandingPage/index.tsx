import React from "react";
import { Box, Center, Flex, Heading, Image, Text, useColorMode } from "@chakra-ui/react";
import imgHeroDataNFTs from "assets/img/landing/hero-data-nfts.png";
import imgHeroMetaverseMask from "assets/img/landing/hero-metaverse-mask.png";
import NewCreatorCTA from "components/NewCreatorCTA";
import NFMeIdCTA from "components/NFMeIdCTA";
import ExplainerArticles from "components/Sections/ExplainerArticles";
import RecentArticles from "components/Sections/RecentArticles";
import RecentDataNFTs from "components/Sections/RecentDataNFTs";
import VolumesDataNfts from "pages/Home/components/VolumesDataNfts";

const LandingPage = () => {
  const { colorMode } = useColorMode();
  let containerShadow = "rgb(255 255 255 / 16%) 0px 10px 36px 0px, rgb(255 255 255 / 6%) 0px 0px 0px 1px";

  if (colorMode === "light") {
    containerShadow = "rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px";
  }

  return (
    <Box>
      <Flex
        bgColor={colorMode === "dark" ? "bgDark" : "white"}
        flexDirection="column"
        justifyContent="space-between"
        minH="100vh"
        boxShadow={containerShadow}
        zIndex={2}>
        <Box backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"} flexGrow="1">
          <Flex
            w="100%"
            h={["45rem", "45rem"]}
            bgImage={imgHeroMetaverseMask}
            bgSize="contain"
            bgPosition="bottom"
            bgRepeat="no-repeat"
            justifyContent="center">
            <Center w="95%" pt="5rem">
              <Flex w="100%" justifyContent={[null, null, null, "space-between"]} flexDirection={["column", null, "row"]} mx={{ base: 0, "lg": 12 }}>
                <Box width={["300px", null, null, "500px", "690px"]} textAlign={["center", null, null, "center", "left"]} m={["auto", "initial"]} pt={10}>
                  <Heading as="h1" size={["2xl", null, null, "3xl", "4xl"]} fontFamily="Clash-Regular">
                    Tokenize and Trade{" "}
                    <Text as="span" color="teal.200">
                      Your Data
                    </Text>{" "}
                  </Heading>

                  <Text mt="1rem" fontFamily="Clash-Regular">
                    Seamlessly enable web3 gated access to your data by minting and listing Data NFTs on a peer-to-peer marketplace. Allow organic open-market
                    price discovery for data by minting multiple supplies to satisfy high demand or burning supply to correct low demand. Earn creator royalties
                    if your data is re-traded. The future of data tokenization and trading is here.
                  </Text>
                </Box>

                <Box mt={["2rem", "initial"]}>
                  <Image className="bounce-hero-img" boxSize="480px" height="auto" src={imgHeroDataNFTs} alt="Data NFTs Preview" />
                </Box>
              </Flex>
            </Center>
          </Flex>

          <Box m="auto" pt="10" pb="10" w={"100%"} bgGradient={colorMode === "light" ? "bgWhite" : "linear(to-b, bgDark, #00C79730, bgDark)"}>
            <NFMeIdCTA />
          </Box>

          <Box pt={{ base: "28", "2xl": "10" }} pb="10" mx={{ base: 8, "lg": 20 }}>
            <NewCreatorCTA />
          </Box>

          <Box pt={{ base: "28", "2xl": "10" }} pb="10" mx={{ base: 8, "lg": 20 }}>
            <VolumesDataNfts />
          </Box>

          <Box pt={{ base: "28", "2xl": "10" }} pb="10" mx={{ base: 8, "lg": 20 }}>
            <RecentDataNFTs headingText="Recent Data NFTs" />
          </Box>

          <Box mx={{ base: 8, "lg": 20 }} py="10">
            <Heading as="h2" size="lg" fontFamily="Clash-Medium" textAlign={["center", "initial"]}>
              Get Started
            </Heading>

            <ExplainerArticles />
          </Box>

          <Box mx={{ base: 8, "lg": 20 }} py="10">
            <Heading as="h2" fontFamily="Clash-Medium" size="lg" textAlign={["center", "initial"]}>
              Featured Articles
            </Heading>

            <RecentArticles />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default LandingPage;
