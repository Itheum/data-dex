import React from "react";
import { Box, Button, Flex, Image, Text, Heading, Link, useColorMode } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useNavigate } from "react-router-dom";
import darkLivelinessRewards from "assets/img/landing/nfme/dark-liveliness-rewards.png";
import darkMintWithBond from "assets/img/landing/nfme/dark-mint-nfmeid-with-bond.png";
import darkTopUp from "assets/img/landing/nfme/dark-nfmeid-topup.png";
import liteLivelinessRewards from "assets/img/landing/nfme/lite-liveliness-rewards.png";
import liteMintWithBond from "assets/img/landing/nfme/lite-mint-nfmeid-with-bond.png";
import liteTopUp from "assets/img/landing/nfme/lite-nfmeid-topup.png";
import { gtagGo } from "libs/utils";
import { useWallet } from "@solana/wallet-adapter-react";

export const LivelinessStaking = ({ onShowConnectWalletModal }: { onShowConnectWalletModal?: any }) => {
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const { connected: connectedSolWallet } = useWallet();
  const navigate = useNavigate();

  return (
    <Box mb="10" width={{ base: "95%", md: "80%" }} textAlign={{ base: "center", md: "center" }} m="auto" pt="5">
      <Flex id="liveliness" flexDirection="column" my={10} p={2}>
        <Heading as="h1" textAlign="center" fontSize={{ base: "34px", md: "50px" }} fontFamily="Clash-Medium">
          Liveliness Staking Rewards
        </Heading>
        <Heading as="h2" textAlign="center" fontSize={{ base: "20px", md: "20px" }} mb={5} fontFamily="Clash-Medium">
          How can you get your Liveliness Staking rewards? Easy as 1,2,3...
        </Heading>

        <Flex flexDirection="column">
          <Flex flexDirection={{ base: "column", md: "row" }} my="5" alignItems="center">
            <Box minW={{ base: "330px", md: "500px" }}>
              <Image
                boxSize="370px"
                height="auto"
                m="auto"
                border="1px solid"
                borderColor="teal.400"
                src={colorMode === "light" ? liteMintWithBond : darkMintWithBond}
                alt="Step 1: bond $ITHEUM to create your NFMe ID"
                borderRadius="lg"
              />
            </Box>
            <Text p="5" fontSize="lg" textAlign={{ base: "center", md: "left" }}>
              Bond a minimum amount of $ITHEUM to mint your NFMe ID Vault and activate your Liveliness score, which is your on-chain reputation as a Data
              Creator.
              <br />
              <br />
              This bond also triggers staking rewards based on your token bond and Liveliness score. Renew your Liveliness bond anytime, keeping it close to
              100% for maximum rewards.
            </Text>
          </Flex>
          <Flex flexDirection={{ base: "column-reverse", md: "row" }} my="5" alignItems="center">
            <Text p="5" fontSize="lg" textAlign={{ base: "center", md: "right" }}>
              Top up your NFMe ID bond with extra $ITHEUM to increase your Liveliness reputation and boost your reward share. Worried about penalties? {"Don't"}{" "}
              be.
              <br />
              <br />
              The Trailblazer DAO manages bonds and works with the community to identify good and bad actors, curating reputations. This makes the Liveliness
              score unique, allowing you to {`"farm"`} rewards based on your reputation in the Itheum protocol!
            </Text>
            <Box minW={{ base: "400px", md: "500px" }}>
              <Image
                boxSize="75%"
                height="auto"
                m="auto"
                border="1px solid"
                borderColor="teal.400"
                src={colorMode === "light" ? liteTopUp : darkTopUp}
                alt="Step 2: Top-up Liveliness into your NFMe ID"
                borderRadius="lg"
              />
            </Box>
          </Flex>
          <Flex flexDirection={{ base: "column", md: "row" }} my="5" alignItems="center">
            <Box minW={{ base: "400px", md: "500px" }}>
              <Image
                boxSize="70%"
                height="auto"
                m="auto"
                border="1px solid"
                borderColor="teal.400"
                src={colorMode === "light" ? liteLivelinessRewards : darkLivelinessRewards}
                alt="Step 3: Get Staking Rewards for your Liveliness"
                borderRadius="lg"
              />
            </Box>
            <Text p="5" fontSize="lg" textAlign={{ base: "center", md: "left" }}>
              The more $ITHEUM bonds you lock and the higher your {`"Combined Liveliness"`} across all Data NFTs or NFMe ID Vaults, the greater your rewards.{" "}
              <br />
              <br />
              You can claim rewards anytime or reinvest them directly into your NFMe ID Vault. Maintain a combined Liveliness score over 95% to maximize your
              rewards.
            </Text>
          </Flex>
        </Flex>

        <Box m="auto">
          <Button
            size="xl"
            variant="solid"
            colorScheme="teal"
            px={7}
            py={6}
            rounded="lg"
            mt={7}
            onClick={() => {
              gtagGo("nfm", "try", "stake");

              if (mxAddress || connectedSolWallet) {
                navigate("/liveliness");
              } else {
                onShowConnectWalletModal("mvx", "/liveliness");
              }
            }}>
            Get Liveliness Staking Rewards Now!
          </Button>
        </Box>
        <Box m="auto" mt="5">
          <Button
            as={Link}
            m="auto"
            colorScheme="teal"
            variant="outline"
            px={7}
            py={6}
            rounded="lg"
            onClick={() => {
              gtagGo("nfm", "guide", "stake");
            }}
            href="https://docs.itheum.io/product-docs/product/liveliness-on-chain-reputation/liveliness-staking-guide"
            isExternal>
            Read & Follow a Guide
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};
