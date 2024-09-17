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
