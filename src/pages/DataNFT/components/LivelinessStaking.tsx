import React, { useState, useEffect } from "react";
import { Box, Button, Card, Flex, Heading, HStack, Image, Progress, Stack, Text, VStack } from "@chakra-ui/react";
import { BondContract, LivelinessStake } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import NftMediaComponent from "components/NftMediaComponent";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { formatNumberToShort } from "libs/utils";

export const LivelinessStaking: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();

  const [combinedLiveliness, setCombinedLiveliness] = useState<number>(0);
  const [combinedBondsStaked, setCombinedBondsStaked] = useState<number>(0);
  const [rewardApy, setRewardApy] = useState<number>(0);
  const [maxApy, setMaxApy] = useState<number>(0);
  const [accumulatedRewards, setAccumulatedRewards] = useState<number>(0);

  const [globalTotalBond, setGlobalTotalBond] = useState<number>(0);
  const [globalRewardsPerBlock, setGlobalRewardsPerBlock] = useState<number>(0);
  useEffect(() => {
    async function fetcCombinedBonds() {
      if (address) {
        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const bondContract = new BondContract(envNetwork);
        const totalBondAmount = new BigNumber(await bondContract.viewAddressTotalBondAmount(new Address(address)));
        const formattedBondAmount = totalBondAmount.dividedBy(10 ** 18).toNumber();
        setCombinedBondsStaked(formattedBondAmount);

        const totalNetworkBond = new BigNumber(await bondContract.viewTotalBondAmount());
        setGlobalTotalBond(totalNetworkBond.dividedBy(10 ** 18).toNumber());
      }
    }
    fetcCombinedBonds();
  }, [address, hasPendingTransactions]);

  useEffect(() => {
    async function fetchCombinedLiveliness() {
      if (address) {
        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const bondContract = new BondContract(envNetwork);
        const liveliness = await bondContract.viewAddressAvgLivelinessScore(new Address(address));
        setCombinedLiveliness(Math.floor(liveliness * 10000) / 100);
      }
    }
    fetchCombinedLiveliness();
  }, [address, hasPendingTransactions]);

  useEffect(() => {
    async function fetchRewards() {
      if (address) {
        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const liveContract = new LivelinessStake(envNetwork);
        const claimableRewards = new BigNumber(await liveContract.viewClaimableRewards(new Address(address), false));
        setAccumulatedRewards(Math.floor(claimableRewards.dividedBy(10 ** 18).toNumber() * 100) / 100);
      }
    }
    fetchRewards();
  }, [address, hasPendingTransactions]);

  useEffect(() => {
    async function fetchConfig() {
      if (address) {
        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const liveContract = new LivelinessStake(envNetwork);
        const config = await liveContract.viewContractConfiguration();
        setMaxApy(Math.floor(config.maxApr * 10000) / 100);
        setGlobalRewardsPerBlock(new BigNumber(config.rewardsPerBlock).dividedBy(10 ** 18).toNumber());
      }
    }
    fetchConfig();
  }, [address, hasPendingTransactions]);

  useEffect(() => {
    if (combinedBondsStaked === 0) setRewardApy(0);
    if (globalTotalBond > 0) {
      const percentage = combinedBondsStaked / globalTotalBond;
      const localRewardsPerBlock = globalRewardsPerBlock * percentage;
      const blockPerYear = 31536000 / 6;
      const rewardPerYear = localRewardsPerBlock * blockPerYear;
      const calculatedRewardApy = Math.floor((rewardPerYear / combinedBondsStaked) * 10000) / 100;
      if (maxApy === 0) {
        setRewardApy(calculatedRewardApy);
      } else {
        setRewardApy(Math.min(calculatedRewardApy, maxApy));
      }
    }
  }, [globalTotalBond, combinedBondsStaked, maxApy]);

  async function handleClaimRewarsClick() {
    const envNetwork = import.meta.env.VITE_ENV_NETWORK;
    const liveContract = new LivelinessStake(envNetwork);
    const tx = liveContract.claimRewards(new Address(address));
    tx.setGasLimit(200000000);
    await sendTransactions({
      transactions: [tx],
    });
  }

  return (
    <HStack flexWrap={"wrap"}>
      <VStack flexWrap={"wrap"} gap={7} mx={{ base: 0, md: 16 }} my={4} alignItems={"start"}>
        <Heading as="h1" size="lg" fontFamily="Clash-Medium" color="teal.200" alignItems={"start"}>
          Your Liveliness Rewards
        </Heading>
        <VStack borderStyle={"solid"} borderWidth={"2px"} borderColor={"teal.200"} borderRadius="lg" p={6} alignItems={"start"} minW={{ md: "36rem" }}>
          <Text fontSize="3xl">Combined Liveliness: {combinedLiveliness}</Text>
          <Progress hasStripe isAnimated value={combinedLiveliness} rounded="xs" colorScheme="teal" width={"100%"} />
          <Text fontSize="2xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked)}</Text>
          <Text fontSize="2xl">Your reward APR: {rewardApy}%</Text>
          {maxApy > 0 && <Text fontSize="2xl">MAX APR: {maxApy}%</Text>}
          <Text fontSize="2xl">Accumulated Rewards: {formatNumberToShort(accumulatedRewards)} $ITHEUM</Text>
          <HStack mt={5} justifyContent={"center"} alignItems={"flex-start"} width={"100%"}>
            <Button
              fontSize="lg"
              colorScheme="teal"
              px={6}
              onClick={handleClaimRewarsClick}
              isDisabled={address === "" || hasPendingTransactions || accumulatedRewards < 1}>
              Claim rewards
            </Button>
            {/* <VStack>
              <Button fontSize="lg" colorScheme="teal" px={6}>
                Top-Up NFMe.ID Data NFT
              </Button>
              <Text fontSize="md">Compound rewards</Text>
            </VStack> */}
          </HStack>
        </VStack>
      </VStack>
      {/* <VStack flexWrap={"wrap"} mx={{ base: 0, md: 16 }} my={4} alignItems={"start"}>
        <Heading as="h1" size="lg" fontFamily="Clash-Medium" color="teal.200" alignItems={"start"}>
          Your NFMe.ID Vault Data NFT
        </Heading>
        <VStack
          justifyContent={"center"}
          borderStyle={"solid"}
          borderWidth={"2px"}
          borderColor={"teal.200"}
          borderRadius="lg"
          alignItems={"start"}
          minW={{ md: "36rem" }}
          minH={"100px"}>
          <HStack m={6} justifyContent={"flex-start"} width={"100%"}>
            <Image
              w={"120px"}
              h={"120px"}
              borderRadius={"md"}
              src={DEFAULT_NFT_IMAGE}
              onError={({ currentTarget }) => {
                currentTarget.src = DEFAULT_NFT_IMAGE;
              }}
            />
            <VStack>
              <Text fontSize="xl" alignItems={"flex-start"}>
                NFMe.ID Vault Data NFT
              </Text>
            </VStack>
          </HStack>
          <Box h={"1px"} w={"100%"} borderStyle={"solid"} borderWidth={"1px"} borderColor={"teal.200"} />
          <HStack>
            <Image
              w={"120px"}
              h={"120px"}
              borderRadius={"md"}
              src={DEFAULT_NFT_IMAGE}
              onError={({ currentTarget }) => {
                currentTarget.src = DEFAULT_NFT_IMAGE;
              }}
            />
          </HStack>
        </VStack>
      </VStack> */}
    </HStack>
  );
};
