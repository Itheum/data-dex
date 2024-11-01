import { IS_DEVNET } from "libs/config";

export const SUPPORTED_SOL_COLLECTIONS = IS_DEVNET
  ? ["6MgvQSDUU3Z2a5MQqPeStUyCo1AXrB8xJhyBc8YYH3uk", "6uXqBZLNdp3dT1wgJYHCXjCs36WWLThdQkKUeqdTT7ni", "68U3PakyLevtZ2A87iBS7JKuWeha2bcCfLdD8tY1SZ9u"]
  : ["me2Sj97xewgEodSCRs31jFEyA1m3FQFzziqVXK9SVHX", "C6MwnegxKZfZjYbrGZ8DRBLUxvXohscn8xozNPzdkJNX"];

export enum SolEnvEnum {
  devnet = "SD",
  mainnet = "S1",
}

export const SOLANA_EXPLORER_URL = "https://explorer.solana.com/";

export enum BondStateEnum {}

export const BONDING_PROGRAM_ID = import.meta.env.VITE_ENV_BONDING_PROGRAM_ID;

export const BOND_CONFIG_INDEX = 1;
