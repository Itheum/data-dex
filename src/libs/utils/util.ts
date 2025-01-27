import { BondContract, Offer } from "@itheum/sdk-mx-data-nft/out";
import { numberToPaddedHex } from "@multiversx/sdk-core/out/utils.codec";
import { IS_DEVNET } from "libs/config";
import { ExtendedOffer } from "libs/types";
import { convertToLocalString } from "./number";

export const VIEW_DATA_DISABLED_DEVNET_MESSAGE = "View Data is disabled on Devnet Data Dex";
export const VIEW_DATA_DISABLED_HUB_MESSAGE = "View Data is disabled on Data Dex when logged in through the xPortal Hub";

export const qsParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

export const sleep = (sec: number) => new Promise((r) => setTimeout(r, sec * 1000));

export const backendApi = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_BACKEND_MAINNET_API" : "VITE_ENV_BACKEND_API";
  const defaultUrl = chainID === "1" ? "https://production-itheum-api.up.railway.app" : "https://staging-itheum-api.up.railway.app";

  return import.meta.env[envKey] || defaultUrl;
};

export const gtagGo = (category: string, action: any, label: any, value?: any) => {
  /*
  e.g.
  Category: 'Videos', Action: 'Play', Label: 'Gone With the Wind'
  Category: 'Videos'; Action: 'Play - Mac Chrome'
  Category: 'Videos', Action: 'Video Load Time', Label: 'Gone With the Wind', Value: downloadTime

  // AUTH
  Category: 'Auth', Action: 'Login', Label: 'Metamask'
  Category: 'Auth', Action: 'Login - Success', Label: 'Metamask'
  Category: 'Auth', Action: 'Login', Label: 'DeFi'
  Category: 'Auth', Action: 'Login', Label: 'Ledger'
  Category: 'Auth', Action: 'Login', Label: 'xPortalApp'
  Category: 'Auth', Action: 'Login', Label: 'WebWallet'

  Category: 'Auth', Action: 'Logout', Label: 'WebWallet'

  // Get Whitelist Page
  Category: 'GWT', Action: 'Join', Label: 'hero/useca/Testi' // tracking the join whitelist links
  Category: 'GWT', Action: 'Exp', Label: 'crd1/2/3' // explore trending collections

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
  sessionStorage.removeItem("persist:sdk-dapp-signedMessageInfo"); // clear signedSessions
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
  if (import.meta.env.VITE_ENV_SENTRY_PROFILE) {
    profile = import.meta.env.VITE_ENV_SENTRY_PROFILE;
  }

  // we cannot set ENV for our cicd stg build, so we do this manually
  if (location?.host?.toLowerCase() === "stg.datadex.itheum.io") {
    profile = "stage";
  }

  return profile;
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
    token_identifier === "ITHEUM-fce905" ||
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

export const getApiDataDex = (chainID?: string) => {
  if (!chainID) {
    if (import.meta.env.VITE_ENV_NETWORK === "mainnet") {
      return "https://api.itheumcloud.com";
    } else {
      return "https://api.itheumcloud-stg.com";
    }
  }

  const envKey = chainID === "1" ? "VITE_ENV_DATADEX_MAINNET_API" : "VITE_ENV_DATADEX_DEVNET_API";
  const defaultUrl = chainID === "1" ? "https://api.itheumcloud.com/datadexapi" : "https://api.itheumcloud-stg.com/datadexapi";

  return import.meta.env[envKey] || defaultUrl;
};

export const getApiDataMarshal = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_DATAMARSHAL_MAINNET_API" : "VITE_ENV_DATAMARSHAL_DEVNET_API";
  const defaultUrl = chainID === "1" ? "https://api.itheumcloud.com/datamarshalapi/router/v1" : "https://api.itheumcloud-stg.com/datamarshalapi/router/v1";

  return import.meta.env[envKey] || defaultUrl;
};

export const shouldPreviewDataBeEnabled = (chainID: string, loginMethod: string, previewDataOnDevnetSession: any) => {
  return !((chainID == "D" && !previewDataOnDevnetSession) || loginMethod === "extra");
};

export const viewDataDisabledMessage = (loginMethod: string) => {
  if (loginMethod === "extra") return VIEW_DATA_DISABLED_HUB_MESSAGE;
  else return VIEW_DATA_DISABLED_DEVNET_MESSAGE;
};

// Is an NFT a NFMeID Vault class (if so it will start with NFMeIDVault.. i.e NFMeIDVaultG1)
export function isNFMeIDVaultClassDataNFT(tokenName: string | undefined) {
  if (tokenName && tokenName.replaceAll(" ", "").toLowerCase().includes("nfmeid")) {
    return true;
  } else {
    return false;
  }
}

export const TranslateBoolean = (value: boolean): string => {
  return value === true ? "True" : "False";
};

const unescape = (str: string) => {
  return str.replace(/-/g, "+").replace(/_/g, "/");
};

const decodeValue = (str: string) => {
  return Buffer.from(unescape(str), "base64").toString("utf8");
};

export const decodeNativeAuthToken = (accessToken: string) => {
  const tokenComponents = accessToken.split(".");
  if (tokenComponents.length !== 3) {
    throw new Error("Native Auth Token has invalid length");
  }

  const [address, body, signature] = accessToken.split(".");
  const parsedAddress = decodeValue(address);
  const parsedBody = decodeValue(body);
  const bodyComponents = parsedBody.split(".");
  if (bodyComponents.length !== 4) {
    throw new Error("Native Auth Token Body has invalid length");
  }

  const [origin, blockHash, ttl, extraInfo] = bodyComponents;

  let parsedExtraInfo;
  try {
    parsedExtraInfo = JSON.parse(decodeValue(extraInfo));
  } catch {
    throw new Error("Extra Info Invalid");
  }

  const parsedOrigin = decodeValue(origin);

  const result = {
    ttl: Number(ttl),
    origin: parsedOrigin,
    address: parsedAddress,
    extraInfo: parsedExtraInfo,
    signature,
    blockHash,
    body: parsedBody,
  };

  // if empty object, delete extraInfo ('e30' = encoded '{}')
  if (extraInfo === "e30") {
    delete result.extraInfo;
  }

  return result;
};

export const getLivelinessScore = (seconds: number, lockPeriod: number) => {
  return (100 / lockPeriod) * seconds;
};

export const getBondsForOffers = async (offers: Offer[]): Promise<ExtendedOffer[]> => {
  if (offers.length === 0) return [];
  const offersTokenIdentif = offers.map((offer) => {
    return createNftId(offer.offeredTokenIdentifier, offer.offeredTokenNonce);
  });
  const bondingContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  const bonds = await bondingContract.viewBonds(offersTokenIdentif);
  return offers.map((offer) => {
    const bond = bonds.find((bondT) => bondT.tokenIdentifier === offer.offeredTokenIdentifier && bondT.nonce === offer.offeredTokenNonce);
    if (bond) {
      return { ...offer, ...bond };
    } else {
      return {
        ...offer,
        ...{
          bondId: 0,
          address: "",
          tokenIdentifier: "",
          nonce: 0,
          lockPeriod: 0,
          bondTimestamp: 0,
          unbondTimestamp: 0,
          bondAmount: 0,
          remainingAmount: 0,
        },
      };
    }
  });
};

export const settingLivelinessScore = async (tokenIdentifier?: string, unbondTimestamp?: number, lockPeriod?: number): Promise<number | undefined> => {
  const bondingContract = new BondContract(IS_DEVNET ? "devnet" : "mainnet");
  try {
    if (tokenIdentifier) {
      const periodOfBond = await bondingContract.viewBonds([tokenIdentifier]);
      const newDate = new Date();
      const currentTimestamp = Math.floor(newDate.getTime() / 1000);
      const difDays = currentTimestamp - periodOfBond[0].unbondTimestamp;
      return difDays > 0
        ? 0
        : periodOfBond[0].unbondTimestamp === 0
          ? -1
          : Number(Math.abs(getLivelinessScore(difDays, periodOfBond[0].lockPeriod)).toFixed(2));
    }
    if (unbondTimestamp && lockPeriod) {
      const newDate = new Date();
      const currentTimestamp = Math.floor(newDate.getTime() / 1000);
      const difDays = currentTimestamp - unbondTimestamp;
      return difDays > 0 ? 0 : unbondTimestamp === 0 ? -1 : Number(Math.abs(getLivelinessScore(difDays, lockPeriod)).toFixed(2));
    }
  } catch (error) {
    return undefined;
  }
};

export function timeUntil(lockPeriod: number): { count: number; unit: string } {
  const seconds = lockPeriod;

  const intervals = [
    { seconds: 3153600000, unit: "century" },
    { seconds: 31536000, unit: "year" },
    { seconds: 2592000, unit: "month" },
    { seconds: 86400, unit: "day" },
    { seconds: 3600, unit: "hour" },
    { seconds: 60, unit: "minute" },
    { seconds: 1, unit: "second" },
  ];

  const interval = intervals.find((i) => i.seconds <= seconds) ?? intervals[0];
  const count = Math.floor(seconds / interval!.seconds);
  const unit = count === 1 ? interval!.unit : interval!.unit + "s";

  return { count, unit };
}

export const computeRemainingCooldown = (startTime: number, cooldown: number) => {
  const timePassedFromLastPlay = Date.now() - startTime;
  const _cooldown = cooldown - timePassedFromLastPlay;

  return _cooldown > 0 ? _cooldown + Date.now() : 0;
};

export function computeMaxBuyForOfferForAddress(
  offer: Offer | undefined,
  maxBuyPerTransaction: number,
  maxBuyPerAddress: number,
  boughtByAddressAlreadyForThisOffer: number
) {
  let mboa = offer ? offer.quantity : 0;
  if (maxBuyPerTransaction > 0) {
    mboa = Math.min(mboa, maxBuyPerTransaction);

    if (maxBuyPerAddress > 0) {
      mboa = Math.min(mboa, maxBuyPerAddress - boughtByAddressAlreadyForThisOffer);
    }
  }
  return mboa;
}

/* 
Simple Caching Module helps throttle frequently used calls to RPC that fetch data
this helps speed up the client side app and also reduces calls to the RPC
we allow consumer to set a custom TTL in MS for how long data is stored in cache
*/
const sessionCache: Record<any, any> = {};

export function getDataFromClientSessionCache(cacheKey: string) {
  const cacheObject = sessionCache[cacheKey];

  if (!cacheObject) {
    console.log(`getDataFromClientSessionCache: ${cacheKey} not found`);
    return false;
  } else {
    // did it expire? is so, delete it from the cache
    if (Date.now() - cacheObject.addedOn > cacheObject.expireAfter) {
      console.log(`getDataFromClientSessionCache: ${cacheKey} expired`);
      delete sessionCache[cacheKey]; // remove it from cache as its expired
      return false;
    } else {
      console.log(`getDataFromClientSessionCache: ${cacheKey} available`);
      return cacheObject.payload;
    }
  }
}

export function setDataToClientSessionCache(cacheKey: string, jsonData: any, ttlInMs?: number) {
  const howManyMsToCacheFor = ttlInMs || 120000; // 120000 is 2 min default TTL

  sessionCache[cacheKey] = {
    payload: jsonData,
    addedOn: Date.now(),
    expireAfter: howManyMsToCacheFor,
  };

  console.log("setDataToClientSessionCache: cached for ms ", howManyMsToCacheFor);

  return true;
}
