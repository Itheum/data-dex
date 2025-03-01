import { DataNft } from "@itheum/sdk-mx-data-nft/out";
import { ApiNetworkProvider, ProxyNetworkProvider } from "@multiversx/sdk-core/out";
import { AccountType } from "@multiversx/sdk-dapp/types";
import { NftType, TokenType } from "@multiversx/sdk-dapp/types/tokens.types";
import axios from "axios";
import { IS_DEVNET, contractsForChain, uxConfig } from "libs/config";
import { getDataFromClientSessionCache, setDataToClientSessionCache } from "libs/utils/util";

/* 
We already return the public MVX API here, but we store and load it from the window object 
so we don't have to keep running the ENV variable logic

getMvxRpcPublicOnlyApi can be used for non-critical use cases for fetching data in the app
e.g. recent data nft, trending data data,
*/
export const getMvxRpcPublicOnlyApi = (chainID: string) => {
  return chainID === "1" ? "api.multiversx.com" : "devnet-api.multiversx.com";
};

/* 
Here we load the private RPC or public RPC based on usage randomization - i. 10% of time load public / 90% of time private
this will help load balance performance and costs

getMvxRpcApi SHOULD be used for critical use cases for fetching data in the app
e.g. offers, market etc
*/
declare const window: {
  ITH_GLOBAL_MVX_RPC_API_SESSION: string;
} & Window;

window.ITH_GLOBAL_MVX_RPC_API_SESSION = "";

export const getMvxRpcApi = (chainID: string) => {
  if (window.ITH_GLOBAL_MVX_RPC_API_SESSION !== "") {
    console.log("ITH_GLOBAL_MVX_RPC_API_SESSION served from session ", window.ITH_GLOBAL_MVX_RPC_API_SESSION);
    return window.ITH_GLOBAL_MVX_RPC_API_SESSION;
  }

  let mvxRpcApiToUse = chainID === "1" ? "api.multiversx.com" : "devnet-api.multiversx.com";

  // 30% of chance, default to the Public API
  // const defaultToPublic = Math.random() < 0.1; // math random gives you close to even distribution from 0 - 1
  const defaultToPublic = false; // always do private

  if (!defaultToPublic) {
    const envKey = chainID === "1" ? "VITE_ENV_API_MAINNET_KEY" : "VITE_ENV_API_DEVNET_KEY";
    mvxRpcApiToUse = import.meta.env[envKey] || mvxRpcApiToUse;
  }

  window.ITH_GLOBAL_MVX_RPC_API_SESSION = mvxRpcApiToUse;

  console.log(`ITH_GLOBAL_MVX_RPC_API_SESSION NOT in session, ${chainID} mvxRpcApiToUse = ${mvxRpcApiToUse}`);

  return mvxRpcApiToUse;
};

export const getNetworkProvider = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_GATEWAY_MAINNET_KEY" : "VITE_ENV_GATEWAY_DEVNET_KEY";
  const defaultUrl = chainID === "1" ? "https://gateway.multiversx.com" : "https://devnet-gateway.multiversx.com";

  const envValue = import.meta.env[envKey];
  const isApi = envValue && envValue.includes("api");
  return isApi
    ? new ApiNetworkProvider(envValue, { timeout: uxConfig.mxAPITimeoutMs, clientName: "itheumDataDex" })
    : new ProxyNetworkProvider(envValue || defaultUrl, { timeout: uxConfig.mxAPITimeoutMs, clientName: "itheumDataDex" });
};

export const getNetworkProviderCodification = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_GATEWAY_MAINNET_KEY" : "VITE_ENV_GATEWAY_DEVNET_KEY";
  const defaultUrl = chainID === "1" ? "https://gateway.multiversx.com" : "https://devnet-gateway.multiversx.com";

  const envValue = import.meta.env[envKey];
  const isApi = envValue && envValue.includes("api");

  return isApi ? envValue : envValue || defaultUrl;
};

export const getExplorer = (chainID: string) => {
  return chainID === "1" ? "explorer.multiversx.com" : "devnet-explorer.multiversx.com";
};

export const getClaimTransactions = async (address: string, chainID: string) => {
  const api = getMvxRpcApi(chainID);
  const claimsContractAddress = contractsForChain(chainID).claims;
  try {
    const allTxs = `https://${api}/accounts/${address}/transactions?size=25&receiver=${claimsContractAddress}&function=claim&withOperations=true`;
    const resp = await (await axios.get(allTxs, { timeout: uxConfig.mxAPITimeoutMs })).data;
    const transactions = [];

    for (const tx of resp) {
      const transaction: any = {};
      transaction["timestamp"] = parseInt(tx["timestamp"]);
      transaction["hash"] = tx["txHash"];
      transaction["status"] = tx["status"];

      const data = Buffer.from(tx["data"], "base64").toString("ascii").split("@");

      if (data.length === 1) {
        transaction["claimType"] = "Claim All";
      } else {
        switch (data[1]) {
          case "":
            transaction["claimType"] = "Reward";
            break;
          case "00":
            transaction["claimType"] = "Reward";
            break;
          case "01":
            transaction["claimType"] = "Airdrop";
            break;
          case "02":
            transaction["claimType"] = "Allocation";
            break;
          case "03":
            transaction["claimType"] = "Royalties";
            break;
          default:
            transaction["claimType"] = "Unknown";
            break;
        }
      }

      let amount = 0;

      for (const op of tx["operations"]) {
        if (op["value"]) {
          amount += parseInt(op["value"]);
        }
      }

      transaction["amount"] = amount;
      transactions.push(transaction);
    }

    return {
      transactions,
      error: "",
    };
  } catch (err) {
    console.error(err);
    return {
      transactions: [],
      error: (err as Error).message,
    };
  }
};

// Non-Critical workflow, CAN cache -- use private RPC
// Caching for 15 seconds (not too long as user wont see new Data NFTs), but short enough to prevent react design issues where we hit endpoint too much
// Gets users Data NFTs, and shows in wallet etc
export const getNftsOfACollectionForAnAddress = async (address: string, collectionTickers: string[], chainID: string): Promise<DataNft[]> => {
  DataNft.setNetworkConfig(IS_DEVNET ? "devnet" : "mainnet", `https://${getMvxRpcApi(chainID)}`);

  try {
    const ownerByAddress = await DataNft.ownedByAddress(address, collectionTickers, 15 * 1000);
    return ownerByAddress;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Non-Critical workflow, CAN cache -- use private RPC
// Caching for 5 mins
// gets NFTs using IDs, there is a method in the Data NFT SDK that does the same. Should move there @TODO
export const getNftsByIds = async (nftIds: string[], chainID: string): Promise<NftType[]> => {
  const api = getMvxRpcApi(chainID);
  try {
    const fetchUrl = `https://${api}/nfts?withSupply=true&identifiers=${nftIds.join(",")}`;

    // check if its in session cache
    let jsonDataPayload = null;
    const getFromSessionCache = getDataFromClientSessionCache(fetchUrl);

    if (!getFromSessionCache) {
      const { data } = await axios.get<NftType[]>(fetchUrl, {
        timeout: uxConfig.mxAPITimeoutMs,
      });

      jsonDataPayload = data;

      setDataToClientSessionCache(fetchUrl, jsonDataPayload, 5 * 60 * 1000);
    } else {
      jsonDataPayload = getFromSessionCache;
    }

    // match input and output order
    const sorted: NftType[] = [];

    for (const nftId of nftIds) {
      for (const nft of jsonDataPayload) {
        if (nftId === nft.identifier) {
          sorted.push(nft);
          break;
        }
      }
    }
    // check length of input and output match
    if (nftIds.length !== sorted.length) {
      console.error("getNftsByIds failed");
      return [];
    }

    return sorted;
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Critical workflow, NO caching -- should use private RPC
// Gets ITHEUM balance
export const getAccountTokenFromApi = async (address: string, tokenId: string, chainID: string): Promise<TokenType | undefined> => {
  try {
    const api = getMvxRpcApi(chainID);
    const url = `https://${api}/accounts/${address}/tokens/${tokenId}`;
    const { data } = await axios.get<TokenType>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

// Non-Critical workflow, NO caching -- use public RPC (but always mainnet as this is where the price is)
export const getItheumPriceFromApi = async (): Promise<number | undefined> => {
  try {
    const url = "https://api.multiversx.com/tokens/ITHEUM-df6f26";
    const { data } = await axios.get<TokenType>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data.price;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

// Non-Critical workflow, CAN cache -- use public RPC
export const getAccountDetailFromApi = async (address: string, chainID: string): Promise<AccountType | undefined> => {
  try {
    const api = getMvxRpcPublicOnlyApi(chainID);
    const url = `https://${api}/accounts/${address}`;
    const { data } = await axios.get<AccountType>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

// Critical workflow, NO caching -- should use private RPC
export const getTokenDecimalsRequest = async (tokenIdentifier: string | undefined, chainID: string) => {
  const tokenIdentifierUrl = `https://${getMvxRpcApi(chainID)}/tokens/${tokenIdentifier}`;
  try {
    const { data } = await axios.get(tokenIdentifierUrl);
    if (tokenIdentifier !== undefined) {
      return data.decimals;
    }
  } catch (error) {
    console.error(error);
  }
};

// Non-Critical workflow, CAN cache -- use private RPC
// Caching for X mins as needed foe bespoke use case
// gets any other bespoke data from the blockchain
export const getBespokeOnChainDataData = async (urlToFetch: string, cacheForMS: number): Promise<any> => {
  try {
    const fetchUrl = urlToFetch;

    // check if its in session cache
    let jsonDataPayload = null;
    const getFromSessionCache = getDataFromClientSessionCache(fetchUrl);

    if (!getFromSessionCache) {
      const { data } = await axios.get(fetchUrl, {
        timeout: uxConfig.mxAPITimeoutMs,
      });

      jsonDataPayload = data;

      setDataToClientSessionCache(fetchUrl, jsonDataPayload, cacheForMS);
    } else {
      jsonDataPayload = getFromSessionCache;
    }

    return jsonDataPayload;
  } catch (error) {
    console.error(error);
    return [];
  }
};
