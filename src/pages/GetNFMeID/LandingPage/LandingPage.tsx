import React from "react";
import { Box, Button, Image, Heading, Link, Flex, Text, Spacer, useColorMode } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useNavigate } from "react-router-dom";
import darkNfMeIDVaultHero from "assets/img/landing/nfme/dark-hero-nfme-landing-page.png";
import liteNfMeIDVaultHero from "assets/img/landing/nfme/lite-hero-nfme-landing-page.png";
import mvxIcon from "assets/img/mx-logo.png";
import solIcon from "assets/img/sol-logo.png";
import { gtagGo } from "libs/utils";

export const LandingPage = ({ onShowConnectWalletModal }: { onShowConnectWalletModal?: any }) => {
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const navigate = useNavigate();

  return (
    <Box mb="10">
      <Box width={{ base: "100%", md: "80%" }} textAlign={{ base: "center", md: "center" }} m="auto" pt="10">
        <Heading as="h1" size={{ base: "xl", md: "xl" }} fontFamily="Clash-Regular" mt="5">
          NFMe ID Vault +{" "}
          <Text as="span" color="teal.200">
            Liveliness Reputation Staking
          </Text>{" "}
        </Heading>
        <Heading as="h2" size={{ base: "lg", md: "lg" }} fontFamily="Clash-Regular" mt="2" opacity="0.6">
          Farm Your Reputation For Rewards
        </Heading>

        <Flex flexDirection={{ base: "column", md: "row" }} justifyContent="center" alignItems={{ base: "center", md: "normal" }} mt="10">
          <Box border="1px solid" borderColor="teal.400" borderRadius="lg" p="5" mx={{ base: "0", md: "5" }} my={{ base: "5", md: "0" }} width="320px">
            <Heading as="h2" color="teal.200" fontWeight="bold" fontSize="2xl" fontFamily="Clash-Regular">
              Your Gateway Into the Itheum Protocol{" "}
            </Heading>
            <Text fontSize="lg" mt="1rem">
              NFMe ID Vaults are special Data NFTs that anyone can mint to prove their on-chain reputation. <br />
              <br />
              Minting an NFMe ID requires a fully refundable $ITHEUM bond, which signals your on-chain {`'Liveliness'`} reputation. <br />
            </Text>
          </Box>

          <Box border="1px solid" borderColor="teal.400" borderRadius="lg" p="5" mx={{ base: "0", md: "5" }} my={{ base: "5", md: "0" }} width="320px">
            <Heading as="h2" color="teal.200" fontWeight="bold" fontSize="2xl" fontFamily="Clash-Regular">
              Farm Reputation Staking Rewards
            </Heading>
            <Text fontSize="lg" mt="1rem">
              Farming your Liveliness reputation will earn you $ITHEUM rewards as staking APR.
              <br />
              <br />
              Encouraging you to build your on-chain reputation whilst you share in the real-yield generated by data trading on the Itheum protocol.
            </Text>
          </Box>

          <Box border="1px solid" borderColor="teal.400" borderRadius="lg" p="5" mx={{ base: "0", md: "5" }} my={{ base: "5", md: "0" }} width="320px">
            <Heading as="h2" color="teal.200" fontWeight="bold" fontSize="2xl" fontFamily="Clash-Regular">
              Connect your {`"Personas"`}, Boost Your Rewards
            </Heading>
            <Text fontSize="lg" mt="1rem">
              Each NFMe ID mint earns you 5 copies, each as rare as regular NFTs (based on traits).
              <br />
              <br />
              Connect your web2 and web3 accounts to your NFMe ID and distribute copies to your {`"web3 persona"`} accounts to boost your rewards.
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box>
        <Image
          mt="10"
          mb="10"
          boxSize="100%"
          height="auto"
          src={colorMode === "light" ? liteNfMeIDVaultHero : darkNfMeIDVaultHero}
          alt="NFMeID Vault Hero"
          borderRadius="lg"
        />
      </Box>

      <Flex
        bgGradient={colorMode === "light" ? "linear(to-b, white, #00C79730, white)" : "linear(to-b, bgDark, #00C79730, bgDark)"}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        p="5">
        <Heading as="h2" textAlign="center" mb={5} fontFamily="Clash-Medium">
          Get Started!
        </Heading>

        <Flex flexDirection={{ base: "column", md: "row" }} justifyContent="space-around" alignItems="center">
          <Flex flexDirection="column" justifyContent="space-between" h="210px" w="390px" my={{ base: "5", md: "0" }}>
            <Box h="100px">
              <Image m="auto" boxSize="100px" height="auto" src={mvxIcon} alt="MultiversX " borderRadius="lg" />
            </Box>
            <Text fontWeight="bold">Live Now on MultiversX!</Text>
            <Spacer />
            <Button
              m="auto"
              variant="solid"
              colorScheme="teal"
              px={7}
              py={6}
              rounded="lg"
              onClick={() => {
                gtagGo("nfm", "mint", "mvx");

                if (mxAddress) {
                  navigate("/mintdata?launchTemplate=nfmeidvault");
                } else {
                  onShowConnectWalletModal("mvx", "/mintdata?launchTemplate=nfmeidvault");
                }
              }}>
              Mint Your NFMe ID Vault on MultiversX
            </Button>
          </Flex>

          <Flex flexDirection="column" justifyContent="space-between" h="210px" w="390px" my={{ base: "5", md: "0" }}>
            <Box h="100px">
              <Image m="auto" mt="10px" boxSize="73px" height="auto" src={solIcon} alt="Solana " borderRadius="lg" />
            </Box>
            <Text fontWeight="bold">Coming Very Soon to Solana</Text>
            <Spacer />
            <Button
              as={Link}
              m="auto"
              colorScheme="teal"
              variant="outline"
              px={7}
              py={6}
              rounded="lg"
              onClick={() => {
                gtagGo("nfm", "mint", "sol");
              }}
              href="https://docs.google.com/forms/d/e/1FAIpQLSdC_HBveamuFiHjI3dGIIXkOnODyYXxtZdJQCmTyzSfRY2i8A/viewform"
              isExternal>
              Claim Whitelist NFMe ID NFT Airdrop on Solana
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};
