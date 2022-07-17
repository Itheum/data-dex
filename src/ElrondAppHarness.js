import { useEffect, useState, useRef } from "react";
import { DappProvider, DappUI } from "@elrondnetwork/dapp-core";
import App from "./App";

import { logout, useGetAccountInfo, refreshAccount, sendTransactions, useGetPendingTransactions } from "@elrondnetwork/dapp-core";
import { checkBalance, ITHEUM_TOKEN_ID, d_ITHEUM_TOKEN_ID } from "./Elrond/api";
import { ClaimsContract } from "./Elrond/claims";

const elrondLogout = logout;

function ElrondAppHarness({resetLaunchMode}) {
  const { address: elrondAddress } = useGetAccountInfo();
  const { hasPendingTransactions } = useGetPendingTransactions();

  useEffect(() => {
    if (elrondAddress) {
      // setWalletUsed(WALLETS.ELROND);
    }
  }, [elrondAddress]);

  const handleElrondLogout = () => {
    resetLaunchMode();
    elrondLogout();
  }

  return (
    <>
      {elrondAddress && <App config={{
        elrondAddress,
        hasPendingTransactions,
        onElrondLogout: handleElrondLogout,
        ClaimsContract,
        checkBalance,
        ITHEUM_TOKEN_ID,
        d_ITHEUM_TOKEN_ID
      }} /> || <div>NO Elrond Session Yet</div>}
    </>
  );
}


export default ElrondAppHarness;
