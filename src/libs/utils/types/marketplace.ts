import { Offer } from "@itheum/sdk-mx-data-nft/out/interfaces";

export interface DataNFTCollectionObject {
  collection: string;
  type: string;
  dataNfts: DataNFT[];
}
export interface DataNFT {
  tokenIdentifier: string;
  nftImgUrl: string;
  type: string;
  dataPreview: string;
  dataStream: string;
  dataMarshal: string;
  tokenName: string;
  creator: string;
  creationTime: string;
  supply: number;
  description: string;
  title: string;
  royalties: string;
  nonce: number;
  collection: string;
  balance: string;
  owner: string;
  overrideDataMarshal: string;
  overrideDataMarshalChainId: string;
  isDataNFTPH: boolean;
  extraAssets: any[];
  media: Media[];
  minOffer: Offer;
}

interface Media {
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileType: string;
  fileSize: number;
}
// interface Offer {
//   id: number;
//   index: number;
//   offeredTokenIdentifier: string;
//   offeredTokenNonce: number;
//   offeredTokenAmount: number;
//   wantedTokenIdentifier: string;
//   wantedTokenNonce: number;
//   wantedTokenAmount: string;
//   quantity: number;
//   owner: string;
//   maxQuantityPerAddress: number;
// }
