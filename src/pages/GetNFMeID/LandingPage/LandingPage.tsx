import React from "react";
import { Box, Button, Center, Flex, Heading, Image, Link, Text, useColorMode } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import nfMeIDVault from "assets/img/nfme-id-vault.png";
import { gtagGo } from "libs/utils";

export const LandingPage: React.FC = () => {
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const navigate = useNavigate();

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
          <Box
            width={["100%", null, null, "500px", "650px"]}
            textAlign={["center", null, null, "left", "left"]}
            ml={{ xs: "auto", xl: 10 }}
            pt={10}
            style={{ overflow: "hidden" }}>
            <Heading as="h1" size="2xl" fontFamily="Clash-Medium" pt={20}>
              Get{" "}
              <Text as="span" color="teal.200">
                Your NFMe ID{" "}
              </Text>
              Vault Today!
            </Heading>

            <Text fontSize="lg" fontWeight="400" lineHeight="25px" my={4}>
              NFMe ID Vaults are special Data NFTs that anyone can mint to use to prove their on-chain reputation. Minting a NFMe ID requires a fully refundable
              $ITHEUM bond that is used to {"signal"} your on-chain {"'Liveliness'"} reputation. Liveliness bonds earn staking APR while active, encouraging
              reputation building and sharing in real-yield generated by data trading on the Itheum protocol.
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

                if (mxAddress) {
                  navigate("/mintdata?launchTemplate=nfmeidvault");
                } else {
                  alert("Load Login");
                }
              }}>
              Mint Your NFMe ID Vault
            </Button>
          </Box>

          <Box>
            <Image
              className="bounce-hero-img"
              boxSize="auto"
              w={{ base: "90%", md: "83%", xl: "83%", "2xl": "90%" }}
              src={nfMeIDVault}
              alt="NFMe ID Illustration"
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
