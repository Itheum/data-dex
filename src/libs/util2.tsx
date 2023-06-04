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

// Utility function to report a correct sentry profile for clear bucket logging
export const getSentryProfile = () => {
  let profile = "unknown";

  // this will handle production, dev and feature cicd build
  if (process.env.REACT_APP_ENV_SENTRY_PROFILE) {
    profile = process.env.REACT_APP_ENV_SENTRY_PROFILE;
  }

  // we cannot set ENV for our cicd stg build, so we do this manually
  if (location?.host?.toLowerCase() === "stg.datadex.itheum.io") {
    profile = "stage";
  }

  return profile;
};

export const getApiDataDex = (networkId: string) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_DATADEX_MAINNET_API" : "REACT_APP_ENV_DATADEX_DEVNET_API";
  const defaultUrl = networkId === "E1" ? "https://api.itheumcloud.com/datadexapi" : "https://api.itheumcloud-stg.com/datadexapi";

  return process.env[envKey] || defaultUrl;
};

export const getApiDataMarshal = (networkId: string) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_DATAMARSHAL_MAINNET_API" : "REACT_APP_ENV_DATAMARSHAL_DEVNET_API";
  const defaultUrl =
    networkId === "E1" ? "https://api.itheumcloud.com/datamarshalapi/achilles/v1" : "https://api.itheumcloud-stg.com/datamarshalapi/achilles/v1";

  return process.env[envKey] || defaultUrl;
};
