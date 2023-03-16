export type RecordStringNumberType = Record<string, number>;
export type RecordStringStringType = Record<string, string>;

export interface DataNftMetadataType {
  index: number;
  id: string;
  nftImgUrl?: string;
  dataPreview: string;
  dataStream: string;
  dataMarshal: string;
  tokenName: string;
  creator: string;
  creationTime: Date;
  supply: number;
  balance: number;
  description: string;
  title: string;
  royalties: number;
  nonce: number;
  collection: string;
}

export interface MarketplaceRequirementsType {
  accepted_tokens: string[];
  accepted_payments: string[];
  maximum_payment_fees: string[];
  discount_fee_percentage_buyer: number;
  discount_fee_percentage_seller: number;
  percentage_cut_from_buyer: number;
  percentage_cut_from_seller: number;
  buyer_fee: number;
}

export interface OfferType {
  index: number;
  owner: string;
  offered_token_identifier: string;
  offered_token_nonce: number;
  offered_token_amount: string;
  wanted_token_identifier: string;
  wanted_token_nonce: number;
  wanted_token_amount: string;
  quantity: number;
}

export interface ItemType {
  index: number;
  owner: string;
  wanted_token_identifier: string;
  wanted_token_amount: string;
  wanted_token_nonce: number;
  offered_token_identifier: string;
  offered_token_nonce: number;
  balance: number;
  supply: number;
  royalties: number;
  id: string;
  dataPreview: string;
  nftImgUrl: string;
  nonce: number;
  title: string;
  tokenName: string;
  quantity: number;
}

export interface DataNftType {
  index: number;
  id: string;
  nftImgUrl: string;
  dataPreview: string;
  dataStream: string;
  dataMarshal: string;
  tokenName: string;
  feeInTokens: number;
  creator: string;
  creationTime: Date;
  supply: number;
  balance: number;
  description: string;
  title: string;
  royalties: number;
  nonce: number;
  collection: string;
}

export interface UserDataType {
  antiSpamTaxValue: number;
  addressFrozen: boolean;
  frozenNonces: number[];
  contractPaused: boolean;
  userWhitelistedForMint: boolean;
  lastUserMintTime: number;
  maxRoyalties: number;
  maxSupply: number;
  minRoyalties: number;
  mintTimeLimit: number;
  numberOfMintsForUser: number;
  totalNumberOfMints: number;
  contractWhitelistEnabled: boolean;
}
