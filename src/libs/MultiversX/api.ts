import { NftType, TokenType } from "@multiversx/sdk-dapp/types/tokens.types";
import { ApiNetworkProvider, ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import axios from "axios";
import { uxConfig } from "libs/config";
import { NetworkIdType } from "libs/types";

export const getApi = (networkId: NetworkIdType) => {
  const envKey = networkId === "E1" ? "REACT_APP_ENV_API_MAINNET_KEY" : "REACT_APP_ENV_API_DEVNET_KEY";
  const defaultUrl = networkId === "E1" ? "api.multiversx.com" : "devnet-api.multiversx.com";

  return process.env[envKey] || defaultUrl;
};

export const getNetworkProvider = (networkId: NetworkIdType, chainId?: string) => {
  const environment = networkId === "E1" || chainId === "1" ? "mainnet" : "devnet";
  const envKey = environment === "mainnet" ? "REACT_APP_ENV_GATEWAY_MAINNET_KEY" : "REACT_APP_ENV_GATEWAY_DEVNET_KEY";
  const defaultUrl = environment === "mainnet" ? "https://gateway.multiversx.com" : "https://devnet-gateway.multiversx.com";

  const envValue = process.env[envKey];
  const isApi = envValue && envValue.includes("api");

  return isApi ? new ApiNetworkProvider(envValue, { timeout: 10000 }) : new ProxyNetworkProvider(envValue || defaultUrl, { timeout: 10000 });
};

export const getNetworkProviderCodification = (networkId: NetworkIdType, chainId?: string) => {
  const environment = networkId === "E1" || chainId === "1" ? "mainnet" : "devnet";
  const envKey = environment === "mainnet" ? "REACT_APP_ENV_GATEWAY_MAINNET_KEY" : "REACT_APP_ENV_GATEWAY_DEVNET_KEY";
  const defaultUrl = environment === "mainnet" ? "https://gateway.multiversx.com" : "https://devnet-gateway.multiversx.com";

  const envValue = process.env[envKey];
  const isApi = envValue && envValue.includes("api");

  return isApi ? envValue : envValue || defaultUrl;
};

export const getExplorer = (networkId: NetworkIdType) => {
  return networkId === "E1" ? "explorer.multiversx.com" : "devnet-explorer.multiversx.com";
};

export const getTransactionLink = (networkId: NetworkIdType, txHash: string) => {
  return `https://${getExplorer(networkId)}/transactions/${txHash}`;
};

export const getNftLink = (networkId: NetworkIdType, nftId: string) => {
  return `https://${getExplorer(networkId)}/nfts/${nftId}`;
};

// check token balance on Mx
export const checkBalance = async (token: string, address: string, networkId: NetworkIdType): Promise<{ balance: any }> => {
  const api = getApi(networkId);

  return new Promise((resolve, reject) => {
    axios
      .get(`https://${api}/accounts/${address}/tokens/${token}`, {
        timeout: uxConfig.mxAPITimeoutMs,
      })
      .then((resp) => {
        resolve({ balance: resp.data.balance });
      })
      .catch((error) => {
        if (error) {
          console.error(error);

          if (error.response) {
            if (error.response.status === 404 || error.response.status === 500) {
              resolve({ balance: 0 }); // no ITHEUM => 404, nonce account 0 => 500
            } else {
              resolve({ balance: undefined });
            }
          } else {
            resolve({ balance: undefined });
          }
        }
      });
  });
};

export const getClaimTransactions = async (address: string, smartContractAddress: string, networkId: NetworkIdType) => {
  const api = getApi(networkId);

  try {
    const allTxs = `https://${api}/accounts/${address}/transactions?size=25&receiver=${smartContractAddress}&function=claim&withOperations=true`;

    const resp = await (await axios.get(allTxs, { timeout: uxConfig.mxAPITimeoutMs })).data;

    const transactions = [];

    for (const tx of resp) {
      const transaction: any = {};
      transaction["timestamp"] = parseInt(tx["timestamp"]) * 1000;
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
      error: '',
    };
  } catch (err) {
    console.error(err);
    return {
      transactions: [],
      error: (err as Error).message,
    };
  }
};

export const getNftsOfACollectionForAnAddress = async (address: string, collectionTicker: string | undefined, networkId: NetworkIdType): Promise<NftType[]> => {
  const api = getApi(networkId);
  try {
    const url = `https://${api}/accounts/${address}/nfts?size=10000&collections=${collectionTicker}&withSupply=true`;
    const { data } = await axios.get<NftType[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getNftsByIds = async (nftIds: string[], networkId: NetworkIdType): Promise<NftType[]> => {
  const api = getApi(networkId);
  try {
    const url = `https://${api}/nfts?withSupply=true&identifiers=${nftIds.join(",")}`;
    const { data } = await axios.get<NftType[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    // match input and output order
    const sorted: NftType[] = [];
    for (const nftId of nftIds) {
      for (const nft of data) {
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

export const getAccountTokenFromApi = async (address: string, tokenId: string, networkId: NetworkIdType): Promise<TokenType | undefined> => {
  const api = getApi(networkId);
  try {
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
