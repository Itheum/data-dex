import { Offer } from "@itheum/sdk-mx-data-nft/out";

export type RecordStringNumberType = Record<string, number>;
export type RecordStringStringType = Record<string, string>;

export interface DataNftMetadataType {
  index: number;
  id: string;
  nftImgUrl?: string;
  extraAssets?: string[];
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
  media?: {
    url: string;
    originalUrl: string;
    thumbnailUrl: string;
    fileType: string;
    fileSize: number;
  }[];
}

export interface MarketplaceRequirementsType {
  acceptedTokens: string[];
  acceptedPayments: string[];
  maximumPaymentFees: string[];
  buyerTaxPercentageDiscount: number;
  sellerTaxPercentageDiscount: number;
  buyerTaxPercentage: number;
  sellerTaxPercentage: number;
  buyerFee: number;
  sellerFee: number;
}

export interface DataNftCollectionType {
  tokenIdentifier: string;
  nftImgUrl: string;
  dataPreview: string;
  dataStream: string;
  tokenName: string;
  creator: string;
  creationTime: string;
  supply: number;
  quantity: number;
  description: string;
  title: string;
  royalties: string;
  nonce: number;
  collection: string;
  minOffer: Offer;
}

export interface Favorite {
  id: string;
  address: string;
  tokenIdentifier: string;
  timestamp: number;
}

export interface TrendingNft {
  uuid: string;
  tokenIdentifier: string;
  rating: number;
}

export function createDataNftType() {
  return {
    index: 0,
    id: "",
    nftImgUrl: "",
    dataPreview: "",
    dataStream: "",
    dataMarshal: "",
    tokenName: "",
    feeInTokens: 0,
    creator: "",
    creationTime: new Date(),
    supply: 0,
    balance: 0,
    description: "",
    title: "",
    royalties: 0,
    nonce: 0,
    collection: "",
  };
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
