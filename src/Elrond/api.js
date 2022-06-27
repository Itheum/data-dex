import axios from "axios";

export const ITHEUM_TOKEN_ID = "ITHEUM-df6f26";
export const d_ITHEUM_TOKEN_ID = "ITHEUM-a61317";

// check token balance on Elrond
export const checkBalance = async (token, address, chain) => {
  let api;

  if (chain === "Elrond - Mainnet") {
    api = "api.elrond.com";
  } else {
    api = "devnet-api.elrond.com";
  }

  try {
    const resp = await axios.get(`https://${api}/accounts/${address}/tokens/${token}`);
    return resp.data.balance;
  } catch (error) {
    return 0;
  }
};
