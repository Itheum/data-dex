import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Bond, BondContract, DataNft, dataNftTokenIdentifier, itheumTokenIdentifier, LivelinessStake } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import NftMediaComponent from "components/NftMediaComponent";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { formatNumberToShort, isValidNumericCharacter } from "libs/utils";
import { LivelinessScore } from "components/Liveliness/LivelinessScore";
import { useAccountStore } from "store";
import { env, send } from "process";
import { set } from "react-hook-form";

export const LivelinessStaking: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { itheumBalance } = useAccountStore();

  const [combinedLiveliness, setCombinedLiveliness] = useState<number>(0);
  const [combinedBondsStaked, setCombinedBondsStaked] = useState<number>(0);
  const [rewardApy, setRewardApy] = useState<number>(0);
  const [maxApy, setMaxApy] = useState<number>(0);
  const [accumulatedRewards, setAccumulatedRewards] = useState<number>(0);

  const [globalTotalBond, setGlobalTotalBond] = useState<number>(0);
  const [globalRewardsPerBlock, setGlobalRewardsPerBlock] = useState<number>(0);

  const [nfmeId, setNfmeId] = useState<DataNft | undefined>(undefined);
  const [nfmeIdBond, setNfmeIdBond] = useState<Bond>();

  const [topUpItheumValue, setTopUpItheumValue] = useState<number>(0);

  const [estAnnualRewards, setEstAnnualRewards] = useState<number>(0);
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
      setEstAnnualRewards(Math.floor(rewardPerYear));
    }
  }, [globalTotalBond, combinedBondsStaked, maxApy]);

  useEffect(() => {
    async function fetchNfmeIdData() {
      if (address) {
        const envNetwork = import.meta.env.VITE_ENV_NETWORK as string;
        const bondContract = new BondContract(envNetwork);
        const nfmeIdData = await bondContract.viewAddressVaultNonce(
          new Address(address),
          envNetwork === "mainnet" ? dataNftTokenIdentifier.mainnet : dataNftTokenIdentifier.devnet
        );
        const dataNft = await DataNft.createFromApi({
          nonce: nfmeIdData,
        });
        setNfmeId(dataNft);
        const bonds = await bondContract.viewAddressBonds(new Address(address));
        const foundBound = bonds.find((bond) => bond.nonce === nfmeIdData);
        if (foundBound) {
          setNfmeIdBond(foundBound);
        }
      }
    }
    fetchNfmeIdData();
  }, [address, hasPendingTransactions]);

  async function handleClaimRewarsClick() {
    const envNetwork = import.meta.env.VITE_ENV_NETWORK;
    const liveContract = new LivelinessStake(envNetwork);
    const tx = liveContract.claimRewards(new Address(address));
    tx.setGasLimit(200000000);
    await sendTransactions({
      transactions: [tx],
    });
  }

  const calculateNewPeriodAfterNewBond = (unbondTimestamp: number, lockPeriod: number) => {
    const newExpiry = new Date((unbondTimestamp + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  return (
    <HStack justifyContent={"center"} alignItems={"flex-start"}>
      <VStack flexWrap={"wrap"} gap={7} mx={{ base: 0, md: 12 }} my={4} alignItems={"start"}>
        <Heading as="h1" size="lg" fontFamily="Clash-Medium" color="teal.200" alignItems={"start"}>
          Your Liveliness Rewards
        </Heading>
        <VStack borderStyle={"solid"} borderWidth={"2px"} borderColor={"teal.200"} borderRadius="lg" p={6} alignItems={"start"} minW={{ md: "36rem" }}>
          <Text fontSize="3xl">Combined Liveliness: {combinedLiveliness}</Text>
          <Progress hasStripe isAnimated value={combinedLiveliness} rounded="xs" colorScheme="teal" width={"100%"} />
          <Text fontSize="2xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked)}</Text>
          <Text fontSize="2xl">Global Total Bonded: {formatNumberToShort(globalTotalBond)}</Text>
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
            <VStack>
              <Button fontSize="lg" colorScheme="teal" px={6}>
                Top-Up NFMe.ID Data NFT
              </Button>
              <Text fontSize="md">Compound rewards</Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
      <VStack mx={{ base: 0, md: 12 }} my={4} alignItems={"start"}>
        {nfmeId && (
          <>
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
              minH={"100px"}>
              <HStack m={6} mr={0} justifyContent={"flex-start"} width={"90%"} alignItems={"flex-start"}>
                <Image
                  w={"120px"}
                  h={"120px"}
                  borderRadius={"md"}
                  src={nfmeId.nftImgUrl}
                  onError={({ currentTarget }) => {
                    currentTarget.src = DEFAULT_NFT_IMAGE;
                  }}
                />
                <VStack alignItems={"start"} w={"100%"}>
                  <Text fontSize="xl" alignItems={"flex-start"}>
                    NFMe.ID Vault Data NFT
                  </Text>
                  <LivelinessScore unbondTimestamp={nfmeIdBond?.unbondTimestamp} lockPeriod={nfmeIdBond?.lockPeriod} />
                  <Flex gap={4} pt={3} alignItems="center">
                    <Button
                      colorScheme="teal"
                      px={6}
                      onClick={() => {
                        const bondContract = new BondContract(import.meta.env.VITE_ENV_NETWORK);
                        const tx = bondContract.renew(new Address(address), nfmeId.collection, nfmeId.nonce);
                        sendTransactions({
                          transactions: [tx],
                        });
                      }}>
                      Renew Bond
                    </Button>
                    <Text>{`New expiry will be ${calculateNewPeriodAfterNewBond(nfmeIdBond?.unbondTimestamp ?? 0, nfmeIdBond?.lockPeriod ?? 0)}`}</Text>
                  </Flex>
                  <Flex gap={4} pt={3} alignItems="center">
                    <Flex flexDirection="column" gap={1}>
                      <Flex flexDirection="row" gap={4}>
                        <Text fontSize=".75rem" textColor="teal.200">
                          {BigNumber(nfmeIdBond?.bondAmount ?? 0)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Bonded
                        </Text>
                        <Text fontSize=".75rem">|</Text>
                        <Text fontSize=".75rem" textColor="indianred">
                          {BigNumber(nfmeIdBond?.bondAmount ?? 0)
                            .minus(nfmeIdBond?.remainingAmount ?? 0)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Penalized
                        </Text>
                        <Text fontSize=".75rem">|</Text>
                        <Text fontSize=".75rem" textColor="mediumpurple">
                          {BigNumber(nfmeIdBond?.remainingAmount ?? 0)
                            .dividedBy(10 ** 18)
                            .toNumber()}
                          &nbsp;$ITHEUM Remaining
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </VStack>
              </HStack>
              <Box h={"1px"} w={"100%"} borderStyle={"solid"} borderWidth={"1px"} borderColor={"teal.200"} />
              <HStack mx={6} my={2} justifyContent={"center"} alignItems={"flex-start"}>
                <VStack alignItems={"start"} w={"100%"}>
                  <Text fontSize="xl" alignItems={"flex-start"} fontFamily="Inter" color="teal.200">
                    Top-Up Liveliness for Boosted Rewards
                  </Text>
                  <Text fontSize="xl">Available Balance: {formatNumberToShort(itheumBalance)} $ITHEUM</Text>
                  <HStack my={2}>
                    <Text fontSize="xl" color={"grey"}>
                      Top-Up Liveliness
                    </Text>
                    <NumberInput
                      ml="3px"
                      size="sm"
                      maxW="24"
                      step={1}
                      defaultValue={1020}
                      min={1}
                      max={itheumBalance}
                      isValidCharacter={isValidNumericCharacter}
                      value={topUpItheumValue}
                      onChange={(value) => {
                        setTopUpItheumValue(Number(value));
                        const percentage = (combinedBondsStaked + Number(value)) / globalTotalBond;
                        const localRewardsPerBlock = globalRewardsPerBlock * percentage;
                        const blockPerYear = 31536000 / 6;
                        const rewardPerYear = localRewardsPerBlock * blockPerYear;
                        setEstAnnualRewards(Math.floor(rewardPerYear));
                      }}
                      keepWithinRange={true}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button
                      colorScheme="teal"
                      size={"sm"}
                      variant={"outline"}
                      px={4}
                      onClick={() => {
                        setTopUpItheumValue(Math.floor(itheumBalance));
                        const percentage = (combinedBondsStaked + Math.floor(itheumBalance)) / globalTotalBond;
                        const localRewardsPerBlock = globalRewardsPerBlock * percentage;
                        const blockPerYear = 31536000 / 6;
                        const rewardPerYear = localRewardsPerBlock * blockPerYear;
                        setEstAnnualRewards(Math.floor(rewardPerYear));
                      }}>
                      MAX
                    </Button>
                    <Box>
                      <Button
                        colorScheme="teal"
                        px={6}
                        onClick={() => {
                          const envNetwork = import.meta.env.VITE_ENV_NETWORK;
                          const bondContract = new BondContract(envNetwork);
                          const tx = bondContract.topUpVault(
                            new Address(address),
                            {
                              tokenIdentifier: envNetwork === "mainnet" ? itheumTokenIdentifier.mainnet : itheumTokenIdentifier.devnet,
                              amount: new BigNumber(topUpItheumValue).multipliedBy(10 ** 18),
                            },
                            nfmeId.nonce,
                            nfmeId.collection
                          );
                          sendTransactions({
                            transactions: [tx],
                          });
                        }}>
                        Top-Up Now
                      </Button>
                      <Text position="absolute" mt={2} fontSize="sm" color={"grey"}>
                        Note: top-up will also renew bond
                      </Text>
                    </Box>
                  </HStack>
                  <Text fontSize="lg">Est. Annual Rewards: {formatNumberToShort(estAnnualRewards)} $ITHEUM</Text>
                </VStack>
              </HStack>
            </VStack>
          </>
        )}
      </VStack>
    </HStack>
  );
};
