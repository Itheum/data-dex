import axios from 'axios';

export const ITHEUM_TOKEN_ID = 'ITHEUM-df6f26';
export const d_ITHEUM_TOKEN_ID = 'ITHEUM-a61317';

export const getApi = (chain) => {
  if (chain === 'Elrond - Mainnet') {
    return 'api.elrond.com';
  } else {
    return 'devnet-api.elrond.com';
  }
}

export const getExplorer = (chain) => {
  if (chain === 'Elrond - Mainnet') {
    return 'explorer.elrond.com';
  } else {
    return 'devnet-explorer.elrond.com';
  }
}

export const getTransactionLink = (chain, txHash) => {
  return `https://${getExplorer(chain)}/transactions/${txHash}`;
}

// check token balance on Elrond
export const checkBalance = async (token, address, chain) => {
  const api = getApi(chain);

  try {
    const resp = await axios.get(`https://${api}/accounts/${address}/tokens/${token}`);
    return resp.data.balance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getClaimTransactions = async (address, smartContractAddress, chain) => {
  const api = getApi(chain);

  try {
    const allTxs = `https://${api}/accounts/${address}/transactions?size=50&receiver=${smartContractAddress}&withOperations=true`;
    console.log(allTxs);

    const resp = await (await axios.get(allTxs)).data.filter(tx => {
      return tx.function === 'claim';
    }).slice(0, 25);

    const transactions = [];

    for (const tx in resp) {
      const transaction = {};
      transaction['timestamp'] = parseInt(resp[tx]['timestamp']) * 1000;
      transaction['hash'] = resp[tx]['txHash'];
      transaction['status'] = resp[tx]['status'];

      const data = Buffer.from(resp[tx]['data'], 'base64').toString('ascii').split('@');

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
    return [];
  }
}
