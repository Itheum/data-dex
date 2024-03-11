import { IAddress } from "@multiversx/sdk-core/out";
import BigNumber from "bignumber.js";

export interface ContractsType {
  itheumToken: string;
  claims: IAddress;
  faucet: IAddress;
  market: IAddress;
  dataNftTokens: DataNFTToken[];
}

export interface RecentDataNFTType {
  index: BigNumber.Value;
  owner: IAddress;
  creator: IAddress;
  offeredTokenIdentifier: string;
  offeredTokenNonce: BigNumber.Value;
  offeredTokenAmount: BigNumber.Value;
  wantedTokenIdentifier: string;
  wantedTokenNonce: BigNumber.Value;
  wantedTokenAmount: BigNumber.Value;
  quantity: BigNumber.Value;
  tokenName?: string;
  title?: string;
  nftImgUrl?: string;
  royalties?: BigNumber.Value;
}

export interface DataNFTToken {
  id: string;
  contract: IAddress;
}
