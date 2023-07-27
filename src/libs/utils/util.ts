import { numberToPaddedHex } from "@multiversx/sdk-core/out/utils.codec";
import BigNumber from "bignumber.js";
import { OPENSEA_CHAIN_NAMES } from "libs/config";
import { NetworkIdType } from "libs/types";
import { convertToLocalString } from "./number";

export const qsParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

export const itheumTokenRoundUtil = (balance: BigNumber.Value, decimals: number) => {
  const balanceWeiString = balance.toString();
  const balanceWeiBN = new BigNumber(balanceWeiString);
  const decimalsBN = new BigNumber(decimals);
  const divisor = new BigNumber(10).pow(decimalsBN);
  const beforeDecimal = balanceWeiBN.div(divisor);

  return beforeDecimal.toString();
};

export const sleep = (sec: number) => new Promise((r) => setTimeout(r, sec * 1000));

export const buyOnOpenSea = (txNFTId: string, dnftContract: string, txNetworkId: NetworkIdType) => {
  window.open(`https://testnets.opensea.io/assets/${OPENSEA_CHAIN_NAMES[txNetworkId]}/${dnftContract}/${txNFTId}`);
};

export const backendApi = (networkId: NetworkIdType) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_BACKEND_MAINNET_API" : "REACT_APP_ENV_BACKEND_API";
  const defaultUrl = networkId === "E1" ? "https://production-itheum-api.up.railway.app" : "https://staging-itheum-api.up.railway.app";

  return process.env[envKey] || defaultUrl;
};

export const gtagGo = (category: string, action: any, label: any, value?: any) => {
  /*
  e.g.
  Category: 'Videos', Action: 'Play', Label: 'Gone With the Wind'
  Category: 'Videos'; Action: 'Play - Mac Chrome'
  Category: 'Videos', Action: 'Video Load Time', Label: 'Gone With the Wind', Value: downloadTime

  Category: 'Auth', Action: 'Login', Label: 'Metamask'
  Category: 'Auth', Action: 'Login - Success', Label: 'Metamask'
  Category: 'Auth', Action: 'Login', Label: 'DeFi'
  Category: 'Auth', Action: 'Login', Label: 'Ledger'
  Category: 'Auth', Action: 'Login', Label: 'xPortalApp'
  Category: 'Auth', Action: 'Login', Label: 'WebWallet'

  Category: 'Auth', Action: 'Logout', Label: 'WebWallet'
  */

  if (!action || !category) {
    console.error("gtag tracking needs both action and category");
    return;
  }

  const eventObj: Record<string, string> = {
    event_category: category,
  };

  if (label) {
    eventObj["event_label"] = label;
  }

  if (value) {
    eventObj["event_value"] = value;
  }

  if (window.location.hostname !== "localhost") {
    (window as any).gtag("event", action, eventObj);
  }
};

export const clearAppSessionsLaunchMode = () => {
  localStorage?.removeItem("itm-wallet-used");
  localStorage?.removeItem("itm-launch-mode");
  localStorage?.removeItem("itm-launch-env");
  localStorage?.removeItem("itm-datacat-linked");
};

export const printPrice = (price: number, token: string): string => {
  return price <= 0 ? "FREE" : `${convertToLocalString(price)} ${token}`;
};

export const createNftId = (collection_id: string, nft_nonce: number) => {
  return `${collection_id}-${numberToPaddedHex(nft_nonce)}`;
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

export const roundDown = (num: number, precision: number) => {
  let number;
  if (typeof num === "string") {
    number = parseFloat(num);
  } else {
    number = num;
  }
  const m = Math.pow(10, precision);
  return Math.floor(number * m) / m;
};

export const hexZero = (nr: number) => {
  let hexnonce = nr.toString(16);
  if (hexnonce.length % 2 !== 0) {
    hexnonce = "0" + hexnonce;
  }
  return hexnonce;
};

export const getTokenWantedRepresentation = (token: string, nonce: number) => {
  if (nonce > 0) {
    const hexnonce = hexZero(nonce);
    return `${token}-${hexnonce}`;
  } else {
    return token.split("-")[0];
  }
};

export const getTokenImgSrc = (token_identifier: string, token_nonce: number) => {
  if (token_nonce > 0 && !token_identifier.includes("LKMEX")) {
    return `https://api.multiversx.com/nfts/${token_identifier}-${hexZero(token_nonce)}/thumbnail`;
  } else {
    return `https://media.multiversx.com/tokens/asset/${token_identifier}/logo.png`;
  }
};

export const tokenDecimals = (token_identifier: string) => {
  if (token_identifier === "VITAL-bc0917" || token_identifier === "PLATA-9ba6c3") {
    return 8;
  } else if (
    token_identifier === "EGLD" ||
    token_identifier === "LKMEX-aab910" ||
    token_identifier === "CHAKRA-9ebfe5" ||
    token_identifier === "MEX-455c57" ||
    token_identifier === "WEGLD-bd4d79" ||
    token_identifier === "ZPAY-247875" ||
    token_identifier === "RIDE-7d18e9" ||
    token_identifier === "UTK-2f80e9" ||
    token_identifier === "ITHEUM-df6f26" ||
    token_identifier === "ITHEUM-a61317" ||
    token_identifier === "BHAT-c1fde3" ||
    token_identifier === "CRT-52decf" ||
    token_identifier === "PROTEO-0c7311" ||
    token_identifier === "AERO-458bbf" ||
    token_identifier === "LAND-40f26f" ||
    token_identifier === "KRO-df97ec" ||
    token_identifier === "EPUNKS-dc0f59" ||
    token_identifier === "EFFORT-a13513"
  ) {
    return 18;
  } else if (token_identifier === "USDC-c76f1f" || token_identifier === "QWT-46ac01" || token_identifier === "ISET-84e55e") {
    return 6;
  } else if (token_identifier === "OFE-29eb54") {
    return 4;
  } else return 0;
};

export const getApiDataDex = (networkId: NetworkIdType) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_DATADEX_MAINNET_API" : "REACT_APP_ENV_DATADEX_DEVNET_API";
  const defaultUrl = networkId === "E1" ? "https://api.itheumcloud.com/datadexapi" : "https://api.itheumcloud-stg.com/datadexapi";

  return process.env[envKey] || defaultUrl;
};

export const getApiDataMarshal = (networkId: NetworkIdType) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_DATAMARSHAL_MAINNET_API" : "REACT_APP_ENV_DATAMARSHAL_DEVNET_API";
  const defaultUrl =
    networkId === "E1" ? "https://api.itheumcloud.com/datamarshalapi/achilles/v1" : "https://api.itheumcloud-stg.com/datamarshalapi/achilles/v1";

  return process.env[envKey] || defaultUrl;
};

export const getExplorerTrailBlazerURL = (networkId: NetworkIdType) => {
  return networkId === "E1" ? "https://explorer.itheum.io/project-trailblazer" : "https://stg.explorer.itheum.io/project-trailblazer";
};

// utility to return mainnet if user is NOT logged in and they are on datadex.itheum.io
// ... this is used only for "public" components and routes where the user has not connected their wallet
export const networkIdBasedOnLoggedInStatus = (isMxLoggedIn: boolean, networkId: NetworkIdType) => {
  return !isMxLoggedIn && window.location.hostname === "datadex.itheum.io" ? "E1" : networkId;
};
