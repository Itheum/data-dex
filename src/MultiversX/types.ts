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