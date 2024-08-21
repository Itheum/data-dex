import React from "react";
import { Box, Button, Flex, Image, Text, Link, Heading, useColorMode } from "@chakra-ui/react";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/hooks/account";
import { useNavigate } from "react-router-dom";
import darkLivelinessRewards from "assets/img/landing/nfme/dark-liveliness-rewards.png";
import darkMintWithBond from "assets/img/landing/nfme/dark-mint-nfmeid-with-bond.png";
import darkTopUp from "assets/img/landing/nfme/dark-nfmeid-topup.png";
import liteLivelinessRewards from "assets/img/landing/nfme/lite-liveliness-rewards.png";
import liteMintWithBond from "assets/img/landing/nfme/lite-mint-nfmeid-with-bond.png";
import liteTopUp from "assets/img/landing/nfme/lite-nfmeid-topup.png";
import { gtagGo } from "libs/utils";

export const LivelinessStaking = ({ onShowConnectWalletModal }: { onShowConnectWalletModal?: any }) => {
  const { colorMode } = useColorMode();
  const { address: mxAddress } = useGetAccountInfo();
  const navigate = useNavigate();

  return (
    <Flex id="liveliness" flexDirection="column" w="full" h="auto" justifyContent="center" my={10} p={2} backgroundColor="1green">
      <Heading as="h1" textAlign="center" fontSize={{ base: "34px", md: "50px" }} fontFamily="Clash-Medium">
        Liveliness Staking Rewards
      </Heading>
      <Heading as="h2" textAlign="center" fontSize={{ base: "20px", md: "20px" }} mb={5} fontFamily="Clash-Medium">
        How can you get your Liveliness Staking rewards? Easy as 1,2,3...
      </Heading>

      <Flex flexDirection="column">
        <Flex my="5" alignItems="center">
          <Box minW={"400px"}>
            <Image
              boxSize="340px"
              height="auto"
              m="auto"
              border="1px solid"
              borderColor="teal.400"
              src={colorMode === "light" ? liteMintWithBond : darkMintWithBond}
              alt="Step 1: bond $ITHEUM to create your NFMe ID"
              borderRadius="lg"
            />
          </Box>
          <Text p="5" fontSize="md">
            Bond a minimum amount of $ITHEUM to mint your NFMe ID Vault and activate your Liveliness score, which is your on-chain reputation as a Data Creator.
            <br />
            <br />
            This bond also triggers staking rewards based on your token bond and Liveliness score. Renew your Liveliness bond anytime, keeping it close to 100%
            for maximum rewards.
          </Text>
        </Flex>
        <Flex my="5" alignItems="center">
          <Text p="5" fontSize="md">
            Top up your NFMe ID bond with extra $ITHEUM to increase your Liveliness reputation and boost your reward share. Worried about penalties? {"Don't"}{" "}
            be.
            <br />
            <br />
            The Trailblazer DAO manages bonds and works with the community to identify good and bad actors, curating reputations. This makes the Liveliness
            score unique, allowing you to {`"farm"`} rewards based on your reputation in the Itheum protocol!
          </Text>
          <Box minW={"500px"}>
            <Image
              boxSize="400px"
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
        <Flex my="5" alignItems="center">
          <Box minW={"500px"}>
            <Image
              boxSize="400px"
              height="auto"
              m="auto"
              border="1px solid"
              borderColor="teal.400"
              src={colorMode === "light" ? liteLivelinessRewards : darkLivelinessRewards}
              alt="Step 3: Get Staking Rewards for your Liveliness"
              borderRadius="lg"
            />
          </Box>
          <Text p="5" fontSize="md">
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
            gtagGo("nfm", "stake", "body");

            if (mxAddress) {
              navigate("/liveliness");
            } else {
              onShowConnectWalletModal("mvx", "/liveliness");
            }
          }}>
          Get Liveliness Staking Rewards
        </Button>
      </Box>
    </Flex>
  );
};
