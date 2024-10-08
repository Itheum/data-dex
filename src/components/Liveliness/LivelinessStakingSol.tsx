import React, { useState, useEffect } from "react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
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
  Card,
  useColorMode,
  UnorderedList,
  ListItem,
  useToast,
} from "@chakra-ui/react";
import { Program, BN } from "@coral-xyz/anchor";
import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Commitment, PublicKey, Transaction, TransactionConfirmationStrategy } from "@solana/web3.js";

import { useNavigate } from "react-router-dom";
import NftMediaComponent from "components/NftMediaComponent";
import { NoDataHere } from "components/Sections/NoDataHere";
import { ConfirmationDialog } from "components/UtilComps/ConfirmationDialog";
import { DEFAULT_NFT_IMAGE } from "libs/mxConstants";
import { BOND_CONFIG_INDEX, BONDING_PROGRAM_ID } from "libs/Solana/config";
import { CoreSolBondStakeSc, IDL } from "libs/Solana/CoreSolBondStakeSc";
import { Bond } from "libs/Solana/types";
import {
  computeAddressClaimableAmount,
  computeCurrentLivelinessScore,
  ITHEUM_TOKEN_ADDRESS,
  retrieveBondsAndNftMeIdVault,
  SLOTS_IN_YEAR,
} from "libs/Solana/utils";
import { formatNumberToShort, isValidNumericCharacter } from "libs/utils";
import { useAccountStore } from "store";
import { useNftsStore } from "store/nfts";
import { LivelinessScore } from "./LivelinessScore";

const BN10_9 = new BN(10 ** 9);
const BN10_2 = new BN(10 ** 2);

export const LivelinessStakingSol: React.FC = () => {
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey: userPublicKey, sendTransaction } = useWallet();
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const [estCombinedAnnualRewards, setEstCombinedAnnualRewards] = useState<number>(0);
  const updateItheumBalance = useAccountStore((state) => state.updateItheumBalance);
  const [combinedLiveliness, setCombinedLiveliness] = useState<number>(0);
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
  const [claimRewardsConfirmationWorkflow, setClaimRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [reinvestRewardsConfirmationWorkflow, setReinvestRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [nftMeIdBond, setNftMeIdBond] = useState<Bond>();
  const { solNfts } = useNftsStore();
  const { colorMode } = useColorMode();
  const [claimableAmount, setClaimableAmount] = useState<number>(0);
  const [withdrawBondConfirmationWorkflow, setWithdrawBondConfirmationWorkflow] = useState<{ bondId: number; bondAmount: number }>();
  const toast = useToast();
  const [currentLiveLinessScoreLIVE, setCurrentLiveLinessScoreLIVE] = useState<number>(0);
  const [hasPendingTransaction, setHasPendingTransaction] = useState<boolean>(false);

  useEffect(() => {
    if (bondConfigData && rewardsConfigData && addressBondsRewardsData && globalTotalBond && !hasPendingTransaction) {
      const newCombinedLiveliness =
        Math.floor(
          computeCurrentLivelinessScore(
            addressBondsRewardsData.lastUpdateTimestamp.toNumber(),
            bondConfigData.lockPeriod.toNumber(),
            addressBondsRewardsData.weightedLivelinessScore.toNumber()
          )
        ) / 100;
      setCombinedLiveliness(newCombinedLiveliness > 0 ? newCombinedLiveliness : 0);
      computeAndSetClaimableAmount();
    }
  }, [bondConfigData, rewardsConfigData, addressBondsRewardsData, hasPendingTransaction]);

  ///todo set a useEffect to update the claimable amount  newCombinedLiveliness at the start
  async function computeAndSetClaimableAmount() {
    const currentSLot = await connection.getSlot();

    const _claimableAmount = computeAddressClaimableAmount(
      new BN(currentSLot),
      rewardsConfigData,
      addressBondsRewardsData.addressRewardsPerShare,
      addressBondsRewardsData.addressTotalBondAmount,
      globalTotalBond
    );
    // console.log("Rewards MAXX ", claimableAmount, "claimableAmount OF THE USERRRRRR", addressClaimableAmount);
    setClaimableAmount(_claimableAmount / 10 ** 9 + addressClaimableAmount);
  }

  useEffect(() => {
    const programId = new PublicKey(BONDING_PROGRAM_ID);
    const program = new Program<CoreSolBondStakeSc>(IDL, programId, {
      connection,
    });

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
    ///TODO handle the case when a loop happens bcs of hasPendingTransaction when user has no account
    async function fetchAccountInfo() {
      if (programSol && userPublicKey && addressBondsRewardsPda && !hasPendingTransaction) {
        const accountInfo = await connection.getAccountInfo(addressBondsRewardsPda);
        const isExist = accountInfo !== null;
        if (!isExist) {
          await initializeAddress();
        } else {
          await programSol.account.addressBondsRewards.fetch(addressBondsRewardsPda).then((data: any) => {
            /// addressRewardsPerShare , addressTotalBondAmount,  claimableAmount , weightedLivelinessScore, lastUpdateTimestamp
            setAddressBondsRewardsData(data);
            setCombinedBondsStaked(data.addressTotalBondAmount);
            setCombinedLiveliness(data.weightedLivelinessScore.toNumber() / 100);
            setAddressClaimableAmount(data.claimableAmount.toNumber() / 10 ** 9);
            setNumberOfBonds(data.currentIndex);
          });
        }
      }
    }
    fetchAccountInfo(); ///TODO check if this is correct as if we go and initializeAddress does it come back here ?
  }, [addressBondsRewardsPda, programSol, hasPendingTransaction]);

  useEffect(() => {
    async function fetchBonds() {
      if (numberOfBonds && userPublicKey && programSol && !hasPendingTransaction) {
        retrieveBondsAndNftMeIdVault(userPublicKey, numberOfBonds, programSol).then(({ bonds, nftMeIdVault, weightedLivelinessScore }) => {
          if (nftMeIdVault === undefined) {
            setAllInfoLoading(false);
          }
          setBonds(bonds);
          setNftMeIdBond(nftMeIdVault);
          setCurrentLiveLinessScoreLIVE(weightedLivelinessScore);
        });
      }
    }
    fetchBonds(); ///todo check if when hasPendingTransaction is true this should be called too ?
  }, [numberOfBonds, hasPendingTransaction]);

  useEffect(() => {
    if (nftMeIdBond && solNfts && userPublicKey) {
      calculateRewardAprAndEstAnnualRewards(0, nftMeIdBond.bondAmount);
      const nftMeId = solNfts.find((nft) => nft.id == nftMeIdBond.assetId.toString());
      setNftMeId(nftMeId);
      setAllInfoLoading(false); ///TODO what if nftMeId is not found
    }
  }, [nftMeIdBond]); ///TODO do I still need this one ?

  // rewardsPerShare, accumulatedRewards, lastRewardSlot,  rewardsPerSlot, rewardsReserve, rewardsPerShare, maxApr, rewardsState
  useEffect(() => {
    if (programSol && userPublicKey && rewardsConfigPda && !hasPendingTransaction) {
      programSol?.account.rewardsConfig.fetch(rewardsConfigPda).then((data: any) => {
        setRewardsConfigData(data);
        setGlobalRewardsPerBlock(data.rewardsPerSlot.toNumber());
        setMaxApr(new BN(data.maxApr).div(BN10_2).toNumber());
      });
    }
  }, [rewardsConfigPda, programSol, hasPendingTransaction]);

  /// bondAmount, bondState, lockPeriod, withdrawPenalty, merkleTree
  useEffect(() => {
    if (programSol && userPublicKey && bondConfigPda) {
      programSol?.account.bondConfig.fetch(bondConfigPda).then((data: any) => {
        setBondConfigData(data);
        setWithdrawPenalty(new BN(data.withdrawPenalty).toNumber() / 100);
      });
    }
  }, [bondConfigPda, programSol]);

  /// totalBondAmoun, mintOfToken, totalPenalizedAmount, vault
  useEffect(() => {
    if (programSol && userPublicKey && vaultConfigPda) {
      programSol?.account.vaultConfig.fetch(vaultConfigPda).then((data: any) => {
        setGlobalTotalBond(data.totalBondAmount);
        ///TODO should I take the mint of TOkken from here? ?
      });
    }
  }, [vaultConfigPda, programSol]);

  useEffect(() => {
    if (!hasPendingTransaction) calculateRewardAprAndEstAnnualRewards();
  }, [globalTotalBond, combinedBondsStaked, maxApr, hasPendingTransaction]);

  function calculateRewardAprAndEstAnnualRewards(value?: number, amount?: BN) {
    if (combinedBondsStaked.toNumber() === 0) {
      setRewardApr(0);
      return;
    }

    if (globalTotalBond.toNumber() > 0) {
      ///todo bond Amount + value
      // console.log(value, amount);
      if (value) value = value * 10 ** 9;
      else value = 0;
      const amountToCompute = amount ? amount.add(new BN(value)) : combinedBondsStaked.add(new BN(value));
      const percentage: number = amountToCompute.toNumber() / globalTotalBond.toNumber();
      const localRewardsPerBlock: number = globalRewardsPerBlock * percentage;
      // Solana: Approx. 0.4 seconds per  slot
      const rewardPerYear: number = localRewardsPerBlock * SLOTS_IN_YEAR;
      const calculatedRewardApr = Math.floor((rewardPerYear / amountToCompute.toNumber()) * 10000) / 100; ///* 10000) / 100;
      if (!value) {
        if (maxApr === 0) {
          setRewardApr(calculatedRewardApr);
        } else {
          setRewardApr(Math.min(calculatedRewardApr, maxApr));
        }
      }

      if (maxApr === 0 || calculatedRewardApr < maxApr) {
        if (amount && value) {
          return rewardPerYear;
        }
        setEstCombinedAnnualRewards(rewardPerYear);
      } else {
        if (amount && value) {
          return (amountToCompute.toNumber() * maxApr) / 100;
        }
        setEstCombinedAnnualRewards((amountToCompute.toNumber() * maxApr) / 100);
      }
    }
  }

  // function calculateRewardAprAndEstAnnualRewards(amount?: number, value?: number) {
  //   if (combinedBondsStaked.toNumber() === 0) {
  //     setRewardApr(0);
  //     return;
  //   }

  //   if (globalTotalBond.toNumber() > 0) {
  //     ///todo bond Amount + value
  //     const amountToCompute = amount ? new BN(amount + (value ? value : 0)) : combinedBondsStaked.add(new BN(value ? value : 0));
  //     const percentage: BN = amountToCompute.mul(new BN(10 ** 4)).div(globalTotalBond);
  //     console.log("percentage", percentage, percentage.toNumber());
  //     // console.log("globalRewardsPerBlock", globalRewardsPerBlock);
  //     const localRewardsPerBlock: BN = percentage.mul(new BN(globalRewardsPerBlock)); ///1000 / 10 ** 9
  //     // Solana: Approx. 0.4 seconds per block or slot
  //     const blockPerYear = new BN(SLOTS_IN_YEAR);
  //     console.log("REWARDS PER BLOCK", localRewardsPerBlock);
  //     const rewardPerYear: BN = localRewardsPerBlock.mul(blockPerYear).div(new BN(10 ** 4));
  //     console.log("REWARDS YEAR", rewardPerYear);
  //     const calculatedRewardApr = rewardPerYear.div(amountToCompute).mul(new BN(10000)).div(BN10_2).toNumber();
  //     if (!value) {
  //       if (maxApr === 0) {
  //         setRewardApr(calculatedRewardApr);
  //       } else {
  //         setRewardApr(Math.min(calculatedRewardApr, maxApr));
  //       }
  //     }
  //     console.log("calculatedRewardApr", calculatedRewardApr);
  //     if (maxApr === 0 || calculatedRewardApr < maxApr) {
  //       setEstAnnualRewards(rewardPerYear);
  //     } else {
  //       setEstAnnualRewards(amountToCompute.mul(new BN(maxApr)));
  //     }
  //   }
  // }
  async function sendAndConfirmTransaction({
    transaction,
    customErrorMessage = "Transaction failed",
    explorerLinkMessage = "View transaction on Solana Explorer",
  }: {
    transaction: Transaction;
    customErrorMessage?: string;
    explorerLinkMessage?: string;
  }) {
    try {
      if (!userPublicKey) {
        throw new Error("Wallet not connected");
      }
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = userPublicKey;
      setHasPendingTransaction(true);
      const txSignature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        preflightCommitment: "finalized",
      });

      const strategy: TransactionConfirmationStrategy = {
        signature: txSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };
      const cluster = import.meta.env.VITE_ENV_NETWORK === "mainnet" ? "mainnet-beta" : import.meta.env.VITE_ENV_NETWORK;

      const confirmationPromise = connection.confirmTransaction(strategy, "finalized" as Commitment);
      ///todo look more into this ...
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
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`}
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
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}>
                View on Solana explorer <ExternalLinkIcon margin={3} />
              </a>
            ),
            duration: 12000,
            isClosable: true,
          },
          loading: { title: "Processing Transaction", description: "Please wait..." },
        }
      );
      const result = await confirmationPromise;
      const toastStatus = result.value.err ? "info" : "success";
      setHasPendingTransaction(false);

      // Show success toast with link to Explorer SOLANA
      // toast({
      //   title: explorerLinkMessage,
      //   description: (
      //     <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
      //       {txSignature.slice(0, 11)}...{txSignature.slice(-11)} <ExternalLinkIcon margin={3} />
      //     </a>
      //   ),
      //   status: toastStatus,
      //   duration: 12000,
      //   isClosable: true,
      // });

      if (result.value.err) {
        return false;
      }

      // console.log("Transaction confirmed:", result, txSignature);
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
      const bondIdPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey!.toBuffer(), Buffer.from([bondId])], programSol!.programId)[0];

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

      const txSignature = await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to renew bond",
      });

      console.log("Bond renewal transaction sent:", txSignature);
    } catch (error) {
      console.error("Failed to renew bond:", error);
    }
  }

  async function topUpBondSol(bondId: number, amount: number) {
    try {
      if (bondId === 0) {
        console.error("Bond not found, id is 0");
        return;
      }
      const bondIdPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey!.toBuffer(), Buffer.from([bondId])], programSol!.programId)[0];
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
      console.log("result", result);
      if (result) updateItheumBalance(itheumBalance - amount);
    } catch (error) {
      console.error("Transaction to top-up bondfailed:", error);
    }
  }

  async function initializeAddress() {
    try {
      if (!programSol || !userPublicKey) return;

      const transaction = await programSol.methods
        .initializeAddress()
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          rewardsConfig: rewardsConfigPda,
          authority: userPublicKey,
        })
        .transaction();
      const txSignature = await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Initialization of the rewards account failed",
      });
      if (!txSignature) {
        toast({
          title: "Initialization of the rewards account failed",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        navigate("/datanfts/wallet");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }
  const calculateNewPeriodAfterNewBond = (lockPeriod: number) => {
    const nowTSInSec = Math.round(Date.now() / 1000);
    const newExpiry = new Date((nowTSInSec + lockPeriod) * 1000);
    return newExpiry.toDateString();
  };

  async function handleClaimRewardsClick() {
    try {
      if (!programSol || !userPublicKey) return;
      const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda!, true);
      const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey!, true);
      const transaction = await programSol.methods
        .claimRewards(BOND_CONFIG_INDEX)
        .accounts({
          addressBondsRewards: addressBondsRewardsPda,
          bondConfig: bondConfigPda,
          rewardsConfig: rewardsConfigPda,
          mintOfTokenToReceive: new PublicKey(ITHEUM_TOKEN_ADDRESS),
          vaultConfig: vaultConfigPda,
          vault: vaultAta,
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
      if (result) updateItheumBalance(itheumBalance + (combinedLiveliness >= 95 ? claimableAmount : (combinedLiveliness * claimableAmount) / 100));
    } catch (error) {
      console.error("Transaction ClaimingRewards  failed:", error);
    }
  }

  async function handleReinvestRewardsClick() {
    try {
      if (!programSol || !userPublicKey || !nftMeIdBond) return;
      const bondId = nftMeIdBond.bondId;
      const bondIdPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey!.toBuffer(), Buffer.from([bondId])], programSol!.programId)[0];

      const transaction = await programSol.methods
        .stakeRewards(BOND_CONFIG_INDEX, nftMeIdBond.bondId)
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

      const bondIdPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey.toBuffer(), Buffer.from([bondId])], programSol.programId)[0];
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
      console.log("result", result);
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
                    console.log("estRewards", estRewards);

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
                  topUpBondSol(bond?.bondId ?? 0, topUpItheumValue);
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
        <TopUpSection bond={bond} />
      </VStack>
    );
  };
  ///TODO CHECK case if user withdraw the nftmeIdBond (last one) and then reinvest the rewards
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
                <Text fontSize="3xl">Combined Liveliness: {combinedLiveliness}% </Text>
                <Text>
                  {" "}
                  LIVE:{currentLiveLinessScoreLIVE} --- diff:{combinedLiveliness - currentLiveLinessScoreLIVE}
                </Text>
                <Progress hasStripe isAnimated value={combinedLiveliness} rounded="base" colorScheme="teal" width={"100%"} />
                <Text fontSize="xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked.toNumber() / 10 ** 9)} $ITHEUM</Text>
                <Text fontSize="xl">Global Total Bonded: {formatNumberToShort(globalTotalBond.div(BN10_9).toNumber())} $ITHEUM</Text>
                <Text fontSize="xl">Current Staking APR: {isNaN(rewardApr) ? 0 : rewardApr}%</Text>
                {maxApr > 0 && <Text fontSize="xl">Max APR: {maxApr}%</Text>}
                <Text fontSize="xl">
                  Current Accumulated Rewards: {formatNumberToShort(combinedLiveliness >= 95 ? claimableAmount : (combinedLiveliness * claimableAmount) / 100)}{" "}
                  $ITHEUM
                </Text>
                <Text fontSize="xl">Potential Rewards If Combined Liveliness &gt;95%: {formatNumberToShort(claimableAmount)} $ITHEUM</Text>
                <HStack mt={5} justifyContent="center" alignItems="flex-start" width="100%">
                  <Flex flexDirection={{ base: "column", md: "row" }}>
                    <VStack mb={{ base: 5, md: 0 }}>
                      <Tooltip
                        hasArrow
                        shouldWrapChildren
                        isDisabled={!(!userPublicKey || claimableAmount < 1 || combinedLiveliness === 0)}
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
                          isDisabled={!userPublicKey || claimableAmount < 1 || combinedLiveliness === 0 || hasPendingTransaction}>
                          Claim Rewards
                        </Button>
                      </Tooltip>
                    </VStack>
                    <VStack>
                      <Tooltip
                        hasArrow
                        shouldWrapChildren
                        isDisabled={!(!userPublicKey || nftMeId === undefined || claimableAmount < 1 || combinedLiveliness === 0)}
                        label={
                          "Rewards reinvesting is disabled if you have no NFT as a Primary NFMe ID, liveliness is 0, rewards amount is lower than 1 or there are transactions pending"
                        }>
                        <Button
                          fontSize="lg"
                          colorScheme="teal"
                          px={6}
                          width="180px"
                          isDisabled={!userPublicKey || nftMeIdBond === undefined || claimableAmount < 1 || combinedLiveliness === 0 || hasPendingTransaction}
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
                  </Flex>{" "}
                </HStack>{" "}
                <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
                  Est. Cummulative Annual Rewards: {formatNumberToShort(estCombinedAnnualRewards / 10 ** 9)} $ITHEUM
                </Text>
              </>
            )}
          </VStack>
        </Box>
        {/* <Box flex="1" px={{ base: 0, md: 12 }} mt={{ base: "30px", md: 0 }}>
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
                            src={(nftMeId.content.links["image"] as string) ?? DEFAULT_NFT_IMAGE}
                            onError={({ currentTarget }) => {
                              currentTarget.src = DEFAULT_NFT_IMAGE;
                            }}
                          />
                        </Box>
                        <LivelinessContainer bond={nftMeIdBond!} />
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
                                    calculateRewardAprAndEstAnnualRewards(Number(value), nftMeIdBond?.bondAmount);
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
                                    calculateRewardAprAndEstAnnualRewards(itheumBalance, nftMeIdBond?.bondAmount);
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
                                  topUpBondSol(nftMeIdBond?.bondId ?? 0);
                                }}>
                                Top-Up Now
                              </Button>
                              <Text mt={2} fontSize="sm" color="grey">
                                Top-up will also renew bond
                              </Text>
                            </Box>
                          </Flex>
                          <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
                            Est. Bond Annual Rewards: {formatNumberToShort(estAnnualRewards / 10 ** 9)} $ITHEUM
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
                      <Button
                        colorScheme="teal"
                        borderRadius="12px"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/mintdata?launchTemplate=nfmeidvault")}>
                        <Text px={2}>Mint NFMe ID Vault</Text>
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </>
        </Box>{" "} */}
      </Flex>

      <Flex width="100%" flexWrap="wrap" gap={7} px={{ base: 0, md: 12 }} mt={10}>
        <Heading fontSize="1.5rem" fontFamily="Clash-Medium" color="teal.200" textAlign={{ base: "center", md: "left" }}>
          Your Data NFT Liveliness Bonds
        </Heading>

        {/* {errDataNFTStreamGeneric && (
          <Alert status="error">
            <Stack>
              <AlertTitle fontSize="md">
                <AlertIcon mb={2} />
                Error
              </AlertTitle>
              {errDataNFTStreamGeneric.message && <AlertDescription fontSize="md">{errDataNFTStreamGeneric.message}</AlertDescription>}
            </Stack>
          </Alert>
        )} */}

        {allInfoLoading ? (
          <Flex w="100%" h="20rem" justifyContent="center" alignItems="center">
            <Spinner size="md" color="teal.200" />
          </Flex>
        ) : bonds?.length === 0 ? (
          <NoDataHere imgFromTop="2" />
        ) : (
          bonds?.map((currentBond, index) => {
            const dataNft = solNfts?.find((dataNft) => currentBond.assetId.toString() === dataNft.id);
            if (!dataNft) return null;
            const metadata = dataNft.content.metadata;
            // console.log("currentBond data nft", index, currentBond, dataNft);
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
                <Flex flexDirection={{ base: "column", md: "row" }}>
                  <Box minW="250px" textAlign="center">
                    <Box>
                      <NftMediaComponent
                        imageUrls={[dataNft.content.links && dataNft.content.links["image"] ? (dataNft.content.links["image"] as string) : DEFAULT_NFT_IMAGE]}
                        imageHeight="160px"
                        imageWidth="160px"
                        borderRadius="10px"
                      />
                    </Box>
                    <Flex gap={4} pt={3} flexDirection={"column"} alignItems="start" w="100%">
                      <Button
                        w={"100%"}
                        colorScheme="teal"
                        px={6}
                        isDisabled={!userPublicKey || hasPendingTransaction}
                        onClick={() => {
                          renewBondSol(currentBond?.bondId ?? 0);
                        }}>
                        Renew Bond
                      </Button>
                      <Text fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(bondConfigData?.lockPeriod.toNumber())}`}</Text>
                    </Flex>
                    <Flex gap={4} pt={3} flexDirection={"column"} w="100%" alignItems="center">
                      <Flex flexDirection={{ base: "column" }} gap={4} pt={3} alignItems="center" w="100%">
                        {!checkIfBondIsExpired(currentBond?.unbondTimestamp) ? (
                          <Button
                            w="100%"
                            colorScheme="red"
                            variant="outline"
                            textColor="indianred"
                            fontWeight="400"
                            isDisabled={currentBond.state === 0 || hasPendingTransaction}
                            onClick={() => {
                              setWithdrawBondConfirmationWorkflow({
                                bondId: currentBond.bondId,
                                bondAmount: ((currentBond.bondAmount.toNumber() / 10 ** 9) * withdrawPenalty) / 100,
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
                              handleWithdrawBondClick(currentBond.bondId, currentBond.bondAmount.toNumber() / 10 ** 9);
                            }}>
                            Withdraw Bond
                          </Button>
                        )}
                        <Text fontSize="1rem" textColor="teal.200">
                          {formatNumberToShort(new BN(currentBond?.bondAmount ?? 0).div(BN10_9).toNumber())}
                          &nbsp;$ITHEUM Bonded
                        </Text>
                      </Flex>
                    </Flex>{" "}
                    {/* <Box>
                      {nftMeIdBond?.assetId.toString() !== dataNft.id.toString() ? (
                        // <Button
                        //   colorScheme="teal"
                        //   isDisabled={!userPublicKey}
                        //   onClick={() => {
                        //     SetPrimaryNFMeId(dataNft.id.toString());
                        //   }}>
                        //   Set as Primary NFMe ID
                        // </Button>
                        <></>
                      ) : (
                        <Text fontSize="md" w="200px" m="auto">
                          ✅ Currently set as your Primary NFMe ID
                        </Text>
                      )}
                    </Box> */}
                  </Box>
                  <Flex p={0} ml={{ md: "3" }} flexDirection="column" alignItems="start" w="full">
                    <Flex flexDirection="column" w="100%">
                      <Text fontFamily="Clash-Medium">{metadata.name}</Text>
                      <Text fontSize="lg" pb={3}>
                        {`Nft Id: ${dataNft.id}`}
                      </Text>
                      <Text fontSize="lg" pb={3}>
                        {`Bond Id: ${currentBond.bondId}`}
                      </Text>
                    </Flex>
                    {currentBond.state !== 0 && <LivelinessContainer bond={currentBond} />}
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
        <>
          <ConfirmationDialog
            isOpen={withdrawBondConfirmationWorkflow != undefined}
            onCancel={() => {
              setWithdrawBondConfirmationWorkflow(undefined);
            }}
            onProceed={() => {
              handleWithdrawBondClick(withdrawBondConfirmationWorkflow!.bondId!, (withdrawBondConfirmationWorkflow!.bondAmount * withdrawPenalty) / 100);
              setWithdrawBondConfirmationWorkflow(undefined);
            }}
            bodyContent={
              <>
                <Text fontSize="sm" pb={3} opacity=".8">
                  {`Collection: ${withdrawBondConfirmationWorkflow?.bondId}, Bond Amount: ${(withdrawBondConfirmationWorkflow?.bondAmount ?? 0 * withdrawPenalty) / 100}`}
                </Text>
                <Text mb="5">There are a few items to consider before you proceed with the bond withdraw:</Text>
                <UnorderedList mt="2" p="2">
                  <ListItem>Withdrawing before bond expiry incurs a penalty; no penalty after expiry, and you get the full amount back.</ListItem>
                  <ListItem>Penalties are non-refundable.</ListItem>
                  <ListItem>After withdrawal, your Liveliness score drops to zero, visible to buyers if your Data NFT is listed.</ListItem>
                  <ListItem>Once withdrawn, you {`can't `}re-bond to regain the Liveliness score or earn staking rewards.</ListItem>
                  <ListItem>If the bond was linked to your Primary NFMe ID Vault, {`you'll`} need to set up a new one as your primary.</ListItem>
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
