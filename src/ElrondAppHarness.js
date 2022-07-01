import { useEffect, useState, useRef } from "react";
import { DappProvider, DappUI } from "@elrondnetwork/dapp-core";
import App from "./App";

import { logout, useGetAccountInfo, refreshAccount, sendTransactions, useGetPendingTransactions } from "@elrondnetwork/dapp-core";
import { checkBalance, ITHEUM_TOKEN_ID, d_ITHEUM_TOKEN_ID } from "./Elrond/api";
import { ClaimsContract } from "./Elrond/claims";

const elrondLogout = logout;

function ElrondAppHarness() {
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();

  return (
    <>
      <App config={{
        elrondAddress,
        hasPendingTransactions,
        elrondLogout,
        ClaimsContract,
        checkBalance,
        ITHEUM_TOKEN_ID,
        d_ITHEUM_TOKEN_ID
      }} />
    </>
  );
}


export default ElrondAppHarness;
