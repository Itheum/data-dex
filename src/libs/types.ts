export interface ContractsType {
  itheumToken: string;
  claims: string;
  faucet: string;
  market: string;
  dataNftTokens: DataNFTToken[];
}

export interface DataNFTToken {
  id: string;
  contract: string;
}
