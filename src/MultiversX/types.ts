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
  accepted_tokens: string[],
  accepted_payments: string[],
  maximum_payment_fees: string[],
  discount_fee_percentage_buyer: number,
  discount_fee_percentage_seller: number,
  percentage_cut_from_buyer: number,
  percentage_cut_from_seller: number,
  buyer_fee: number,
}