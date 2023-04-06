import React from "react";
import { Link } from "@chakra-ui/react";
import { numberToPaddedHex } from "@multiversx/sdk-core/out/utils.codec";
import BigNumber from "bignumber.js";

export const convertToLocalString = (value: BigNumber.Value, precision?: number): string => {
  return new BigNumber(value)
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

// Function to transform description that have a link into an actual link
export const transformDescription = (description: string) => {
  const regex = /(?:^|[\s\n])(?:\((.*?)\))?((?:https?:\/\/|www\.)[^\s\n]+)/g; // Regex for check if description have link

  return description.split(regex).map((word, i) => {
    if (word?.match(regex)) {
      return (
        <Link key={i} href={word} isExternal color={"blue.300"}>
          {" " + word}
        </Link>
      );
    }
    return word;
  });
};
