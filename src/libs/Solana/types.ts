import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
export interface BondConfig {
  bump: number;
  index: number;
  bondState: number;
  merkleTree: PublicKey;
  lockPeriod: bigint;
  bondAmount: bigint;
  withdrawPenalty: bigint;
  padding: Uint8Array;
}

export interface Bond {
  bump: number;
  bondId: number;
  state: number;
  isVault: boolean;
  bondTimestamp: number;
  unbondTimestamp: number;
  bondAmount: BN;
  assetId: PublicKey;
  owner: PublicKey;
  padding: number[];
}

const bondConfig: BondConfig = {
  bump: 1,
  index: 0,
  bondState: 2,
  merkleTree: new PublicKey("MERKLE_TREE_PUBKEY_STRING"),
  lockPeriod: BigInt(3600), // lock for 3600 seconds (1 hour)
  bondAmount: BigInt(1000000000), // bond amount of 1 billion lamports
  withdrawPenalty: BigInt(50000000), // penalty of 50 million lamports
  padding: new Uint8Array(128), // 128-byte padding
};
