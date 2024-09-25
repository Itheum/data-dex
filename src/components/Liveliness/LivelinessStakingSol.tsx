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
import { Program, BN } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Bond, DataNft } from "@itheum/sdk-mx-data-nft/out";

// import { CoreSolBondStakeSc } from "../target/types/core_sol_bond_stake_sc";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AccountMeta, PublicKey } from "@solana/web3.js";

import BigNumber from "bignumber.js";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { CoreSolBondStakeSc, IDL } from "libs/Solana/CoreSolBondStakeSc";
import { formatNumberToShort, isValidNumericCharacter } from "libs/utils";
import { useAccountStore } from "store";
import { LivelinessScore } from "./LivelinessScore";
import { set } from "@coral-xyz/anchor/dist/cjs/utils/features";
import { useNftsStore } from "store/nfts";
import { BONDING_PROGRAM_ID } from "libs/Solana/config";

interface LivelinessStakingSolProps {
  combinedLiveliness: number;
  combinedBondsStaked: number;
  rewardApr: number;
  maxApr: number;
  accumulatedRewards: number;
  globalTotalBond: number;
  globalRewardsPerBlock: number;
  nfmeId?: DataNft;
  nfmeIdBond?: Bond;
  topUpItheumValue: number;
  estAnnualRewards: number;
  allInfoLoading: boolean;
  claimRewardsConfirmationWorkflow: boolean;
  reinvestRewardsConfirmationWorkflow: boolean;
  handleClaimRewardsClick: () => void;
  handleReinvestRewardsClick: () => void;
  calculateNewPeriodAfterNewBond: (lockPeriod: number) => string;
  setClaimRewardsConfirmationWorkflow: (value: boolean) => void;
  setReinvestRewardsConfirmationWorkflow: (value: boolean) => void;
  setTopUpItheumValue: (value: number) => void;
}

// creez program - o data in cod , asta e o interfata
// si fac fetch la accountul de bondConfig
// fetch address sau construiesti
// initialize_address - daca nu are adresa
// fac bond
// fac si restul functiilor
// calculeaza liveliness ul , ca nu se updateaza automat

export const LivelinessStakingSol: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey: userPublicKey, wallet, signTransaction, sendTransaction } = useWallet();
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const [topUpItheumValue, setTopUpItheumValue] = useState<number>(0);
  const [estAnnualRewards, setEstAnnualRewards] = useState<number>(0);
  const navigate = useNavigate();

  const [combinedLiveliness, setCombinedLiveliness] = useState<number>(0);
  const [combinedBondsStaked, setCombinedBondsStaked] = useState<number>(0);
  const [rewardApr, setRewardApr] = useState<number>(0);
  const [maxApr, setMaxApr] = useState<number>(0);

  const [accumulatedRewards, setAccumulatedRewards] = useState<number>(0);
  const [globalTotalBond, setGlobalTotalBond] = useState<number>(0);
  const [globalRewardsPerBlock, setGlobalRewardsPerBlock] = useState<number>(0);

  const [withdrawPenalty, setWithdrawPenalty] = useState<number>(0);

  const [programSol, setProgramSol] = useState<Program<CoreSolBondStakeSc> | undefined>();
  const [bondConfigPda, setBondConfigPda] = useState<PublicKey | undefined>();
  const [addressBondsRewardsPda, setAddressBondsRewardsPda] = useState<PublicKey | undefined>();
  const [rewardsConfigPda, setRewardsConfigPda] = useState<PublicKey | undefined>();
  const [addressBondsRewardsData, setAddressBondsRewardsData] = useState<any>();
  const [bondConfigData, setBondConfigData] = useState<any>();
  const [rewardsConfigData, setRewardsConfigData] = useState<any>();

  const [vaultConfigPda, setVaultConfigPda] = useState<PublicKey | undefined>();
  const [bonds, setBonds] = useState<any[]>();
  const [allInfoLoading, setAllInfoLoading] = useState<boolean>(true);
  const [nftMeId, setNftMeId] = useState<any>();
  const [claimRewardsConfirmationWorkflow, setClaimRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [reinvestRewardsConfirmationWorkflow, setReinvestRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [nftMeIdBond, setNftMeIdBond] = useState<any>();
  const { solNfts } = useNftsStore();

  // console.log("solNfts", solNfts);

  useEffect(() => {
    if (bondConfigData && rewardsConfigData && addressBondsRewardsData) {
      setAllInfoLoading(false);
    }
  }, [bondConfigData, rewardsConfigData, addressBondsRewardsData]);

  useEffect(() => {
    const programId = new PublicKey(BONDING_PROGRAM_ID); ///TODO Set constatnt address sm
    const program = new Program<CoreSolBondStakeSc>(IDL, programId, {
      connection,
    });
    console.log("PROGRAM", program);
    setProgramSol(program);

    async function fetchBondConfigPdas() {
      const bondConfigPda1 = await PublicKey.findProgramAddressSync([Buffer.from("bond_config"), Buffer.from([1])], programId)[0];
      setBondConfigPda(bondConfigPda1);

      const _rewardsConfigPda = PublicKey.findProgramAddressSync([Buffer.from("rewards_config")], programId)[0];
      setRewardsConfigPda(_rewardsConfigPda);

      if (!userPublicKey) return;
      const _addressBondsRewardsPda = PublicKey.findProgramAddressSync([Buffer.from("address_bonds_rewards"), userPublicKey?.toBuffer()], programId)[0];
      setAddressBondsRewardsPda(_addressBondsRewardsPda);

      const vaultConfig = PublicKey.findProgramAddressSync([Buffer.from("vault_config")], programId)[0];
      setVaultConfigPda(vaultConfig);
    }

    fetchBondConfigPdas();
  }, []);

  useEffect(() => {
    async function fetchAccountInfo() {
      if (programSol && userPublicKey && addressBondsRewardsPda) {
        const accountInfo = await connection.getAccountInfo(addressBondsRewardsPda);
        const isExist = accountInfo !== null;
        if (!isExist) {
          await initializeAddress();
        } else {
          await programSol.account.addressBondsRewards.fetch(addressBondsRewardsPda).then((data: any) => {
            /// addressRewardsPerShare , addressTotalBondAmount,  claimableAmount , weightedLivelinessScore, lastUpdateTimestamp

            console.log("addressBondsRewardsDATAAAA", data);
            setAddressBondsRewardsData(data);
            setCombinedBondsStaked(new BigNumber(data.addressTotalBondAmount).dividedBy(10 ** 9).toNumber());
            setCombinedLiveliness(Math.floor(data.weightedLivelinessScore.toNumber() * 100) / 100);
            setAccumulatedRewards(Math.floor(new BigNumber(data.claimableAmount).dividedBy(10 ** 2).toNumber() * 100) / 100);
            // setGlobalTotalBond(new BigNumber(data.userData.totalStakedAmount).dividedBy(10 ** 2).toNumber());
            // console.log("time", data.lastUpdateTimestamp.toNumber());
            // console.log("pershare", data.addressRewardsPerShare.toNumber());
            // console.log("amount", data.addressTotalBondAmount.toNumber());
          });
          let bondIdd = -10;
          await programSol.account.addressBondsRewards.fetch(addressBondsRewardsPda).then((data: any) => {
            console.log("addressBondsRewards", data);
            const bondId = data.currentIndex + 1;
            bondIdd = bondId;
            // const amount = new BigNumber(data.bondConfig).dividedBy(10 ** 9);
            console.log("bondId", bondId);
            // console.log("amount", amount);
            return { bondId: bondId };
          });
          console.log("bondIdd", bondIdd);
        }
      }
    }
    // console.log("addressBondsRewards is happening", addressBondsRewardsPda);
    fetchAccountInfo();
    // console.log("finalized fetching");
  }, [addressBondsRewardsPda, programSol]);

  useEffect(() => {
    if (programSol && userPublicKey && rewardsConfigPda) {
      programSol?.account.rewardsConfig.fetch(rewardsConfigPda).then((data: any) => {
        setRewardsConfigData(data);

        setAccumulatedRewards(new BigNumber(data.accumulatedRewards.toNumber()).dividedBy(10 ** 2).toNumber());
        setGlobalRewardsPerBlock(new BigNumber(data.rewardsPerSlot.toNumber()).dividedBy(10 ** 2).toNumber());
        // rewardsPerShare, accumulatedRewards, lastRewardSlot,  rewardsPerSlot, rewardsReserve, rewardsPerShare, maxApr, rewardsState

        // setGlobalTotalBond(new BigNumber(data.rewardsReserve.toNumber()).dividedBy(10 ** 2).toNumber());
        // console.log("RESERVE", new BigNumber(data.rewardsReserve.toNumber()).dividedBy(10 ** 2).toNumber());

        // console.log("rewardsConfigData", data);
        setMaxApr(new BigNumber(data.maxApr.toNumber()).dividedBy(10 ** 2).toNumber());
      });
    }
  }, [rewardsConfigPda, programSol]);

  useEffect(() => {
    if (programSol && userPublicKey && bondConfigPda) {
      programSol?.account.bondConfig.fetch(bondConfigPda).then((data: any) => {
        /// bondAmount, bondState, lockPeriod, withdrawPenalty, merkleTree
        // console.log("bondConfigggggg", data);

        setBondConfigData(data);
        const lockPeriod = data.lockPeriod.toString();

        const bondAmount = new BigNumber(data.bondAmount.toNumber()).dividedBy(10 ** 2).toNumber();
        const withdrawPenalty = data.withdrawPenalty.toNumber().dividedBy(10 ** 2); // Convert to decimal
        setWithdrawPenalty(new BigNumber(data.withdrawPenalty.toNumber()).dividedBy(10 ** 2).toNumber());
        // console.log("lockPeriod", lockPeriod, data.lockPeriod.toString());
        // console.log("bondAmount", bondAmount);
        // console.log("withdrawPenalty", withdrawPenalty);
      });
    }
  }, [bondConfigPda, programSol]);

  useEffect(() => {
    if (programSol && userPublicKey && vaultConfigPda) {
      programSol?.account.vaultConfig.fetch(vaultConfigPda).then((data: any) => {
        /// totalBondAmoun, mintOfToken, totalPenalizedAmount, vault

        console.log("vault DATA", data);
        setGlobalTotalBond(BigNumber(data.totalBondAmount).dividedBy(10 ** 9));

        console.log("vaulltt", data.vault);
        console.log("globalTotalBond", new BigNumber(data.totalBondAmount.toNumber()).dividedBy(10 ** 2).toNumber());

        // setBondConfigData(data);
      });
    }
  }, [vaultConfigPda, programSol]);

  useEffect(() => {
    if (combinedBondsStaked === 0) setRewardApr(0);

    if (globalTotalBond > 0) {
      const percentage = combinedBondsStaked / globalTotalBond;
      const localRewardsPerBlock = globalRewardsPerBlock * percentage;
      // Solana: Approx. 0.4 seconds per block
      const blockPerYear = 31536000 / 0.4;
      const rewardPerYear = localRewardsPerBlock * blockPerYear;

      const calculatedRewardApr = Math.floor((rewardPerYear / combinedBondsStaked) * 10000) / 100;

      console.log("=======================");
      console.log("globalTotalBond :", globalTotalBond);
      console.log("calculatedRewardApr :", calculatedRewardApr);
      console.log("maxApr :", maxApr);
      console.log("=======================");

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

  async function initializeAddress() {
    try {
      // console.log("initializeAddress", programSol, userPublicKey, rewardsConfigPda, addressBondsRewardsPda);

      if (!programSol || !userPublicKey) return;

      // Build the transaction
      const transaction = await programSol.methods
        .initializeAddress()
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          rewardsConfig: rewardsConfigPda,
          authority: userPublicKey,
        })
        .transaction();

      // Step 4: Get the latest blockhash to include in the transaction
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = userPublicKey;
      const signedTransaction = await sendTransaction(transaction, connection);

      console.log("Transaction sent with signature:", signedTransaction);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }

  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };
  function decode(stuff: string) {
    return bufferToArray(bs58.decode(stuff));
  }

  function bufferToArray(buffer: Buffer): number[] {
    const nums: number[] = [];
    for (let i = 0; i < buffer.length; i++) {
      nums.push(buffer[i]);
    }
    return nums;
  }

  const mapProof = (proof: string[]): AccountMeta[] => {
    return proof.map((node) => ({
      pubkey: new PublicKey(node),
      isSigner: false,
      isWritable: false,
    }));
  };

  function handleClaimRewardsClick() {
    throw new Error("Function not implemented.");
  }

  function handleReinvestRewardsClick() {
    throw new Error("Function not implemented.");
  }

  function handleTopUpClick() {
    throw new Error("Function not implemented.");
  }

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
                      isDisabled={!(!userPublicKey || accumulatedRewards < 1 || combinedLiveliness === 0)}
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
                        isDisabled={!userPublicKey || accumulatedRewards < 1 || combinedLiveliness === 0}>
                        Claim Rewards
                      </Button>
                    </Tooltip>
                  </VStack>
                  <VStack>
                    <Tooltip
                      hasArrow
                      shouldWrapChildren
                      isDisabled={!(!userPublicKey || nftMeId === undefined || accumulatedRewards < 1 || combinedLiveliness === 0)}
                      label={
                        "Rewards reinvesting is disabled if you have no NFT as a Primary NFMe ID, liveliness is 0, rewards amount is lower than 1 or there are transactions pending"
                      }>
                      <Button
                        fontSize="lg"
                        colorScheme="teal"
                        px={6}
                        width="180px"
                        isDisabled={!userPublicKey || nftMeId === undefined || accumulatedRewards < 1 || combinedLiveliness === 0}
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
            Your NFMe ID Vault
          </Heading>
          <VStack border=".1rem solid" borderColor="#00C79740" borderRadius="3xl" p={6} alignItems={"start"} minW={{ md: "30rem" }} minH={{ md: "25rem" }}>
            {allInfoLoading ? (
              <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
                <Spinner size="md" color="teal.200" />
              </Flex>
            ) : (
              <>
                {nftMeId ? (
                  <>
                    <Flex flexDirection={{ base: "column", md: "row" }} width="100%">
                      <Box minW={{ md: "100px" }} mr={{ md: "5" }}>
                        <Image
                          w="100px"
                          h="100px"
                          m="auto"
                          borderRadius={"md"}
                          src={nftMeId.nftImgUrl}
                          onError={({ currentTarget }) => {
                            currentTarget.src = DEFAULT_NFT_IMAGE;
                          }}
                        />
                      </Box>
                      <VStack mt={{ base: "5", md: "auto" }}>
                        <LivelinessScore unbondTimestamp={nftMeIdBond?.unbondTimestamp} lockPeriod={nftMeId?.lockPeriod} />
                        <Flex gap={4} pt={3} alignItems="center" w="100%">
                          <Button
                            colorScheme="teal"
                            px={6}
                            isDisabled={!userPublicKey}
                            onClick={() => {
                              console.log("RENEW BOND");
                            }}>
                            Renew Bond
                          </Button>
                          <Text fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(nftMeIdBond?.lockPeriod ?? 0)}`}</Text>
                        </Flex>
                        <Flex gap={4} pt={3} alignItems="center" w="100%">
                          <Flex flexDirection="column" gap={1}>
                            <Flex flexDirection="row" gap={4}>
                              <Text fontSize=".75rem" textColor="teal.200">
                                {formatNumberToShort(
                                  BigNumber(nftMeIdBond?.bondAmount ?? 0)
                                    .dividedBy(10 ** 18)
                                    .toNumber()
                                )}
                                &nbsp;$ITHEUM Bonded
                              </Text>
                              <Text fontSize=".75rem">|</Text>
                              <Text fontSize=".75rem" textColor="indianred">
                                {formatNumberToShort(
                                  BigNumber(nftMeIdBond?.bondAmount ?? 0)
                                    .minus(nftMeIdBond?.remainingAmount ?? 0)
                                    .dividedBy(10 ** 18)
                                    .toNumber()
                                )}
                                &nbsp;$ITHEUM Penalized
                              </Text>
                              <Text fontSize=".75rem">|</Text>
                              <Text fontSize=".75rem" textColor="#39bdf8">
                                {formatNumberToShort(
                                  BigNumber(nftMeIdBond?.remainingAmount ?? 0)
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
                                isDisabled={!userPublicKey}
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
                              isDisabled={!userPublicKey || topUpItheumValue < 1}
                              onClick={() => {
                                handleTopUpClick(); ///TODO
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
                      You do not seem to have an Active NFMe ID Vault yet. If you did, you can top-up bonus $ITHEUM tokens and earn extra staking rewards. You
                      have a few options:
                    </Text>

                    <Text fontSize="md" my="5">
                      1. Do you have other Data NFTs with an active Liveliness Bond? If so, you can set one of them as your NFMe ID Vault by clicking on the{" "}
                      {"'Set as Primary NFMe ID'"} option below.
                    </Text>

                    <Text fontSize="md" my="5">
                      2. Mint your very own new NFMe ID Vault!
                    </Text>
                    <Button colorScheme="teal" borderRadius="12px" variant="outline" size="sm" onClick={() => navigate("/mintdata?launchTemplate=nfmeidvault")}>
                      <Text px={2}>Mint NFMe ID Vault</Text>
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
