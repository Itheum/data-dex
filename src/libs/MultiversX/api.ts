import { AccountType } from "@multiversx/sdk-dapp/types";
import { NftType, TokenType } from "@multiversx/sdk-dapp/types/tokens.types";
import { ApiNetworkProvider, ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import axios from "axios";
import { contractsForChain, uxConfig } from "libs/config";

export const getApi = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_API_MAINNET_KEY" : "VITE_ENV_API_DEVNET_KEY";
  const defaultUrl = chainID === "1" ? "api.multiversx.com" : "devnet-api.multiversx.com";

  return import.meta.env[envKey] || defaultUrl;
};

export const getNetworkProvider = (chainID: string) => {
  const envKey = chainID === "1" ? "VITE_ENV_GATEWAY_MAINNET_KEY" : "VITE_ENV_GATEWAY_DEVNET_KEY";
  const defaultUrl = chainID === "1" ? "https://gateway.multiversx.com" : "https://devnet-gateway.multiversx.com";

  const envValue = import.meta.env[envKey];
  const isApi = envValue && envValue.includes("api");
  return isApi ? new ApiNetworkProvider(envValue, { timeout: 10000 }) : new ProxyNetworkProvider(envValue || defaultUrl, { timeout: 10000 });
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
  const api = getApi(chainID);
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

export const getNftsOfACollectionForAnAddress = async (address: string, collectionTickers: string[], chainID: string): Promise<NftType[]> => {
  const api = getApi(chainID);
  try {
    const url = `https://${api}/accounts/${address}/nfts?size=10000&collections=${collectionTickers.join()}&withSupply=true`;
    const { data } = await axios.get<NftType[]>(url, {
      timeout: uxConfig.mxAPITimeoutMs,
    });

    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getNftsByIds = async (nftIds: string[], chainID: string): Promise<NftType[]> => {
  const api = getApi(chainID);
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

export const getAccountTokenFromApi = async (address: string, tokenId: string, chainID: string): Promise<TokenType | undefined> => {
  try {
    const api = getApi(chainID);
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

export const getAccountDetailFromApi = async (address: string, chainID: string): Promise<AccountType | undefined> => {
  try {
    const api = getApi(chainID);
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

export const getTokenDecimalsRequest = async (tokenIdentifier: string | undefined, chainID: string) => {
  const tokenIdentifierUrl = `https://${getApi(chainID)}/tokens/${tokenIdentifier}`;
  try {
    const { data } = await axios.get(tokenIdentifierUrl);
    if (tokenIdentifier !== undefined) {
      return data.decimals;
    }
  } catch (error) {
    console.log("Error finding token!");
  }
};

export const getBridgeDepositTransactions = async (address: string, chainID: string) => {
  const api = getApi(chainID);
  const bridgeHandlerContractAddress = contractsForChain(chainID).bridgeHandler;
  const itheumToken = contractsForChain(chainID).itheumToken as string;

  try {
    // const allTxs = `https://${api}/accounts/${address}/transactions?size=25&receiver=${claimsContractAddress}&function=claim&withOperations=true`;
    // const allTxs = `https://${api}/transactions?sender=erd1qmsq6ej344kpn8mc9xfngjhyla3zd6lqdm4zxx6653jee6rfq3ns3fkcc7&receiver=${bridgeHandlerContractAddress}&token=${itheumToken}&function=lock&withScResults=false&withOperations=true&withLogs=false`;
    const allTxs = `https://${api}/transactions?sender=${address}&receiver=${bridgeHandlerContractAddress}&token=${itheumToken}&function=lock&withScResults=false&withOperations=true&withLogs=false`;

    const resp = await (await axios.get(allTxs, { timeout: uxConfig.mxAPITimeoutMs })).data;

    const transactions = [];

    for (const tx of resp) {
      const transaction: any = {};
      transaction["hash"] = tx["txHash"];
      transaction["timestamp"] = parseInt(tx["timestamp"]);
      transaction["status"] = tx["status"];

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
