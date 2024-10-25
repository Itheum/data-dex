import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
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
  Text,
  Tooltip,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { Bond, BondContract, DataNft, itheumTokenIdentifier, LivelinessStake } from "@itheum/sdk-mx-data-nft/out";
import { Address } from "@multiversx/sdk-core/out";
import { useGetAccountInfo, useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks";
import { sendTransactions } from "@multiversx/sdk-dapp/services";
import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";
import { LivelinessScore } from "components/Liveliness/LivelinessScore";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { formatNumberToShort, isValidNumericCharacter, sleep } from "libs/utils";
import { useAccountStore } from "store";

export const LivelinessStaking: React.FC = () => {
  const navigate = useNavigate();
  const { address: mxAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();
  const { itheumBalance } = useAccountStore();
  const [combinedLiveliness, setCombinedLiveliness] = useState<number>(0);
  const [combinedBondsStaked, setCombinedBondsStaked] = useState<number>(0);
  const [rewardApr, setRewardApr] = useState<number>(0);
  const [maxApr, setMaxApr] = useState<number>(0);

  const [accumulatedRewards, setAccumulatedRewards] = useState<number>(0);
  const [globalTotalBond, setGlobalTotalBond] = useState<number>(0);
  const [globalRewardsPerBlock, setGlobalRewardsPerBlock] = useState<number>(0);

  const [nfmeId, setNfmeId] = useState<DataNft | undefined>(undefined);
  const [nfmeIdBond, setNfmeIdBond] = useState<Bond>();
  const [topUpItheumValue, setTopUpItheumValue] = useState<number>(0);
  const [estAnnualRewards, setEstAnnualRewards] = useState<number>(0);
  const [allInfoLoading, setAllInfoLoading] = useState<boolean>(true);
  const [claimRewardsConfirmationWorkflow, setClaimRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [reinvestRewardsConfirmationWorkflow, setReinvestRewardsConfirmationWorkflow] = useState<boolean>(false);

  useEffect(() => {
    if (hasPendingTransactions) return;

    async function fetchData() {
      if (mxAddress) {
        setAllInfoLoading(true);

        const envNetwork = import.meta.env.VITE_ENV_NETWORK;
        const liveContract = new LivelinessStake(envNetwork);
        const data = await liveContract.getUserDataOut(new Address(mxAddress));

        setCombinedBondsStaked(new BigNumber(data.userData.userStakedAmount).dividedBy(10 ** 18).toNumber());
        setGlobalTotalBond(new BigNumber(data.userData.totalStakedAmount).dividedBy(10 ** 18).toNumber());
        setCombinedLiveliness(Math.floor(data.userData.livelinessScore * 100) / 100);
        setAccumulatedRewards(Math.floor(new BigNumber(data.userData.accumulatedRewards).dividedBy(10 ** 18).toNumber() * 100) / 100);
        setMaxApr(Math.floor(data.contractDetails.maxApr * 100) / 100);
        setGlobalRewardsPerBlock(new BigNumber(data.contractDetails.rewardsPerBlock).dividedBy(10 ** 18).toNumber());

        // 0 means the user has not set a primary NFMe ID yet
        if (data.userData.vaultNonce !== 0) {
          const dataNft = await DataNft.createFromApi({
            nonce: data.userData.vaultNonce,
          });
          const bondContract = new BondContract(envNetwork);
          const bonds = await bondContract.viewAddressBonds(new Address(mxAddress));
          const foundBound = bonds.find((bond) => bond.nonce === data.userData.vaultNonce);

          if (foundBound && new BigNumber(foundBound.remainingAmount).isGreaterThan(0) && foundBound.unbondTimestamp > 0) {
            setNfmeId(dataNft);
            setNfmeIdBond(foundBound);
          } else {
            setNfmeId(undefined);
            setNfmeIdBond(undefined);
          }
        }

        await sleep(1);
        setAllInfoLoading(false);
      }
    }

    fetchData();
  }, [mxAddress, hasPendingTransactions]);

  useEffect(() => {
    if (combinedBondsStaked === 0) setRewardApr(0);

    if (globalTotalBond > 0) {
      const percentage = combinedBondsStaked / globalTotalBond;
      const localRewardsPerBlock = globalRewardsPerBlock * percentage;
      const blockPerYear = 31536000 / 6;
      const rewardPerYear = localRewardsPerBlock * blockPerYear;
      const calculatedRewardApr = Math.floor((rewardPerYear / combinedBondsStaked) * 10000) / 100;

      // console.log("=======================");
      // console.log("globalTotalBond :", globalTotalBond);
      // console.log("calculatedRewardApr :", calculatedRewardApr);
      // console.log("maxApr :", maxApr);
      // console.log("=======================");

      if (maxApr === 0) {
        setRewardApr(calculatedRewardApr);
      } else {
        setRewardApr(Math.min(calculatedRewardApr, maxApr));
      }

      if (maxApr === 0 || calculatedRewardApr < maxApr) {
        setEstAnnualRewards(Math.floor(rewardPerYear));
      } else {
        setEstAnnualRewards(Math.floor((combinedBondsStaked * maxApr) / 100));
      }
    }
  }, [globalTotalBond, combinedBondsStaked, maxApr]);

  async function handleClaimRewardsClick() {
    const envNetwork = import.meta.env.VITE_ENV_NETWORK;
    const liveContract = new LivelinessStake(envNetwork);
    const tx = liveContract.claimRewards(new Address(mxAddress));
    tx.setGasLimit(200000000);
    await sendTransactions({
      transactions: [tx],
    });
  }

  async function handleReinvestRewardsClick() {
    const envNetwork = import.meta.env.VITE_ENV_NETWORK;
    const liveContract = new LivelinessStake(envNetwork);
    const tx = liveContract.stakeRewards(new Address(mxAddress));
    tx.setGasLimit(60000000);

    await sendTransactions({
      transactions: [tx],
    });
  }

  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  return (
    <Flex flexDirection={{ base: "column", md: "row" }} width="100%" justifyContent="space-between" pt={{ base: "0", md: "5" }}>
      <Box flex="1" px={{ base: 0, md: 12 }}>
        <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200" mb="20px" textAlign={{ base: "center", md: "left" }}>
          Your Liveliness Rewards
        </Heading>

        <VStack border=".1rem solid" borderColor="#00C79740" borderRadius="3xl" p={6} alignItems={"start"} minW={{ md: "36rem" }} minH={{ md: "25rem" }}>
          {allInfoLoading ? (
            <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
              <Spinner size="md" color="teal.200" />
            </Flex>
          ) : (
            <>
              <Text fontSize="3xl">Combined Liveliness: {combinedLiveliness}%</Text>
              <Progress hasStripe isAnimated value={combinedLiveliness} rounded="xs" colorScheme="teal" width={"100%"} />
              <Text fontSize="xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked)} $ITHEUM</Text>
              <Text fontSize="xl">Global Total Bonded: {formatNumberToShort(globalTotalBond)} $ITHEUM</Text>
              <Text fontSize="xl">Current Staking APR: {isNaN(rewardApr) ? 0 : rewardApr}%</Text>
              {maxApr > 0 && <Text fontSize="xl">Max APR: {maxApr}%</Text>}
              <Text fontSize="xl">
                Current Accumulated Rewards:{" "}
                {formatNumberToShort(combinedLiveliness >= 95 ? accumulatedRewards : (combinedLiveliness * accumulatedRewards) / 100)} $ITHEUM
              </Text>
              <Text fontSize="xl">Potential Rewards If Combined Liveliness &gt;95%: {formatNumberToShort(accumulatedRewards)} $ITHEUM</Text>

              <HStack mt={5} justifyContent="center" alignItems="flex-start" width="100%">
                <Flex flexDirection={{ base: "column", md: "row" }}>
                  <VStack mb={{ base: 5, md: 0 }}>
                    <Tooltip
                      hasArrow
                      shouldWrapChildren
                      isDisabled={!(mxAddress === "" || hasPendingTransactions || accumulatedRewards < 1 || combinedLiveliness === 0)}
                      label={"Rewards claiming is disabled if liveliness is 0, rewards amount is lower than 1 or there are transactions pending"}>
                      <Button
                        fontSize="lg"
                        colorScheme="teal"
                        px={6}
                        width="180px"
                        onClick={() => {
                          if (combinedLiveliness >= 95) {
                            handleClaimRewardsClick();
                          } else {
                            setClaimRewardsConfirmationWorkflow(true);
                          }
                        }}
                        isDisabled={mxAddress === "" || hasPendingTransactions || accumulatedRewards < 1 || combinedLiveliness === 0}>
                        Claim Rewards
                      </Button>
                    </Tooltip>
                  </VStack>
                  <VStack>
                    <Tooltip
                      hasArrow
                      shouldWrapChildren
                      isDisabled={!(mxAddress === "" || hasPendingTransactions || nfmeId === undefined || accumulatedRewards < 1 || combinedLiveliness === 0)}
                      label={
                        "Rewards reinvesting is disabled if you have no NFT as a Primary NFMe ID, liveliness is 0, rewards amount is lower than 1 or there are transactions pending"
                      }>
                      <Button
                        fontSize="lg"
                        colorScheme="teal"
                        px={6}
                        width="180px"
                        isDisabled={mxAddress === "" || hasPendingTransactions || nfmeId === undefined || accumulatedRewards < 1 || combinedLiveliness === 0}
                        onClick={() => {
                          if (combinedLiveliness >= 95) {
                            handleReinvestRewardsClick();
                          } else {
                            setReinvestRewardsConfirmationWorkflow(true);
                          }
                        }}>
                        Reinvest Rewards
                      </Button>
                    </Tooltip>
                    <Text fontSize="sm" color="grey" ml={{ md: "55px" }}>
                      Reinvesting rewards will also renew bond
                    </Text>
                  </VStack>
                </Flex>
              </HStack>
            </>
          )}
        </VStack>
      </Box>

      <Box flex="1" px={{ base: 0, md: 12 }} mt={{ base: "30px", md: 0 }}>
        <>
          <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200" mb="20px" textAlign={{ base: "center", md: "left" }}>
            Your NFMe ID
          </Heading>
          <VStack border=".1rem solid" borderColor="#00C79740" borderRadius="3xl" p={6} alignItems={"start"} minW={{ md: "30rem" }} minH={{ md: "25rem" }}>
            {allInfoLoading ? (
              <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
                <Spinner size="md" color="teal.200" />
              </Flex>
            ) : (
              <>
                {nfmeId ? (
                  <>
                    <Flex flexDirection={{ base: "column", md: "row" }} width="100%">
                      <Box minW={{ md: "100px" }} mr={{ md: "5" }}>
                        <Image
                          w="100px"
                          h="100px"
                          m="auto"
                          borderRadius={"md"}
                          src={nfmeId.nftImgUrl}
                          onError={({ currentTarget }) => {
                            currentTarget.src = DEFAULT_NFT_IMAGE;
                          }}
                        />
                      </Box>
                      <VStack mt={{ base: "5", md: "auto" }}>
                        <LivelinessScore unbondTimestamp={nfmeIdBond?.unbondTimestamp} lockPeriod={nfmeIdBond?.lockPeriod} />
                        <Flex gap={4} pt={3} alignItems="center" w="100%">
                          <Button
                            colorScheme="teal"
                            px={6}
                            isDisabled={mxAddress === "" || hasPendingTransactions}
                            onClick={() => {
                              const bondContract = new BondContract(import.meta.env.VITE_ENV_NETWORK);
                              const tx = bondContract.renew(new Address(mxAddress), nfmeId.collection, nfmeId.nonce);
                              tx.setGasLimit(100000000);
                              sendTransactions({
                                transactions: [tx],
                              });
                            }}>
                            Renew Bond
                          </Button>
                          <Text fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(nfmeIdBond?.lockPeriod ?? 0)}`}</Text>
                        </Flex>
                        <Flex gap={4} pt={3} alignItems="center" w="100%">
                          <Flex flexDirection="column" gap={1}>
                            <Flex flexDirection="row" gap={4}>
                              <Text fontSize=".75rem" textColor="teal.200">
                                {formatNumberToShort(
                                  BigNumber(nfmeIdBond?.bondAmount ?? 0)
                                    .dividedBy(10 ** 18)
                                    .toNumber()
                                )}
                                &nbsp;$ITHEUM Bonded
                              </Text>
                              <Text fontSize=".75rem">|</Text>
                              <Text fontSize=".75rem" textColor="indianred">
                                {formatNumberToShort(
                                  BigNumber(nfmeIdBond?.bondAmount ?? 0)
                                    .minus(nfmeIdBond?.remainingAmount ?? 0)
                                    .dividedBy(10 ** 18)
                                    .toNumber()
                                )}
                                &nbsp;$ITHEUM Penalized
                              </Text>
                              <Text fontSize=".75rem">|</Text>
                              <Text fontSize=".75rem" textColor="#39bdf8">
                                {formatNumberToShort(
                                  BigNumber(nfmeIdBond?.remainingAmount ?? 0)
                                    .dividedBy(10 ** 18)
                                    .toNumber()
                                )}
                                &nbsp;$ITHEUM Remaining
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </VStack>
                    </Flex>
                    <Box h="1px" w="100%" borderStyle="solid" borderWidth="1px" borderColor="#00C79740" />
                    <HStack my={2} justifyContent="center" alignItems="flex-start" w="100%">
                      <VStack alignItems={"start"} w={"100%"}>
                        <Text fontSize="xl" alignItems={"flex-start"} fontFamily="Inter" color="teal.200" fontWeight="bold">
                          Top-Up Liveliness for Boosted Rewards
                        </Text>
                        <Text fontSize="lg">Available Balance: {formatNumberToShort(itheumBalance)} $ITHEUM</Text>
                        <Flex flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "normal", md: "baseline" }} minH="68px">
                          <Box>
                            <HStack my={2}>
                              <Text fontSize="lg" color={"grey"}>
                                Top-Up Liveliness
                              </Text>
                              <NumberInput
                                ml="3px"
                                size="sm"
                                maxW="24"
                                step={1}
                                defaultValue={1020}
                                min={0}
                                max={itheumBalance}
                                isValidCharacter={isValidNumericCharacter}
                                value={topUpItheumValue}
                                onChange={(value) => {
                                  setTopUpItheumValue(Number(value));

                                  const percentage = (combinedBondsStaked + Number(value)) / globalTotalBond;
                                  const localRewardsPerBlock = globalRewardsPerBlock * percentage;
                                  const blockPerYear = 31536000 / 6;
                                  const rewardPerYear = localRewardsPerBlock * blockPerYear;
                                  const calculatedRewardApr = Math.floor((rewardPerYear / combinedBondsStaked) * 10000) / 100;

                                  if (maxApr === 0 || calculatedRewardApr < maxApr) {
                                    setEstAnnualRewards(Math.floor(rewardPerYear));
                                  } else {
                                    setEstAnnualRewards(Math.floor(((combinedBondsStaked + Number(value)) * maxApr) / 100));
                                  }
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
                                size="sm"
                                variant="outline"
                                px={4}
                                isDisabled={mxAddress === "" || hasPendingTransactions}
                                onClick={() => {
                                  setTopUpItheumValue(Math.floor(itheumBalance));
                                  const percentage = (combinedBondsStaked + Math.floor(itheumBalance)) / globalTotalBond;
                                  const localRewardsPerBlock = globalRewardsPerBlock * percentage;
                                  const blockPerYear = 31536000 / 6;
                                  const rewardPerYear = localRewardsPerBlock * blockPerYear;
                                  const calculatedRewardApr = Math.floor((rewardPerYear / combinedBondsStaked) * 10000) / 100;

                                  if (maxApr === 0 || calculatedRewardApr < maxApr) {
                                    setEstAnnualRewards(Math.floor(rewardPerYear));
                                  } else {
                                    setEstAnnualRewards(Math.floor(((combinedBondsStaked + Math.floor(itheumBalance)) * maxApr) / 100));
                                  }
                                }}>
                                MAX
                              </Button>
                            </HStack>
                          </Box>
                          <Box textAlign={{ base: "right", md: "initial" }} ml="10px">
                            <Button
                              colorScheme="teal"
                              px={6}
                              size="sm"
                              isDisabled={mxAddress === "" || hasPendingTransactions || topUpItheumValue < 1}
                              onClick={() => {
                                const envNetwork = import.meta.env.VITE_ENV_NETWORK;
                                const bondContract = new BondContract(envNetwork);
                                const tx = bondContract.topUpVault(
                                  new Address(mxAddress),
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
                            <Text mt={2} fontSize="sm" color="grey">
                              Top-up will also renew bond
                            </Text>
                          </Box>
                        </Flex>
                        <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
                          Est. Annual Rewards: {formatNumberToShort(estAnnualRewards)} $ITHEUM
                        </Text>
                      </VStack>
                    </HStack>
                  </>
                ) : (
                  <Box w="90%" mt="10">
                    <Text fontWeight="bold">
                      You do not seem to have an Active NFMe ID yet. If you did, you can top-up bonus $ITHEUM tokens and earn extra staking rewards. You have a
                      few options:
                    </Text>

                    <Text fontSize="md" my="5">
                      1. Do you have other Data NFTs with an active Liveliness Bond? If so, you can set one of them as your NFMe ID by clicking on the{" "}
                      {"'Set as Primary NFMe ID'"} option below.
                    </Text>

                    <Text fontSize="md" my="5">
                      2. Mint your very own NFMe ID!
                    </Text>
                    <Button colorScheme="teal" borderRadius="12px" variant="outline" size="sm" onClick={() => navigate("/mintdata?launchTemplate=nfmeidvault")}>
                      <Text px={2}>Mint NFMe ID</Text>
                    </Button>
                  </Box>
                )}
              </>
            )}
          </VStack>
        </>
      </Box>

      {/* Confirmation Dialogs for actions that need explanation */}
      <>
        {/* Claim Rewards Dialog */}
        <ConfirmationDialog
          isOpen={claimRewardsConfirmationWorkflow}
          onCancel={() => {
            setClaimRewardsConfirmationWorkflow(false);
          }}
          onProceed={() => {
            handleClaimRewardsClick();
            setClaimRewardsConfirmationWorkflow(false);
          }}
          bodyContent={
            <>
              <Text mb="5">To get Max Accumulated Rewards, your Combined Liveliness must be over 95%. Yours is currently {combinedLiveliness}%</Text>
              <Text mt="5">To boost Combined Liveliness, renew the bond on each Data NFT before claiming</Text>
              <Text mt="5">Cancel to renew bonds first, or proceed if {`you're`} okay with lower rewards.</Text>
            </>
          }
          dialogData={{
            title: "Get Max Rewards if Combined Liveliness > 95%",
            proceedBtnTxt: "Proceed with Claim Rewards",
            cancelBtnText: "Cancel and Close",
          }}
        />

        {/* Reinvest Rewards Dialog */}
        <ConfirmationDialog
          isOpen={reinvestRewardsConfirmationWorkflow}
          onCancel={() => {
            setReinvestRewardsConfirmationWorkflow(false);
          }}
          onProceed={() => {
            handleReinvestRewardsClick();
            setReinvestRewardsConfirmationWorkflow(false);
          }}
          bodyContent={
            <>
              <Text mb="5">To reinvest Max Accumulated Rewards, your Combined Liveliness must be over 95%. Yours is currently {combinedLiveliness}%</Text>
              <Text mt="5">To boost Combined Liveliness, renew the bond on each Data NFT before reinvesting.</Text>
              <Text mt="5">Cancel to renew bonds first, or proceed if {`you're`} okay with lower rewards.</Text>
            </>
          }
          dialogData={{
            title: "Get Max Rewards if Combined Liveliness > 95%",
            proceedBtnTxt: "Proceed with Reinvest Rewards",
            cancelBtnText: "Cancel and Close",
          }}
        />
      </>
    </Flex>
  );
};
