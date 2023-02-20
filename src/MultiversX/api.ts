import { NftType, TokenType } from "@multiversx/sdk-dapp/types/tokens.types";
import axios from "axios";

import { uxConfig } from "libs/util";

export const getApi = (networkId: string) => {
  if (networkId === "E1") {
    return "api.multiversx.com";
  } else {
    // return 'devnet-api.multiversx.com';
    return "elrond-api-devnet.blastapi.io/0bc98858-cb7a-44c6-ad1b-8c8bfaec7128";
  }
};

export const getExplorer = (networkId: string) => {
  if (networkId === "E1") {
    return "explorer.multiversx.com";
  } else {
    return "devnet-explorer.multiversx.com";
  }
};

export const getTransactionLink = (networkId: string, txHash: string) => {
  return `https://${getExplorer(networkId)}/transactions/${txHash}`;
};

// check token balance on Mx
export const checkBalance = async (token: string, address: string, networkId: string) => {
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
              resolve({ error });
            }
          } else {
            resolve({ error });
          }
        }
      });
  });
};

export const getClaimTransactions = async (address: string, smartContractAddress: string, networkId: string) => {
  const api = getApi(networkId);

  try {
    const allTxs = `https://${api}/accounts/${address}/transactions?size=50&receiver=${smartContractAddress}&withOperations=true`;

    const resp = await (
      await axios.get(allTxs, { timeout: uxConfig.mxAPITimeoutMs })
    ).data
      .filter((tx: any) => {
        return tx.function === "claim";
      })
      .slice(0, 25);

    const transactions = [];

    for (const tx of resp) {
      const transaction: any = {};
      transaction["timestamp"] = parseInt(tx["timestamp"]) * 1000;
      transaction["hash"] = tx["txHash"];
      transaction["status"] = tx["status"];

      const data = Buffer.from(resp[tx]["data"], "base64").toString("ascii").split("@");

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
          default:
            transaction["claimType"] = "Unknown";
            break;
        }
      }

      let amount = 0;

      for (const op in resp[tx]["operations"]) {
        if (resp[tx]["operations"][op]["value"]) {
          amount += parseInt(resp[tx]["operations"][op]["value"]);
        }
      }

      transaction["amount"] = amount;
      transactions.push(transaction);
    }

    return transactions;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const getNftsOfACollectionForAnAddress = async (address: string, collectionTicker: string, networkId: string): Promise<NftType[]> => {
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

export const getNftsByIds = async (nftIds: string[], networkId: string): Promise<NftType[]> => {
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

export const getAccountTokenFromApi = async (address: string, tokenId: string, networkId: string): Promise<TokenType | undefined> => {
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
