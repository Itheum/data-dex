
import { ContractsType, NetworkIdType } from "libs/types";
import {
  // tokenContractAddress_Matic,
  // ddexContractAddress_Matic,
  // dNFTContractAddress_Matic,
  // tokenContractAddress_Goerli,
  // ddexContractAddress_Goerli,
  // dNFTContractAddress_Goerli,
  // claimsContractAddress_Goerli,
  // tokenContractAddress_testnetBSC,
  // ddexContractAddress_testnetBSC,
  // dNFTContractAddress_testnetBSC,
  // tokenContractAddress_testnetHarmony,
  // ddexContractAddress_testnetHarmony,
  // dNFTContractAddress_testnetHarmony,
  // tokenContractAddress_testnetAvalanche,
  // ddexContractAddress_testnetAvalanche,
  // dNFTContractAddress_testnetAvalanche,
  // tokenContractAddress_Local,
  // ddexContractAddress_Local,
  // dNFTContractAddress_Local,
  // claimsContractAddress_Matic,
  // claimsContractAddress_testnetBSC,
  tokenContractAddress_Mx_Devnet,
  dataNFTFTTicker_Mx_Devnet,
  claimsContractAddress_Mx_Devnet,
  faucetContractAddress_Mx_Devnet,
  dataNftMintContractAddress_Mx_Devnet,
  dataNftMarketContractAddress_Mx_Devnet,
  tokenContractAddress_Mx_Mainnet,
  claimsContractAddress_Mx_Mainnet,
  faucetContractAddress_Mx_Mainnet,
} from "../contractAddresses";

export function contractsForChain(networkId: NetworkIdType): ContractsType {
  switch (networkId) {
    case "ED": {
      return {
        itheumToken : tokenContractAddress_Mx_Devnet,
        dataNFTFTTicker : dataNFTFTTicker_Mx_Devnet,
        claims : claimsContractAddress_Mx_Devnet,
        faucet : faucetContractAddress_Mx_Devnet,
        dataNftMint : dataNftMintContractAddress_Mx_Devnet,
        market : dataNftMarketContractAddress_Mx_Devnet,
      };
    }
    case "E1": {
      return {
        itheumToken : tokenContractAddress_Mx_Mainnet,
        claims : claimsContractAddress_Mx_Mainnet,
        faucet : faucetContractAddress_Mx_Mainnet,
      };
    }
  }

  throw Error("Undefined Network ID");
};