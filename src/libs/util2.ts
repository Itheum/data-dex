import { numberToPaddedHex } from '@multiversx/sdk-core/out/utils.codec';
import BigNumber from "bignumber.js";

export const convertToLocalString = (value: BigNumber.Value, precision?: number): string => {
  return BigNumber(value)
    .decimalPlaces(precision ? precision : 4, BigNumber.ROUND_FLOOR)
    .toNumber()
    .toLocaleString();
};

export const printPrice = (price: number, token: string): string => {
  return price <= 0 ? "FREE" : `${price} ${token}`;
};

export const createNftId = (collection_id: string, nft_nonce: number) => {
  return `${collection_id}-${numberToPaddedHex(nft_nonce)}`;
};
