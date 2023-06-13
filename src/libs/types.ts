export type NetworkIdType = string | number;

export interface ContractsType {
  itheumToken: string;
  claims: string;
  faucet: string;
  ddex?: string;
  dnft?: string;
  market?: string;
  dataNftMint?: string;
  dataNFTFTTicker?: string;
}

export interface ChainMetaType {
  networkId: NetworkIdType;
  contracts: ContractsType;
  walletUsed: string;
}
