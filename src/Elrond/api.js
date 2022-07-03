import axios from "axios";

export const ITHEUM_TOKEN_ID = "ITHEUM-df6f26";
export const d_ITHEUM_TOKEN_ID = "ITHEUM-a61317";

export const getApi = (chain) => {
  if (chain === "Elrond - Mainnet") {
    return "api.elrond.com";
  } else {
    return "devnet-api.elrond.com";
  }
}

// check token balance on Elrond
export const checkBalance = async (token, address, chain) => {
  let api = getApi(chain);
  try {
    const resp = await axios.get(`https://${api}/accounts/${address}/tokens/${token}`);
    return resp.data.balance;
  } catch (error) {
    return 0;
  }
};

export const getClaimTransactions = async (address, smartContractAddress, chain) => {
  let api = getApi(chain);
  try{
    const link = `https://${api}/accounts/${address}/transactions?size=30&receiver=${smartContractAddress}&status=success&withOperations=true`;
    const resp = await (await axios.get(link)).data.filter(tx => {
      return tx.function === "claim";}).slice(0, 15);
    let transactions=[]
    for (const tx in resp){
      let transaction={}
      transaction["timestamp"]=resp[tx]["timestamp"];
      transaction["hash"]=resp[tx]["txHash"];
      let data = Buffer.from(resp[tx]["data"],'base64').toString('ascii').split('@');
      if(data.length === 1){
        transaction["claimType"]="Claim All"
      }else{
        switch(data[1]){
          case "00":
            transaction["claimType"]="Reward";
            break;
          case "01":
            transaction["claimType"]="Airdrop";
            break;
          default:
            transaction["claimType"]="Allocation";
            break;
        }
      }
      let amount = 0
      for (const op in resp[tx]["operations"]){
        if(resp[tx]["operations"][op]["value"]){
          amount += parseInt(resp[tx]["operations"][op]["value"]);
        }
      }
      transaction["amount"]=amount;
      transactions.push(transaction);
    }
    console.log(transactions);
    return transactions;
  }catch(error){
    return [];
  }
}
