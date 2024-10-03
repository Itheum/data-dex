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
  const { connection } = useConnection();
  const { publicKey: userPublicKey, sendTransaction } = useWallet();
  const itheumBalance = useAccountStore((state) => state.itheumBalance);
  const [topUpItheumValue, setTopUpItheumValue] = useState<number>(0);
  const [estAnnualRewards, setEstAnnualRewards] = useState<number>(0);
  const [estCombinedAnnualRewards, setEstCombinedAnnualRewards] = useState<number>(0);

  const navigate = useNavigate();

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
  const [claimRewardsConfirmationWorkflow, setClaimRewardsConfirmationWorkflow] = useState<boolean>(false); ///TODO dialogs
  const [reinvestRewardsConfirmationWorkflow, setReinvestRewardsConfirmationWorkflow] = useState<boolean>(false);
  const [nftMeIdBond, setNftMeIdBond] = useState<Bond>();
  const { solNfts } = useNftsStore();
  const { colorMode } = useColorMode();
  const [claimableAmount, setClaimableAmount] = useState<number>(0);
  const [withdrawBondConfirmationWorkflow, setWithdrawBondConfirmationWorkflow] = useState<number>();
  const toast = useToast();

  useEffect(() => {
    if (bondConfigData && rewardsConfigData && addressBondsRewardsData && globalTotalBond) {
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
  }, [bondConfigData, rewardsConfigData, addressBondsRewardsData]);

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
    // console.log("claimableAmount OF THE USERRRRRR", _claimableAmount);
    setClaimableAmount(_claimableAmount / 10 ** 9 + addressClaimableAmount);
    // setClaimableAmount(1); ///TODO remove this
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
    async function fetchAccountInfo() {
      if (programSol && userPublicKey && addressBondsRewardsPda) {
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
            console.log("addressBondsRewardsData CLAIMABLE", data.claimableAmount.toNumber() / 10 ** 9);
            setNumberOfBonds(data.currentIndex);
          });
        }
      }
    }
    fetchAccountInfo(); ///TODO check if this is correct as if we go and initializeAddress does it come back here ?
  }, [addressBondsRewardsPda, programSol]);

  useEffect(() => {
    async function fetchBonds() {
      if (numberOfBonds && userPublicKey && programSol) {
        retrieveBondsAndNftMeIdVault(userPublicKey, numberOfBonds, programSol).then(({ bonds, nftMeIdVault }) => {
          setBonds(bonds);
          setNftMeIdBond(nftMeIdVault);
        });
      }
    }
    fetchBonds();
  }, [numberOfBonds]);

  useEffect(() => {
    if (nftMeIdBond && solNfts && userPublicKey) {
      calculateRewardAprAndEstAnnualRewards(0, nftMeIdBond.bondAmount);
      const nftMeId = solNfts.find((nft) => nft.id == nftMeIdBond.assetId.toString());
      setNftMeId(nftMeId);
      setAllInfoLoading(false); ///TODO what if nftMeId is not found
    }
  }, [nftMeIdBond]);

  // rewardsPerShare, accumulatedRewards, lastRewardSlot,  rewardsPerSlot, rewardsReserve, rewardsPerShare, maxApr, rewardsState
  useEffect(() => {
    if (programSol && userPublicKey && rewardsConfigPda) {
      programSol?.account.rewardsConfig.fetch(rewardsConfigPda).then((data: any) => {
        setRewardsConfigData(data);
        // console.log("rewardsConfigData", data);
        // console.log("rewardsConfigData", data.accumulatedRewards.toNumber());
        //setAccumulatedRewards(data.accumulatedRewards.div(BN10_9).toNumber());
        setGlobalRewardsPerBlock(data.rewardsPerSlot.toNumber());

        setMaxApr(new BN(data.maxApr).div(BN10_2).toNumber());
      });
    }
  }, [rewardsConfigPda, programSol]);

  /// bondAmount, bondState, lockPeriod, withdrawPenalty, merkleTree
  useEffect(() => {
    if (programSol && userPublicKey && bondConfigPda) {
      programSol?.account.bondConfig.fetch(bondConfigPda).then((data: any) => {
        setBondConfigData(data);

        setWithdrawPenalty(new BN(data.withdrawPenalty).div(BN10_2).toNumber());
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
    calculateRewardAprAndEstAnnualRewards();
  }, [globalTotalBond, combinedBondsStaked, maxApr]);

  function calculateRewardAprAndEstAnnualRewards(value?: number, amount?: BN) {
    if (combinedBondsStaked.toNumber() === 0) {
      setRewardApr(0);
      return;
    }

    if (globalTotalBond.toNumber() > 0) {
      ///todo bond Amount + value
      console.log(value, amount);
      if (value) value = value * 10 ** 9;
      else value = 0;
      const amountToCompute = amount ? amount.add(new BN(value)) : combinedBondsStaked.add(new BN(value));

      console.log("amount to compute ", amountToCompute.toNumber() / 10 ** 9);
      const percentage: BN = amountToCompute.toNumber() / globalTotalBond.toNumber();
      console.log("percentage", percentage);
      // console.log("globalRewardsPerBlock", globalRewardsPerBlock);
      const localRewardsPerBlock: number = globalRewardsPerBlock * percentage; ///1000 / 10 ** 9
      // Solana: Approx. 0.4 seconds per block or slot
      console.log("REWARDS PER BLOCK", localRewardsPerBlock);
      const rewardPerYear: number = localRewardsPerBlock * SLOTS_IN_YEAR;
      console.log("REWARDS YEAR", rewardPerYear);
      const calculatedRewardApr = Math.floor((rewardPerYear / amountToCompute.toNumber()) * 10000) / 100; ///* 10000) / 100;

      //rewardPerYear.div(amountToCompute).mul(new BN(10000)).div(BN10_2).toNumber();
      if (!value) {
        if (maxApr === 0) {
          setRewardApr(calculatedRewardApr);
        } else {
          setRewardApr(Math.min(calculatedRewardApr, maxApr));
        }
      }
      console.log("calculatedRewardApr", calculatedRewardApr);
      if (maxApr === 0 || calculatedRewardApr < maxApr) {
        !amount ? setEstCombinedAnnualRewards(rewardPerYear) : setEstAnnualRewards(rewardPerYear);
      } else {
        !amount ? setEstCombinedAnnualRewards((amountToCompute.toNumber() * maxApr) / 100) : setEstAnnualRewards((amountToCompute.toNumber() * maxApr) / 100);
      }
    }
  } ///TODO afis estAnnualRewards per total cumulative staked bonded

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
      if (userPublicKey === null) {
        throw new Error("Wallet not connected");
      }
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = userPublicKey;

      const txSignature = await sendTransaction(transaction, connection, {
        skipPreflight: true,
        preflightCommitment: "finalized",
      });

      const strategy: TransactionConfirmationStrategy = {
        signature: txSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };

      const result = await connection.confirmTransaction(strategy, "finalized" as Commitment);
      const toastStatus = result.value.err ? "info" : "success";

      const cluster = import.meta.env.VITE_ENV_NETWORK === "mainnet" ? "mainnet-beta" : import.meta.env.VITE_ENV_NETWORK;

      // Show success toast with link to Explorer SOLANA
      toast({
        title: explorerLinkMessage,
        description: (
          <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
            {txSignature.slice(0, 11)}...{txSignature.slice(-11)} <ExternalLinkIcon margin={3} />
          </a>
        ),
        status: toastStatus,
        duration: 15000,
        isClosable: true,
      });

      if (result.value.err) {
        throw new Error(customErrorMessage);
      }
      console.log("Transaction confirmed:", result, txSignature);
      return txSignature;
    } catch (error) {
      // Show error toast
      toast({
        title: "Transaction Failed",
        description: customErrorMessage, //|| (error as Error).message,
        status: "error",
        duration: 9000,
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

  async function topUpBondSol(bondId: number, amount?: number) {
    try {
      if (bondId === 0) {
        console.error("Bond not found, id is 0");
        return;
      }
      const bondIdPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey!.toBuffer(), Buffer.from([bondId])], programSol!.programId)[0];
      const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda!, true);
      const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey!, true);

      const amountToSend: BN = new BN(amount ? amount : topUpItheumValue).mul(BN10_9);
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
      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to top-up bond",
      });
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
      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Initialization of the rewards account failed",
      });
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

      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to claim the rewards failed",
      });
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

  async function handleWithdrawBondClick(bondId: number) {
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
      await sendAndConfirmTransaction({
        transaction,
        customErrorMessage: "Failed to withdraw the rewards",
      });
    } catch (error) {
      console.error("Transaction withdraw failed:", error);
    }
  }

  const LivelinessContainer: React.FC<{ bond: Bond }> = ({ bond }) => {
    function checkIfBondIsExpired(unbondTimestamp: any) {
      return unbondTimestamp < Math.round(Date.now() / 1000);
    }
    return (
      <VStack>
        <LivelinessScore unbondTimestamp={bond?.unbondTimestamp} lockPeriod={bondConfigData?.lockPeriod.toNumber()} />
        <Flex gap={4} pt={3} alignItems="center" w="100%">
          <Button
            colorScheme="teal"
            px={6}
            isDisabled={!userPublicKey}
            onClick={() => {
              renewBondSol(bond?.bondId ?? 0);
            }}>
            Renew Bond
          </Button>
          <Text fontSize=".75rem">{`New expiry will be ${calculateNewPeriodAfterNewBond(bondConfigData?.lockPeriod.toNumber())}`}</Text>
        </Flex>
        <Flex gap={4} pt={3} alignItems="center" w="100%">
          <Flex flexDirection={{ base: "column", md: "row" }} gap={4} pt={3} alignItems="center">
            {bond.isVault ? (
              <></>
            ) : !checkIfBondIsExpired(bond?.unbondTimestamp) ? (
              <Button
                colorScheme="red"
                variant="outline"
                textColor="indianred"
                fontWeight="400"
                isDisabled={bond.state === 0}
                onClick={() => {
                  setWithdrawBondConfirmationWorkflow(bond.bondId);
                }}>
                Withdraw Bond
              </Button>
            ) : (
              <Button
                colorScheme="teal"
                variant="outline"
                textColor="teal.200"
                fontWeight="400"
                isDisabled={bond.state === 0}
                onClick={() => {
                  handleWithdrawBondClick(bond.bondId);
                }}>
                Withdraw Bond
              </Button>
            )}
            <Flex flexDirection="row" gap={4}>
              <Text fontSize="1rem" textColor="teal.200">
                {formatNumberToShort(new BN(bond?.bondAmount ?? 0).div(BN10_9).toNumber())}
                &nbsp;$ITHEUM Bonded
              </Text>
            </Flex>
          </Flex>
        </Flex>
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
                <Text fontSize="3xl">Combined Liveliness: {combinedLiveliness}%</Text>
                <Progress hasStripe isAnimated value={combinedLiveliness} rounded="xs" colorScheme="teal" width={"100%"} />
                <Text fontSize="xl">Combined Bonds Staked: {formatNumberToShort(combinedBondsStaked.toNumber() / 10 ** 9)} $ITHEUM</Text>
                {/* ///todo - check this BigNUmbers.toNUmber() is not correct !!! */}
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
                          isDisabled={!userPublicKey || claimableAmount < 1 || combinedLiveliness === 0}>
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
                          isDisabled={!userPublicKey || nftMeId === undefined || claimableAmount < 1 || combinedLiveliness === 0}
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
                      <Text m={{ base: "auto", md: "initial" }} mt={{ base: "10", md: "auto" }} fontSize="lg">
                        Est. Cummulative Annual Rewards: {formatNumberToShort(estCombinedAnnualRewards / 10 ** 9)} $ITHEUM
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
        </Box>{" "}
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
                    <Box minH="263px">
                      <NftMediaComponent
                        imageUrls={[dataNft.content.links && dataNft.content.links["image"] ? (dataNft.content.links["image"] as string) : DEFAULT_NFT_IMAGE]}
                        // nftMedia={[dataNft.content.links ? (dataNft.content.links["image"] as string) : "///todo"]}
                        imageHeight="220px"
                        imageWidth="220px"
                        borderRadius="10px"
                      />
                    </Box>
                    <Box>
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
                    </Box>
                  </Box>
                  <Flex p={0} ml={{ md: "3" }} flexDirection="column" justifyContent="space-between" alignItems="start" w="full">
                    <Flex flexDirection="column" justifyContent="space-between" w="100%">
                      <Text fontFamily="Clash-Medium">{metadata.name}</Text>
                      <Text fontSize="lg" pb={3}>
                        {`Id: ${dataNft.id}`}
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
              handleWithdrawBondClick(withdrawBondConfirmationWorkflow!);
              setWithdrawBondConfirmationWorkflow(undefined);
            }}
            bodyContent={
              <>
                <Text fontSize="sm" pb={3} opacity=".8">
                  {/* {`Collection: ${nftMeId?.id}, Bond ID: ${bonds[withdrawBondConfirmationWorkflow!]?.bondId}`} */}
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
