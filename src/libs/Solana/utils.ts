import { BN, Program } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { CNftSolPostMintMetaType } from "@itheum/sdk-mx-data-nft/out";
import { getChainID } from "@multiversx/sdk-dapp/utils";
import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID } from "@solana/spl-account-compression";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountMeta, Connection, PublicKey, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { contractsForChain, IS_DEVNET } from "libs/config";
import { getApiDataDex } from "libs/utils";

import { BOND_CONFIG_INDEX, BONDING_PROGRAM_ID, SolEnvEnum } from "./config";
import { CoreSolBondStakeSc, IDL } from "./CoreSolBondStakeSc";
import { Bond } from "./types";

enum RewardsState {
  Inactive = 0,
  Active = 1,
}

export const MAX_PERCENT = 10000;
export const SLOTS_IN_YEAR = 78840000; // solana slots in a year; Approx. 0.4 seconds per  slot

export const ITHEUM_TOKEN_ADDRESS = import.meta.env.VITE_ENV_ITHEUM_TOKEN_ADDRESS;
//contractsForChain(IS_DEVNET ? SolEnvEnum.devnet : SolEnvEnum.mainnet).itheumToken;
export const DIVISION_SAFETY_CONST = 10 ** 9;

export async function fetchSolNfts(solAddress: string | undefined) {
  if (!solAddress) {
    return [];
  } else {
    const resp = await fetch(`${getApiDataDex(getChainID())}/bespoke/sol/getDataNFTsByOwner?publicKeyb58=${solAddress}`);
    const data = await resp.json();

    return data.nfts;
  }
}

// BONDING

// helper functions
function bufferToArray(buffer: Buffer): number[] {
  const nums: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    nums.push(buffer[i]);
  }
  return nums;
}
function decode(stuff: string) {
  return bufferToArray(bs58.decode(stuff));
}
const mapProof = (proof: string[]): AccountMeta[] => {
  return proof.map((node) => ({
    pubkey: new PublicKey(node),
    isSigner: false,
    isWritable: false,
  }));
};

function calculateRewardsSinceLastAllocation(currentSlot: BN, rewardsConfig: any): BN {
  if (rewardsConfig.rewardsState === RewardsState.Inactive) {
    return new BN(0);
  }

  if (currentSlot.lte(rewardsConfig.lastRewardSlot)) {
    return new BN(0);
  }

  const slotDiff = currentSlot.sub(rewardsConfig.lastRewardSlot);
  // console.log("slotDiff", rewardsConfig.rewardsPerSlot.toNumber() / 10 ** 9, slotDiff);
  return rewardsConfig.rewardsPerSlot.mul(slotDiff);
}

function getAmountAprBounded(maxApr: BN, amount: BN): BN {
  return amount.mul(maxApr).div(new BN(MAX_PERCENT)).div(new BN(SLOTS_IN_YEAR));
}

// fetch Data from the blockchain

export async function fetchBondingConfig(programSol: any) {
  /// bondAmount, bondState, lockPeriod, withdrawPenalty, merkleTree
  try {
    const bondConfigPda = await PublicKey.findProgramAddressSync([Buffer.from("bond_config"), Buffer.from([1])], programSol.programId)[0];

    const res = await programSol?.account.bondConfig.fetch(bondConfigPda);
    return {
      bondConfigPda: bondConfigPda,
      lockPeriod: res.lockPeriod.toNumber(),
      bondAmount: new BigNumber(res.bondAmount).dividedBy(10 ** 9),
      withdrawPenalty: res.withdrawPenalty.toNumber() / 100,
      bondState: res.bondState,
      merkleTree: res.merkleTree,
    };
  } catch (error) {
    console.error("fetchBondingConfigError", error);
  }
}

export async function fetchRewardsConfig(programSol: any) {
  // rewardsPerShare, accumulatedRewards, lastRewardSlot,  rewardsPerSlot, rewardsReserve,  maxApr, rewardsState
  try {
    const _rewardsConfigPda = PublicKey.findProgramAddressSync([Buffer.from("rewards_config")], programSol.programId)[0];
    const res = await programSol?.account.rewardsConfig.fetch(_rewardsConfigPda);

    return {
      rewardsConfigPda: _rewardsConfigPda,
      accumulatedRewards: new BigNumber(res.accumulatedRewards).dividedBy(10 ** 9),
      globalRewardsPerBlock: new BigNumber(res.rewardsPerSlot).dividedBy(10 ** 9), ///todo ask if this is the same as rewardsPerBlock
      rewardsState: res.rewardsState,
      rewardsPerShare: new BigNumber(res.rewardsPerShare).dividedBy(10 ** 9),
      lastRewardSlot: res.lastRewardSlot.toNumber(),
      rewardsReserve: new BigNumber(res.rewardsReserve).dividedBy(10 ** 9),
      maxApr: res.maxApr.toNumber() / 100,
    };
  } catch (error) {
    console.error("fetchRewardsConfigError", error);
  }
}

export function computeCurrentLivelinessScore(lastUpdateTimestamp: number, lockPeriod: number, weightedLivelinessScore: number): number {
  const currentTimestamp = Math.round(Date.now() / 1000);
  const decay = (currentTimestamp - lastUpdateTimestamp) / lockPeriod;
  const livelinessScore = weightedLivelinessScore * (1 - decay);
  return livelinessScore; // returns 9456 for 95.46%
}

export function computeAddressClaimableAmount(
  currentSlot: BN,
  rewardsConfig: any,
  addressRewardsPerShare: BN,
  addressTotalBondAmount: BN,
  globalTotalBond: BN
) {
  const newRewardsConfig = generateAggregatedRewards(currentSlot, rewardsConfig, globalTotalBond);
  const addressClaimableRewards = calculateAddressShareInRewards(
    newRewardsConfig.accumulatedRewards,
    newRewardsConfig.rewardsPerShare,
    addressTotalBondAmount,
    addressRewardsPerShare,
    globalTotalBond
  );

  return addressClaimableRewards.toNumber();
}

function generateAggregatedRewards(currentSlot: BN, rewardsConfig: any, totalBondAmount: BN): any {
  const lastRewardSlot: BN = rewardsConfig.lastRewardSlot;
  let _newRewardsConfig = {};
  const extraRewardsUnbounded = calculateRewardsSinceLastAllocation(currentSlot, rewardsConfig);
  const maxApr = rewardsConfig.maxApr;
  let extraRewards: BN;

  if (maxApr.gt(new BN(0))) {
    const extraRewardsAprBondedPerSlot = getAmountAprBounded(rewardsConfig.maxApr, totalBondAmount);
    const slotDiff = currentSlot.sub(lastRewardSlot);
    const extraRewardsAprBonded = extraRewardsAprBondedPerSlot.mul(slotDiff);
    extraRewards = BN.min(extraRewardsUnbounded, extraRewardsAprBonded);
  } else {
    extraRewards = extraRewardsUnbounded;
  }
  if (extraRewards.gt(new BN(0)) && extraRewards.lte(rewardsConfig.rewardsReserve)) {
    const increment = extraRewards.mul(new BN(DIVISION_SAFETY_CONST)).div(totalBondAmount);
    _newRewardsConfig = {
      ...rewardsConfig,
      rewardsPerShare: rewardsConfig.rewardsPerShare.add(increment),
      rewardsReserve: rewardsConfig.rewardsReserve.sub(extraRewards),
      accumulatedRewards: rewardsConfig.accumulatedRewards.add(extraRewards),
    };
  } else {
    _newRewardsConfig = rewardsConfig;
  }

  return _newRewardsConfig;
}

function calculateAddressShareInRewards(
  accumulatedRewards: BN,
  rewardsPerShare: BN,
  addressBondAmount: BN,
  addressRewardsPerShare: BN,
  totalBondAmount: BN
): BN {
  // If no total bond or rewards, return 0
  if (totalBondAmount.isZero() || accumulatedRewards.isZero()) {
    return new BN(0);
  }
  // Calculate the difference between rewards per share and the user's rewards per share
  const diff: BN = rewardsPerShare.sub(addressRewardsPerShare);
  // Calculate the address's rewards
  const addressRewards = addressBondAmount.mul(diff).div(new BN(DIVISION_SAFETY_CONST));

  return addressRewards;
}

export async function createBondTransaction(
  mintMeta: CNftSolPostMintMetaType,
  userPublicKey: PublicKey,
  connection: Connection
): Promise<Transaction | undefined> {
  try {
    const mintMetaJSON = JSON.parse(mintMeta.toString());
    const {
      assetId,
      leafSchema: { dataHash, creatorHash, nonce },
      //index,
      proof: { proof, root },
    } = mintMetaJSON;

    const proofPathAsAccounts = mapProof(proof);
    const programId = new PublicKey(BONDING_PROGRAM_ID);
    const program = new Program<CoreSolBondStakeSc>(IDL, programId, {
      connection,
    });

    const proofRoot = decode(root);
    const _dataHash = Object.values(dataHash) as number[];
    const _creatorHash = Object.values(creatorHash as number[]);

    const rewardsConfigPda = PublicKey.findProgramAddressSync([Buffer.from("rewards_config")], program.programId)[0];
    const addressBondsRewardsPda = PublicKey.findProgramAddressSync([Buffer.from("address_bonds_rewards"), userPublicKey.toBuffer()], program.programId)[0];

    const bondId = await program.account.addressBondsRewards.fetch(addressBondsRewardsPda).then((data: any) => {
      const _bondId = data.currentIndex + 1;
      return _bondId;
    });

    // const { nftMeIdVault } = await retrieveBondsAndNftMeIdVault(userPublicKey, bondId - 1, program);
    ///TODO ASK if this is correct ... should i let the primary nft that is active bond be the vault or the last one
    const isVault = true; ///nftMeIdVault ? false : true;

    const bondPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey.toBuffer(), Buffer.from([bondId])], program.programId)[0];
    const assetUsagePda = PublicKey.findProgramAddressSync([new PublicKey(assetId).toBuffer()], program.programId)[0];
    const vaultConfigPda = PublicKey.findProgramAddressSync([Buffer.from("vault_config")], programId)[0];
    const vaultAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), vaultConfigPda, true);
    const userItheumAta = await getAssociatedTokenAddress(new PublicKey(ITHEUM_TOKEN_ADDRESS), userPublicKey, true);

    const bondConfigPda = await PublicKey.findProgramAddressSync([Buffer.from("bond_config"), Buffer.from([1])], program.programId)[0];
    const bondConfigData = await program.account.bondConfig.fetch(bondConfigPda).then((data: any) => {
      const bondAmount = data.bondAmount;
      const merkleTree = data.merkleTree;
      return { amount: bondAmount, merkleTree: merkleTree };
    });

    // Create the transaction using bond method from program
    const transaction = await program.methods
      .bond(BOND_CONFIG_INDEX, bondId, bondConfigData.amount, new BN(nonce), isVault, proofRoot, _dataHash, _creatorHash)
      .accounts({
        addressBondsRewards: addressBondsRewardsPda,
        assetUsage: assetUsagePda,
        bond: bondPda,
        bondConfig: bondConfigPda,
        rewardsConfig: rewardsConfigPda,
        vaultConfig: vaultConfigPda,
        vault: vaultAta,
        mintOfTokenSent: new PublicKey(ITHEUM_TOKEN_ADDRESS),
        authority: userPublicKey,
        merkleTree: bondConfigData.merkleTree,
        authorityTokenAccount: userItheumAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      })
      .remainingAccounts(proofPathAsAccounts)
      .transaction(); // Creates the unsigned transaction
    return transaction;
  } catch (error) {
    console.error("Transaction creation failed:", error);
    return undefined;
  }
}

export async function retrieveBondsAndNftMeIdVault(
  userPublicKey: PublicKey,
  lastIndex: number,
  program?: Program<CoreSolBondStakeSc>,
  connection?: Connection
): Promise<{ bonds: Bond[]; nftMeIdVault: Bond | undefined; weightedLivelinessScore: number }> {
  try {
    if (program === undefined) {
      const programId = new PublicKey(BONDING_PROGRAM_ID);
      if (connection) {
        program = new Program<CoreSolBondStakeSc>(IDL, programId, {
          connection: connection,
        });
      } else {
        throw new Error("Connection is required to retrieve bonds");
      }
    }
    const bonds: Bond[] = [];
    let nftMeIdVault: Bond | undefined;
    let totalBondAmount = new BN(0);
    let totalBondWeight = new BN(0);
    const currentTimestampt = Math.floor(Date.now() / 1000);

    for (let i = 1; i <= lastIndex; i++) {
      const bondPda = PublicKey.findProgramAddressSync([Buffer.from("bond"), userPublicKey.toBuffer(), Buffer.from([i])], program.programId)[0];
      const bond = await program.account.bond.fetch(bondPda);
      const bondUpgraded = { ...bond, bondId: i, unbondTimestamp: bond.unbondTimestamp.toNumber(), bondTimestamp: bond.bondTimestamp.toNumber() };
      if (bond.isVault) {
        nftMeIdVault = bondUpgraded;
      }
      if (bond.state === 1) {
        const scorePerBond = Math.floor(computeBondScore(43200, currentTimestampt, bond.unbondTimestamp.toNumber())) / 100;
        const bondWeight = bond.bondAmount.mul(new BN(scorePerBond));
        totalBondWeight = totalBondWeight.add(bondWeight);
        totalBondAmount = totalBondAmount.add(bond.bondAmount);
      }
      bonds.push(bondUpgraded);
    }
    const weightedLivelinessScore = totalBondWeight.mul(new BN(100)).div(totalBondAmount);

    return { bonds: bonds, nftMeIdVault: nftMeIdVault, weightedLivelinessScore: weightedLivelinessScore.toNumber() / 100 };
  } catch (error) {
    console.error("retrieveBondsError", error);

    throw new Error("Retrieve Bonds Error: Not able to fetch the bonds from the blockchain");
  }
}

///TODO TESTING PURPOSES --- SHOULD BE DELETED ON PROD
function computeBondScore(lockPeriod: number, currentTimestamp: number, unbondTimestamp: number): number {
  if (currentTimestamp >= unbondTimestamp) {
    return 0;
  } else {
    const difference = unbondTimestamp - currentTimestamp;

    if (lockPeriod === 0) {
      return 0;
    } else {
      const divResult = 10000 / lockPeriod;
      return divResult * difference;
    }
  }
}
