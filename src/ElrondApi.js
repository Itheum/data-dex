import axios from "axios";

export const ITHEUM_TOKEN_ID = "ITHEUM-df6f26";
export const d_ITHEUM_TOKEN_ID = "ITHEUM-a61317";

//check token balance on Elrond
export const checkBalance = async (token, address, chain) => {
  console.log(chain);
  let api;
  if (chain === "Elrond - Mainnet") {
    api = "api.elrond.com";
  } else {
    api = "devnet-api.elrond.com";
  }
  const resp = await axios.get(`https://${api}/accounts/${address}/tokens/${token}`);
  if (resp.status === 200) {
    return resp.data.balance;
  } else {
    return 0;
  }
};
