import React, { useState, useEffect } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
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
  Card,
  useColorMode,
  UnorderedList,
  ListItem,
  useToast,
  Link,
} from "@chakra-ui/react";
import { Program, BN } from "@coral-xyz/anchor";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Commitment, PublicKey, Transaction, TransactionConfirmationStrategy } from "@solana/web3.js";
import NftMediaComponent from "components/NftMediaComponent";
import { NoDataHere } from "components/Sections/NoDataHere";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { useNetworkConfiguration } from "contexts/sol/SolNetworkConfigurationProvider";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { BOND_CONFIG_INDEX, BONDING_PROGRAM_ID, SOLANA_EXPLORER_URL } from "libs/Solana/config";
import { CoreSolBondStakeSc, IDL } from "libs/Solana/CoreSolBondStakeSc";
import { Bond } from "libs/Solana/types";
import { computeAddressClaimableAmount, computeBondScore, ITHEUM_TOKEN_ADDRESS, retrieveBondsAndNftMeIdVault, SLOTS_IN_YEAR } from "libs/Solana/utils";
import { formatNumberToShort, isValidNumericCharacter } from "libs/utils";
import { useAccountStore } from "store";
import { useNftsStore } from "store/nfts";
import { LivelinessScore } from "./LivelinessScore";

const BN10_9 = new BN(10 ** 9);

export const LivelinessStakingSol: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey: userPublicKey, sendTransaction } = useWallet();
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const [estCombinedAnnualRewards, setEstCombinedAnnualRewards] = useState<number>(0);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const [vaultLiveliness, setVaultLiveliness] = useState<number>(0);
  const [combinedBondsStaked, setCombinedBondsStaked] = useState<BN>(new BN(0));
  const [rewardApr, setRewardApr] = useState<number>(0);
  const [maxApr, setMaxApr] = useState<number>(0);
  const [addressClaimableAmount, setAddressClaimableAmount] = useState<number>(0);
  const [globalTotalBond, setGlobalTotalBond] = useState<BN>(new BN(0));
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
  const [bonds, setBonds] = useState<Bond[]>();
  const [allInfoLoading, setAllInfoLoading] = useState<boolean>(true);
  const [nftMeId, setNftMeId] = useState<DasApiAsset>();
  const [numberOfBonds, setNumberOfBonds] = useState<number>();
  const [vaultBondId, setVaultBondId] = useState<number>();
  const [vaultBondData, setVaultBondData] = useState<any>();
  const [claimRewardsConfirmationWorkflow, setClaimRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [reinvestRewardsConfirmationWorkflow, setReinvestRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [nftMeIdBond, setNftMeIdBond] = useState<Bond>();
  const { solNfts } = useNftsStore();
  const { colorMode } = useColorMode();
  const [claimableAmount, setClaimableAmount] = useState<number>(0);
  const [withdrawBondConfirmationWorkflow, setWithdrawBondConfirmationWorkflow] = useState<{ bondId: number; bondAmount: number; bondExpired: boolean }>();
  const toast = useToast();
  const [hasPendingTransaction, setHasPendingTransaction] = useState<boolean>(false);
  const { networkConfiguration } = useNetworkConfiguration();

  useEffect(() => {
    const programId = new PublicKey(BONDING_PROGRAM_ID);
    const program = new Program<CoreSolBondStakeSc>(IDL, programId, {
      connection,
    });

    setProgramSol(program);

    async function fetchBondConfigPDAs() {
      const bondConfigPda1 = PublicKey.findProgramAddressSync([Buffer.from("bond_config"), Buffer.from([BOND_CONFIG_INDEX])], programId)[0];
      setBondConfigPda(bondConfigPda1);

      const _rewardsConfigPda = PublicKey.findProgramAddressSync([Buffer.from("rewards_config")], programId)[0];
      setRewardsConfigPda(_rewardsConfigPda);

      const vaultConfig = PublicKey.findProgramAddressSync([Buffer.from("vault_config")], programId)[0];
      setVaultConfigPda(vaultConfig);

      if (!userPublicKey) return;
      const _addressBondsRewardsPda = PublicKey.findProgramAddressSync([Buffer.from("address_bonds_rewards"), userPublicKey?.toBuffer()], programId)[0];
      setAddressBondsRewardsPda(_addressBondsRewardsPda);
    }

    fetchBondConfigPDAs();
  }, []);

  // when a tx is happening we need to update the data
  useEffect(() => {
    if (!hasPendingTransaction) {
      fetchBonds();
      fetchAddressRewardsData();
      fetchVaultConfigData();
    }
  }, [hasPendingTransaction]);

  useEffect(() => {
    if (bondConfigData && rewardsConfigData && addressBondsRewardsData && globalTotalBond) {
      computeAndSetClaimableAmount();
    }
  }, [bondConfigData, rewardsConfigData, addressBondsRewardsData]);

  useEffect(() => {
    async function fetchAccountInfo() {
      if (programSol && userPublicKey && addressBondsRewardsPda) {
        const accountInfo = await connection.getAccountInfo(addressBondsRewardsPda);
        const isExist = accountInfo !== null;
        if (!isExist) {
          setAllInfoLoading(false);
        } else {
          fetchAddressRewardsData();
        }
      }
    }

    fetchAccountInfo();
  }, [addressBondsRewardsPda, programSol]);

  useEffect(() => {
    fetchBonds();
  }, [numberOfBonds]);

  useEffect(() => {
    if (nftMeIdBond && solNfts.length > 0 && userPublicKey) {
      const _nftMeId = solNfts.find((nft) => nft.id == nftMeIdBond.assetId.toString());

      if (_nftMeId === undefined) {
        console.error("NftMeID has not been found");
      }

      setNftMeId(_nftMeId);
      setAllInfoLoading(false);
    }
  }, [nftMeIdBond, solNfts]);

  useEffect(() => {
    fetchRewardsConfigData();
  }, [rewardsConfigPda, programSol]);

  useEffect(() => {
    if (programSol && userPublicKey && bondConfigPda) {
      programSol?.account.bondConfig.fetch(bondConfigPda).then((data: any) => {
        setBondConfigData(data);
        setWithdrawPenalty(new BN(data.withdrawPenalty).toNumber() / 100);
      });
    }
  }, [bondConfigPda, programSol]);

  useEffect(() => {
    fetchVaultConfigData();
  }, [vaultConfigPda, programSol]);

  useEffect(() => {
    calculateRewardAprAndEstAnnualRewards();
  }, [globalTotalBond, combinedBondsStaked, maxApr]);

  useEffect(() => {
    if (bondConfigData && vaultBondData) {
      const vaultScore = computeBondScore(bondConfigData.lockPeriod.toNumber(), Math.floor(Date.now() / 1000), vaultBondData.unbondTimestamp.toNumber());
      setVaultLiveliness(vaultScore);
    }
  }, [bondConfigData, vaultBondData]);

  async function fetchRewardsConfigData() {
    if (programSol && userPublicKey && rewardsConfigPda) {
      programSol.account.rewardsConfig.fetch(rewardsConfigPda).then((data: any) => {
        setRewardsConfigData(data);
        setGlobalRewardsPerBlock(data.rewardsPerSlot.toNumber());
        setMaxApr(data.maxApr.toNumber() / 100);
      });
    }
  }

  async function fetchVaultConfigData() {
    if (programSol && vaultConfigPda) {
      programSol.account.vaultConfig.fetch(vaultConfigPda).then((data: any) => {
        setGlobalTotalBond(data.totalBondAmount);
      });
    }
  }

  async function computeAndSetClaimableAmount() {
    const currentSLot = await connection.getSlot();

    const _claimableAmount = computeAddressClaimableAmount(
      new BN(currentSLot),
      rewardsConfigData,
      addressBondsRewardsData.addressRewardsPerShare,
      addressBondsRewardsData.addressTotalBondAmount,
      globalTotalBond
    );

    setClaimableAmount(_claimableAmount / 10 ** 9 + addressClaimableAmount);
  }

  async function fetchAddressRewardsData() {
    if (!programSol || !addressBondsRewardsPda) return;

    try {
      const data = await programSol.account.addressBondsRewards.fetch(addressBondsRewardsPda);
      setAddressBondsRewardsData(data);
      setCombinedBondsStaked(data.addressTotalBondAmount);
      setAddressClaimableAmount(data.claimableAmount.toNumber() / 10 ** 9);
      setNumberOfBonds(data.currentIndex);
      setVaultBondId(data.vaultBondId);

      if (data.vaultBondId != 0) {
        const vaultBond = await programSol!.account.bond.fetch(
          PublicKey.findProgramAddressSync(
            [Buffer.from("bond"), userPublicKey!.toBuffer(), new BN(data.vaultBondId).toBuffer("le", 2)],
            programSol.programId
          )[0]
        );
        setVaultBondData(vaultBond);
      }

      if (data.currentIndex === 0) setAllInfoLoading(false);
    } catch (error) {
      console.error("Failed to fetch address rewards data:", error);
    }
  }

  function calculateRewardAprAndEstAnnualRewards(value?: number, amount?: BN) {
    if (combinedBondsStaked.toNumber() === 0) {
      setRewardApr(0);
      return;
    }

    if (globalTotalBond.toNumber() > 0) {
      if (value) {
        value = value * 10 ** 9;
      } else {
        value = 0;
      }

      const amountToCompute = amount ? amount.add(new BN(value)) : combinedBondsStaked;
      const percentage: number = amountToCompute.toNumber() / globalTotalBond.toNumber();
      const localRewardsPerBlock: number = globalRewardsPerBlock * percentage;
      const rewardPerYear: number = localRewardsPerBlock * SLOTS_IN_YEAR;
      const calculatedRewardApr = Math.floor((rewardPerYear / amountToCompute.toNumber()) * 10000) / 100;

      if (!value) {
        if (maxApr === 0) {
          setRewardApr(calculatedRewardApr);
        } else {
          setRewardApr(Math.min(calculatedRewardApr, maxApr));
        }
      }

      if (maxApr === 0 || calculatedRewardApr < maxApr) {
        if (amount) {
          return rewardPerYear;
        }

        setEstCombinedAnnualRewards(rewardPerYear);
      } else {
        if (amount) {
          return (amountToCompute.toNumber() * maxApr) / 100;
        }

        setEstCombinedAnnualRewards((amountToCompute.toNumber() * maxApr) / 100);
      }
    }
  }

  async function fetchBonds() {
    if (numberOfBonds && userPublicKey && programSol) {
      retrieveBondsAndNftMeIdVault(userPublicKey, numberOfBonds, programSol).then(({ myBonds, nftMeIdVault, weightedLivelinessScore }) => {
        if (nftMeIdVault === undefined) {
          setAllInfoLoading(false);
        }

        setBonds(myBonds);
        setNftMeIdBond(nftMeIdVault);
      });
    }
  }

  async function sendAndConfirmTransaction({
    transaction,
    customErrorMessage = "Transaction failed",
  }: {
    transaction: Transaction;
    customErrorMessage?: string;
  }) {
    try {
      if (!userPublicKey) {
        throw new Error("Wallet not connected");
      }

      const latestBlockHash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockHash.blockhash;
      transaction.feePayer = userPublicKey;

      setHasPendingTransaction(true);

      const txSignature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        preflightCommitment: "finalized",
      });

      const strategy: TransactionConfirmationStrategy = {
        signature: txSignature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      };

      const confirmationPromise = connection.confirmTransaction(strategy, "finalized" as Commitment);

      toast.promise(
        confirmationPromise.then((response) => {
          if (response.value.err) {
            console.error("Transaction failed:", response.value);
            throw new Error(customErrorMessage);
          }
        }),
        {
          success: {
            title: "Transaction Confirmed",
            description: (
              <a
                href={`${SOLANA_EXPLORER_URL}/tx/${txSignature}?cluster=${networkConfiguration}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}>
                View on Solana explorer <ExternalLinkIcon margin={3} />
              </a>
            ),
            duration: 12000,
            isClosable: true,
          },
          error: {
            title: customErrorMessage,
            description: (
              <a
                href={`${SOLANA_EXPLORER_URL}/tx/${txSignature}?cluster=${networkConfiguration}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}>
                View on Solana explorer <ExternalLinkIcon margin={3} />
              </a>
            ),
            duration: 12000,
            isClosable: true,
          },
          loading: { title: "Processing Transaction", description: "Please wait...", colorScheme: "teal" },
        }
      );

      const result = await confirmationPromise;
      setHasPendingTransaction(false);

      if (result.value.err) {
        return false;
      }

      return txSignature;
    } catch (error) {
      // Show error toast
      setHasPendingTransaction(false);

      toast({
        title: "User rejected the request",
        description: (error as Error).message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      throw error;
    }
  }

  async function renewBondSol(bondId: number) {
    try {
      const bondIdPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey!.toBuffer(), new BN(bondId).toBuffer("le", 2)],
        programSol!.programId
      )[0];

      const transaction = await programSol!.methods
        .renew(BOND_CONFIG_INDEX, bondId)
        .accounts({
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          vaultConfig: vaultConfigPda,
          addressBondsRewards: addressBondsRewardsPda,
          bond: bondIdPda,
          authority: userPublicKey!,
        })
        .transaction();

      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to renew bond",
      });
    } catch (error) {
      console.error("Failed to renew bond:", error);
    }
  }

  async function updateVaultBond(bondId: number, nonce: number) {
    try {
      const bondIdPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey!.toBuffer(), new BN(bondId).toBuffer("le", 2)],
        programSol!.programId
      )[0];

      const transaction = await programSol!.methods
        .updateVaultBond(BOND_CONFIG_INDEX, bondId, new BN(nonce))
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          bond: bondIdPda,
          authority: userPublicKey!,
        })
        .transaction();

      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to update vault bond",
      });
    } catch (error) {
      console.error("Failed to update vault bond:", error);
    }
  }

  async function topUpBondSol(bondId: number, amount: number) {
    try {
      if (bondId === 0) {
        console.error("Bond not found, id is 0");
        return;
      }

      const bondIdPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey!.toBuffer(), new BN(bondId).toBuffer("le", 2)],
        programSol!.programId
      )[0];

      const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda!, true);
      const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey!, true);
      const amountToSend: BN = new BN(amount).mul(BN10_9);

      const transaction = await programSol!.methods
        .topUp(BOND_CONFIG_INDEX, bondId, amountToSend)
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          mintOfTokenSent: new PublicKey(ITHEUM_TOKEN_ADDRESS),
          bond: bondIdPda,
          vaultConfig: vaultConfigPda,
          vault: vaultAta,
          authority: userPublicKey!,
          authorityTokenAccount: userItheumAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .transaction();

      const result = await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to top-up bond",
      });

      if (result) updateItheumBalance(itheumBalance - amount);
    } catch (error) {
      console.error("Transaction to top-up bondfailed:", error);
    }
  }

  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  async function handleClaimRewardsClick(vault_bond_id: number) {
    try {
      if (!programSol || !userPublicKey) return;
      const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda!, true);
      const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey!, true);
      const bondPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey.toBuffer(), new BN(vault_bond_id).toBuffer("le", 2)],
        programSol.programId
      )[0];

      const transaction = await programSol.methods
        .claimRewards(BOND_CONFIG_INDEX, vault_bond_id)
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          mintOfTokenToReceive: new PublicKey(ITHEUM_TOKEN_ADDRESS),
          vaultConfig: vaultConfigPda,
          vault: vaultAta,
          bond: bondPda,
          authority: userPublicKey,
          authorityTokenAccount: userItheumAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .transaction();

      const result = await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to claim the rewards failed",
      });
      if (result) updateItheumBalance(itheumBalance + (vaultLiveliness >= 95 ? claimableAmount : (vaultLiveliness * claimableAmount) / 100));
    } catch (error) {
      console.error("Transaction ClaimingRewards  failed:", error);
    }
  }

  async function handleReinvestRewardsClick(vaultBondId: number) {
    try {
      if (!programSol || !userPublicKey || !nftMeIdBond) return;

      const bondIdPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey!.toBuffer(), new BN(vaultBondId).toBuffer("le", 2)],
        programSol!.programId
      )[0];

      const transaction = await programSol.methods
        .stakeRewards(BOND_CONFIG_INDEX, vaultBondId)
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          bond: bondIdPda,
          vaultConfig: vaultConfigPda,
          authority: userPublicKey,
        })
        .transaction();

      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to re-invest the rewards",
      });
    } catch (error) {
      console.error("Transaction Re-Investing failed:", error);
    }
  }

  async function handleWithdrawBondClick(bondId: number, bondAmountToReceive: number) {
    try {
      if (!programSol || !userPublicKey || bondId <= 0) return;

      const bondIdPda = PublicKey.findProgramAddressSync(
        [Buffer.from("bond"), userPublicKey.toBuffer(), new BN(bondId).toBuffer("le", 2)],
        programSol.programId
      )[0];
      const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda!, true);
      const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey!, true);

      const transaction = await programSol.methods
        .withdraw(BOND_CONFIG_INDEX, bondId)
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          mintOfTokenToReceive: new PublicKey(ITHEUM_TOKEN_ADDRESS),
          bond: bondIdPda,
          vaultConfig: vaultConfigPda,
          vault: vaultAta,
          authority: userPublicKey!,
          authorityTokenAccount: userItheumAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .transaction();
      const result = await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to withdraw the rewards",
      });
      if (result) updateItheumBalance(itheumBalance + bondAmountToReceive);
    } catch (error) {
      console.error("Transaction withdraw failed:", error);
    }
  }

  const TopUpSection: React.FC<{ bond: Bond }> = ({ bond }) => {
    const [currentBondEstAnnualRewards, setCurrentBondEstAnnualRewards] = useState<number>();
    const [topUpItheumValue, setTopUpItheumValue] = useState<number>(0);

    return (
      <HStack my={2} justifyContent="center" alignItems="flex-start" w="100%">
        <VStack alignItems={"start"} w={"100%"} justifyContent="space-between">
          <Text fontSize="xl" alignItems={"flex-start"} fontFamily="Inter" color="teal.200" fontWeight="bold">
            Top-Up Liveliness for Boosted Rewards
          </Text>
          <Text fontSize="lg">Available Balance: {formatNumberToShort(itheumBalance)} $ITHEUM</Text>
          <Flex justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "normal", md: "baseline" }} minH="68px">
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
                  min={0}
                  max={itheumBalance}
                  isValidCharacter={isValidNumericCharacter}
                  value={topUpItheumValue}
                  onChange={(value) => {
                    setTopUpItheumValue(Number(value));
                    const estRewards = calculateRewardAprAndEstAnnualRewards(Number(value), bond?.bondAmount);
                    setCurrentBondEstAnnualRewards(estRewards);
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
                    const estRewards = calculateRewardAprAndEstAnnualRewards(itheumBalance, bond?.bondAmount);
                    setCurrentBondEstAnnualRewards(estRewards);
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
                isDisabled={!userPublicKey || topUpItheumValue < 1 || hasPendingTransaction}
                onClick={() => {
                  topUpBondSol(bond?.bondId ?? 0, topUpItheumValue); // top up works only with the vault bond
                }}>
                Top-Up Now
              </Button>
              <Text mt={2} fontSize="sm" color="grey">
                Top-up will also renew bond
              </Text>
            </Box>
          </Flex>
          {currentBondEstAnnualRewards && (
            <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
              Est. Bond Annual Rewards: {formatNumberToShort(currentBondEstAnnualRewards / 10 ** 9)} $ITHEUM
            </Text>
          )}
        </VStack>
      </HStack>
    );
  };

  function checkIfBondIsExpired(unbondTimestamp: any) {
    return unbondTimestamp < Math.round(Date.now() / 1000);
  }

  const LivelinessContainer: React.FC<{ bond: Bond }> = ({ bond }) => {
    return (
      <VStack>
        <LivelinessScore unbondTimestamp={bond?.unbondTimestamp} lockPeriod={bondConfigData?.lockPeriod.toNumber()} />
        {/* REPLACE WITH LOGIC BELOW */}
        {bond.bondId == vaultBondId && <TopUpSection bond={bond} />}
      </VStack>
    );
  };

  return (
    <Flex flexDirection={"column"} width="100%">
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
                <Text fontSize="3xl">Vault Liveliness: {vaultLiveliness}% </Text>
                <Progress hasStripe isAnimated value={vaultLiveliness} rounded="base" colorScheme="teal" width={"100%"} />
                <Text fontSize="xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked.toNumber() / 10 ** 9)} $ITHEUM</Text>
                <Text fontSize="xl">Global Total Bonded: {formatNumberToShort(globalTotalBond.div(BN10_9).toNumber())} $ITHEUM</Text>
                <Text fontSize="xl">Current Staking APR: {isNaN(rewardApr) ? 0 : rewardApr}%</Text>
                {maxApr > 0 && <Text fontSize="xl">Max APR: {maxApr}%</Text>}
                <Text fontSize="xl">
                  Current Accumulated Rewards: {formatNumberToShort(vaultLiveliness >= 95 ? claimableAmount : (vaultLiveliness * claimableAmount) / 100)}{" "}
                  $ITHEUM
                </Text>
                <Text fontSize="xl">Potential Rewards If Combined Liveliness &gt;95%: {formatNumberToShort(claimableAmount)} $ITHEUM</Text>
                <HStack mt={5} justifyContent={{ base: "center", md: "start" }} alignItems="flex-start" width="100%">
                  <Flex flexDirection={{ base: "column", md: "row" }}>
                    <VStack mb={{ base: 5, md: 0 }}>
                      <Tooltip
                        hasArrow
                        shouldWrapChildren
                        isDisabled={!(!userPublicKey || claimableAmount < 1 || vaultLiveliness === 0)}
                        label={"Rewards claiming is disabled if liveliness is 0, rewards amount is lower than 1 or there are transactions pending"}>
                        <Button
                          fontSize="lg"
                          colorScheme="teal"
                          px={6}
                          width="180px"
                          onClick={() => {
                            if (
                              computeBondScore(bondConfigData.lockPeriod.toNumber(), Math.floor(Date.now() / 1000), vaultBondData.unbondTimestamp.toNumber())
                            ) {
                              handleClaimRewardsClick(vaultBondId!);
                            } else {
                              setClaimRewardsConfirmationWorkflow(true);
                            }
                          }}
                          isDisabled={!userPublicKey || claimableAmount < 1 || vaultLiveliness === 0 || hasPendingTransaction || vaultBondId == 0}>
                          Claim Rewards
                        </Button>
                      </Tooltip>
                    </VStack>
                    <VStack>
                      <Tooltip
                        hasArrow
                        shouldWrapChildren
                        isDisabled={!(!userPublicKey || nftMeId === undefined || claimableAmount < 1 || vaultLiveliness === 0)}
                        label={
                          "Rewards reinvesting is disabled if you have no NFT as a Primary NFMe ID, liveliness is 0, rewards amount is lower than 1 or there are transactions pending"
                        }>
                        <Button
                          fontSize="lg"
                          colorScheme="teal"
                          px={6}
                          width="180px"
                          isDisabled={
                            !userPublicKey || nftMeId === undefined || claimableAmount < 1 || vaultLiveliness === 0 || hasPendingTransaction || vaultBondId == 0
                          }
                          onClick={() => {
                            setReinvestRewardsConfirmationWorkflow(true);
                          }}>
                          Reinvest Rewards
                        </Button>
                      </Tooltip>
                      <Text fontSize="sm" color="grey" ml={{ md: "55px" }}>
                        Reinvesting rewards will also renew bond
                      </Text>
                    </VStack>
                  </Flex>{" "}
                </HStack>{" "}
                <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
                  Est. Cumulative Annual Rewards: {formatNumberToShort(estCombinedAnnualRewards / 10 ** 9)} $ITHEUM
                </Text>
              </>
            )}
          </VStack>
        </Box>
      </Flex>

      <Flex width="100%" flexWrap="wrap" gap={7} px={{ base: 0, md: 12 }} mt={10}>
        <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200" textAlign={{ base: "center", md: "left" }}>
          Your Data NFT Liveliness Bonds
        </Heading>

        {allInfoLoading ? (
          <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
            <Spinner size="md" color="teal.200" />
          </Flex>
        ) : !numberOfBonds ? (
          <NoDataHere imgFromTop="2" />
        ) : (
          bonds
            ?.slice()
            .sort((a, b) => {
              // Check if either bond has the specified vaultBondId and prioritize it as top 1
              // Replace with your actual vaultBondId variable
              if (a.bondId === vaultBondId) return -1; // `a` is prioritized to top if it matches vaultBondId
              if (b.bondId === vaultBondId) return 1; // `b` is prioritized if it matches vaultBondId

              // Sort by state, with bonds having state = 1 coming first
              if (a.state === 1 && b.state !== 1) return -1;
              if (b.state === 1 && a.state !== 1) return 1;

              // Otherwise, maintain the existing order
              return 0;
            })
            .map((currentBond, index) => {
              const dataNft = solNfts?.find((dataNft) => currentBond.assetId.toString() === dataNft.id);
              if (!dataNft) {
                return null;
              }

              const metadata = dataNft.content.metadata;
              return (
                <Card
                  _disabled={{ cursor: "not-allowed", opacity: "0.7" }}
                  key={index}
                  bg={colorMode === "dark" ? "#1b1b1b50" : "white"}
                  border=".1rem solid"
                  borderColor="#00C79740"
                  borderRadius="3xl"
                  p={5}
                  w="100%"
                  aria-disabled={currentBond.state === 0}>
                  <Flex gap={5} flexDirection={{ base: "column", md: "row" }}>
                    <Box minW="250px" textAlign="center" bgColor="1blue.900">
                      <Box>
                        <NftMediaComponent
                          imageUrls={[dataNft.content.links && dataNft.content.links["image"] ? (dataNft.content.links["image"] as string) : DEFAULT_NFT_IMAGE]}
                          imageHeight="160px"
                          imageWidth="160px"
                          borderRadius="10px"
                        />
                      </Box>
                      <Flex pt={3} flexDirection={"column"} alignItems="center" w="100%">
                        <Button
                          w={"100%"}
                          colorScheme="teal"
                          px={6}
                          isDisabled={currentBond.state == 0 || !userPublicKey || hasPendingTransaction}
                          onClick={() => {
                            renewBondSol(currentBond?.bondId ?? 0);
                          }}>
                          Renew Bond
                        </Button>
                        <Text mt={1} fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(bondConfigData?.lockPeriod.toNumber())}`}</Text>
                      </Flex>
                      <Flex gap={4} pt={3} flexDirection={"column"} w="100%" alignItems="center">
                        <Flex flexDirection={{ base: "column" }} gap={2} pt={3} alignItems="center" w="100%">
                          {!checkIfBondIsExpired(currentBond?.unbondTimestamp) ? (
                            <Button
                              w="100%"
                              colorScheme="red"
                              variant="outline"
                              textColor="indianred"
                              fontWeight="400"
                              isDisabled={currentBond.state == 0 || !userPublicKey || hasPendingTransaction}
                              onClick={() => {
                                setWithdrawBondConfirmationWorkflow({
                                  bondId: currentBond.bondId,
                                  bondAmount: currentBond.bondAmount.toNumber() / 10 ** 9,
                                  bondExpired: false,
                                });
                              }}>
                              Withdraw Bond
                            </Button>
                          ) : (
                            <Button
                              w="100%"
                              colorScheme="teal"
                              variant="outline"
                              textColor="teal.200"
                              fontWeight="400"
                              isDisabled={currentBond.state === 0 || hasPendingTransaction}
                              onClick={() => {
                                setWithdrawBondConfirmationWorkflow({
                                  bondId: currentBond.bondId,
                                  bondAmount: currentBond.bondAmount.toNumber() / 10 ** 9,
                                  bondExpired: true,
                                });
                              }}>
                              Withdraw Bond
                            </Button>
                          )}
                          <Text fontSize="1rem" textColor="teal.200">
                            {formatNumberToShort(new BN(currentBond?.bondAmount ?? 0).div(BN10_9).toNumber())}
                            &nbsp;$ITHEUM Bonded
                          </Text>
                          <Box>
                            {currentBond.bondId !== vaultBondId ? (
                              <Button
                                colorScheme="teal"
                                isDisabled={userPublicKey?.toBase58() === ""}
                                onClick={() => {
                                  updateVaultBond(currentBond.bondId, dataNft.compression.leaf_id);
                                }}>
                                Set as Primary NFMe ID
                              </Button>
                            ) : (
                              <Text fontSize="md" w="200px" m="auto">
                                ✅ Currently set as your Primary NFMe ID
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      </Flex>{" "}
                    </Box>
                    <Flex p={0} ml={{ md: "3" }} flexDirection="column" alignItems="start" w="full" bgColor="1green.900">
                      <Flex flexDirection="column" w="100%" bgColor="1pink.900">
                        <Text fontFamily="Clash-Medium">{metadata.name}</Text>
                        <Link isExternal href={`${SOLANA_EXPLORER_URL}address/${dataNft.id}?cluster=${networkConfiguration}`}>
                          <Text fontSize="lg" pb={3}>
                            {`Nft ID: ${dataNft.id.substring(0, 6)}...${dataNft.id.substring(dataNft.id.length - 6)}`}
                            <ExternalLinkIcon marginLeft={3} marginBottom={1} />
                          </Text>
                        </Link>
                        <Text fontSize="lg" pb={3}>
                          {`Bond ID: ${currentBond.bondId}`}
                        </Text>
                      </Flex>
                      {currentBond.state !== 0 && (
                        <Box w="100%" bgColor="1blue.800">
                          <LivelinessContainer bond={currentBond} />
                        </Box>
                      )}
                    </Flex>
                    {currentBond.state === 0 && (
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        bg={"rgba(202, 0, 0, 0.05)"}
                        zIndex="11"
                        opacity="0.9"
                        pointerEvents="none"
                        borderRadius="inherit"
                        display="flex"
                        alignItems="center"
                        justifyContent="center">
                        <Text fontSize="3xl" mt={2} fontWeight="bold" color="red.500">
                          Inactive
                        </Text>
                      </Box>
                    )}
                  </Flex>
                </Card>
              );
            })
        )}
      </Flex>

      {/* Confirmation Dialogs for actions that need explanation */}
      <>
        {/* Claim Rewards Dialog */}
        <ConfirmationDialog
          isOpen={claimRewardsConfirmationWorkflow}
          onCancel={() => {
            setClaimRewardsConfirmationWorkflow(false);
          }}
          onProceed={() => {
            handleClaimRewardsClick(addressBondsRewardsData.vaultBondId);
            setClaimRewardsConfirmationWorkflow(false);
          }}
          bodyContent={
            <>
              <Text mb="5">To get Max Accumulated Rewards, your Combined Liveliness must be over 95%. Yours is currently {vaultLiveliness}%</Text>
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
            handleReinvestRewardsClick(vaultBondId!);
            setReinvestRewardsConfirmationWorkflow(false);
          }}
          bodyContent={
            <>
              <Text fontWeight={"bold"} fontSize={"xl"} color={"teal.200"}>
                Info: The reinvested amount will be added to the latest active bond and will renew the bond.
              </Text>{" "}
              <Text mt={1} fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(bondConfigData?.lockPeriod.toNumber())}`}</Text>
              {vaultLiveliness <= 95 && (
                <>
                  <Text mb="3" fontWeight={"bold"} fontSize={"lg"} mt="7">
                    Get Max Rewards if Combined Liveliness {`>`} 95%
                  </Text>
                  <Text mb="5">To reinvest Max Accumulated Rewards, your Combined Liveliness must be over 95%. Yours is currently {vaultLiveliness}%</Text>
                  <Text mt="5">To boost Combined Liveliness, renew the bond on each Data NFT before reinvesting.</Text>
                  <Text mt="5">Cancel to renew bonds first, or proceed if {`you're`} okay with lower rewards.</Text>
                </>
              )}
            </>
          }
          dialogData={{
            title: "Reinvest Rewards",
            proceedBtnTxt: "Proceed with Reinvest Rewards",
            cancelBtnText: "Cancel and Close",
          }}
        />

        {/* Withdraw Bond Dialog */}
        <>
          <ConfirmationDialog
            isOpen={withdrawBondConfirmationWorkflow != undefined}
            onCancel={() => {
              setWithdrawBondConfirmationWorkflow(undefined);
            }}
            onProceed={() => {
              handleWithdrawBondClick(
                withdrawBondConfirmationWorkflow!.bondId!,
                withdrawBondConfirmationWorkflow!.bondAmount - (withdrawBondConfirmationWorkflow!.bondAmount * withdrawPenalty) / 100
              );
              setWithdrawBondConfirmationWorkflow(undefined);
            }}
            bodyContent={
              <>
                <Text fontSize="sm" pb={3} opacity=".8">
                  {`Collection: ${withdrawBondConfirmationWorkflow?.bondId},   Bond Amount: ${withdrawBondConfirmationWorkflow?.bondAmount}`}
                </Text>
                {(!withdrawBondConfirmationWorkflow?.bondExpired && (
                  <Text color="indianred" fontWeight="bold" fontSize="lg" pb={3} opacity="1">
                    {`Amount receivable after penalty: ${(
                      (withdrawBondConfirmationWorkflow?.bondAmount ?? 0) -
                      ((withdrawBondConfirmationWorkflow?.bondAmount ?? 0) * withdrawPenalty) / 100
                    ).toFixed(2)}`}
                  </Text>
                )) || (
                  <Text color="teal.200" fontWeight="bold" fontSize="lg" pb={3} opacity="1">
                    As your bond has expired, so you can withdraw without any penalty.
                  </Text>
                )}
                <Text mb="2">There are a few items to consider before you proceed with the bond withdraw:</Text>
                <UnorderedList p="2">
                  {!withdrawBondConfirmationWorkflow?.bondExpired && (
                    <ListItem>
                      Withdrawing before bond expiry incurs a penalty of{" "}
                      <Text as="span" fontSize="md" color="indianred">
                        {withdrawPenalty}%
                      </Text>
                      ; no penalty after expiry, and you get the full amount back.
                    </ListItem>
                  )}
                  {!withdrawBondConfirmationWorkflow?.bondExpired && <ListItem>Penalties are non-refundable.</ListItem>}
                  <ListItem>After withdrawal, your Liveliness score drops to zero, visible to buyers if your Data NFT is listed.</ListItem>
                  <ListItem>Once withdrawn, you {`can't `}re-bond to regain the Liveliness score or earn staking rewards on this Data NFT again.</ListItem>
                </UnorderedList>

                <Text mt="5">With the above in mind, are your SURE you want to proceed and Withdraw Bond?</Text>
              </>
            }
            dialogData={{
              title: "Are you sure you want to Withdraw Bond?",
              proceedBtnTxt: "Proceed with Withdraw Bond",
              cancelBtnText: "Cancel and Close",
              proceedBtnColorScheme: "red",
            }}
          />
        </>
      </>
    </Flex>
  );
};