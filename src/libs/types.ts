import { Bond, Offer, ViewDataReturnType } from "@itheum/sdk-mx-data-nft/out";
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
  media?: NftMedia[];
}

export interface DataNFTToken {
  id: string;
  contract: IAddress;
}

export type AddressBoughtOffer = {
  id: number;
  address: string;
  offerId: number;
  quantity: number;
};

export interface ExtendedOffer extends Offer, Partial<Bond> {}

export enum BlobDataType {
  TEXT,
  IMAGE,
  AUDIO,
  SVG,
  PDF,
  VIDEO,
}

export interface ExtendedViewDataReturnType extends ViewDataReturnType {
  blobDataType: BlobDataType;
}

export interface NftMedia {
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
}
