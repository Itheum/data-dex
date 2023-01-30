import axios from 'axios';

import { uxConfig } from 'libs/util';

export const getApi = (networkId) => {
  if (networkId === 'E1') {
    return 'api.multiversx.com';
  } else {
    // return 'devnet-api.multiversx.com';
    return 'elrond-api-devnet.blastapi.io/0bc98858-cb7a-44c6-ad1b-8c8bfaec7128';
  }
};

export const getExplorer = (networkId) => {
  if (networkId === 'E1') {
    return 'explorer.multiversx.com';
  } else {
    return 'devnet-explorer.multiversx.com';
  }
};

export const getTransactionLink = (networkId, txHash) => {
  return `https://${getExplorer(networkId)}/transactions/${txHash}`;
};

// check token balance on Mx
export const checkBalance = async (token, address, networkId) => {
  const api = getApi(networkId);

  return new Promise((resolve, reject) => {
    axios
      .get(`https://${api}/accounts/${address}/tokens/${token}`, { timeout: uxConfig.mxAPITimeoutMs })
      .then((resp) => {
        resolve({ balance: resp.data.balance });
      })
      .catch((error) => {
        if (error) {
          console.error(error);

          if (error.response) {
            if (error.response.status === 404) {
              resolve({ balance: 0 }); // user has no ITHEUM so API return 404 it seems
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

export const getClaimTransactions = async (address, smartContractAddress, networkId) => {
  const api = getApi(networkId);

  try {
    const allTxs = `https://${api}/accounts/${address}/transactions?size=50&receiver=${smartContractAddress}&withOperations=true`;

    const resp = await (await axios.get(allTxs, { timeout: uxConfig.mxAPITimeoutMs })).data
      .filter((tx) => {
        return tx.function === 'claim';
      })
      .slice(0, 25);

    const transactions = [];

    for (const tx in resp) {
      const transaction = {};
      transaction['timestamp'] = parseInt(resp[tx]['timestamp']) * 1000;
      transaction['hash'] = resp[tx]['txHash'];
      transaction['status'] = resp[tx]['status'];

      const data = Buffer.from(resp[tx]['data'], 'base64')
        .toString('ascii')
        .split('@');

      if (data.length === 1) {
        transaction['claimType'] = 'Claim All';
      } else {
        switch (data[1]) {
          case '':
            transaction['claimType'] = 'Reward';
            break;
          case '00':
            transaction['claimType'] = 'Reward';
            break;
          case '01':
            transaction['claimType'] = 'Airdrop';
            break;
          case '02':
            transaction['claimType'] = 'Allocation';
            break;
          default:
            transaction['claimType'] = 'Unknown';
            break;
        }
      }

      let amount = 0;

      for (const op in resp[tx]['operations']) {
        if (resp[tx]['operations'][op]['value']) {
          amount += parseInt(resp[tx]['operations'][op]['value']);
        }
      }

      transaction['amount'] = amount;
      transactions.push(transaction);
    }

    return transactions;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const getNftsOfACollectionForAnAddress = async (address, collectionTicker, networkId) => {
  const api = getApi(networkId);
  try {
    const nftsLink = `https://${api}/accounts/${address}/nfts?size=10000&collections=${collectionTicker}&withSupply=true`;

    const resp = await (await axios.get(nftsLink, { timeout: uxConfig.mxAPITimeoutMs })).data;
    return resp;
  } catch (error) {
    console.error(error);
    return { error };
  }
};
