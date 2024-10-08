import React from "react";
import { Box, Button, Center, Flex, Heading, Image, Link, Text, useColorMode } from "@chakra-ui/react";
import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import verifiedCreatorIcon from "assets/img/verified-creator-icon.png";
import illustration from "assets/img/whitelist/getWhitelist.png";
import { gtagGo } from "libs/utils";

export const LandingPage: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      w="100%"
      height={{ base: "auto", md: "87dvh" }}
      bgGradient={colorMode === "light" ? "bgWhite" : "linear(to-r, bgDark, #6B46C160, #00C79730)"}
      bgSize="contain"
      bgPosition="bottom"
      bgRepeat="no-repeat"
      justifyContent="center"
      position="relative">
      <Center w={{ base: "95%", md: "89%", xl: "89%", "2xl": "95%" }}>
        <Flex
          w="100%"
          justifyContent={[null, null, null, null, "space-between"]}
          flexDirection={["column", null, "row"]}
          mx={{ base: 0, "2xl": 20 }}
          alignItems="center">
          <Box width={["100%", null, null, "500px", "650px"]} textAlign={["center", null, null, "left", "left"]} ml={{ xs: "auto", xl: 10 }} pt={10}>
            <Heading as="h1" size="2xl" fontFamily="Clash-Medium" pt={20}>
              <Image w={{ base: "50px", md: "50px", xl: "50px", "2xl": "50px" }} src={verifiedCreatorIcon} alt="Verified Tick" />
              Mint{" "}
              <Text as="span" color="teal.200">
                Your Data{" "}
              </Text>
              as a Verified Data NFT Creator
            </Heading>

            <Text fontSize="lg" fontWeight="400" lineHeight="25px" my={4}>
              Whether you’re a data creator, musician, researcher, content creator, analyst, gamer, or a pioneering project - you have the power to redefine the
              value of your data. Transform your unique datasets into a new asset class by minting your very own Data NFTs.
            </Text>
            <Text mt="1rem" fontSize="lg" fontWeight="400" lineHeight="25px" marginTop="2">
              Anyone can bond ITHEUM tokens to prove public reputation and mint their Data NFTs, but{" "}
              <Text as="span" fontWeight="bold">
                Verified Creators
              </Text>{" "}
              get the official{" "}
              <Text as="span" fontWeight="bold" color="teal.200">
                Green Tick
              </Text>{" "}
              on their Creator pages and build more trust with their community.
            </Text>
            <Button
              as={Link}
              variant="solid"
              colorScheme="teal"
              px={7}
              py={6}
              rounded="lg"
              mt={7}
              onClick={() => {
                gtagGo("gwl", "join", "hero");
              }}
              href="https://share-eu1.hsforms.com/1h2V8AgnkQJKp3tstayTsEAf5yjc"
              isExternal>
              Get Verified Today
            </Button>
          </Box>

          <Box>
            <Image
              className="bounce-hero-img"
              marginLeft="15px"
              boxSize="auto"
              w={{ base: "90%", md: "80%", xl: "80%", "2xl": "90%" }}
              src={illustration}
              alt="Data NFTs Illustration"
            />
          </Box>
        </Flex>
        <Box position="absolute" bottom={2} right={4} display={{ base: "none", md: "flex", xl: "flex" }}>
          <Flex direction="column" justifyContent="end" alignItems="end" gap={5} pb={16} pr={4}>
            <a href="https://x.com/itheum" target="_blank" rel="noreferrer">
              <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
                <Image as={FaTwitter} m="auto" fontSize="3xl" h="full" />
              </Box>
            </a>

            <a href="https://itheum.io/discord" target="_blank" rel="noreferrer">
              <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
                <Image as={FaDiscord} m="auto" fontSize="3xl" h="full" />
              </Box>
            </a>

            <a href="https://t.me/itheum" target="_blank" rel="noreferrer">
              <Box rounded="full" border="2px solid" w={16} h={16} alignContent={"center"} backgroundColor={colorMode === "light" ? "bgWhite" : "bgDark"}>
                <Image as={FaTelegramPlane} m="auto" fontSize="3xl" h="full" />
              </Box>
            </a>
          </Flex>
        </Box>
      </Center>
    </Flex>
  );
};
