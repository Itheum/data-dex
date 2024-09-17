import { IS_DEVNET } from "libs/config";

export const SUPPORTED_SOL_COLLECTIONS = IS_DEVNET
  ? ["6MgvQSDUU3Z2a5MQqPeStUyCo1AXrB8xJhyBc8YYH3uk", "6uXqBZLNdp3dT1wgJYHCXjCs36WWLThdQkKUeqdTT7ni"]
  : ["me2Sj97xewgEodSCRs31jFEyA1m3FQFzziqVXK9SVHX"];

export enum SolEnvEnum {
  devnet = "SD",
  mainnet = "S1",
}
