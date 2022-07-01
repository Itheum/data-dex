import { useEffect, useState, useRef } from "react";
import App from "./App";

import { useMoralis, useMoralisWeb3Api } from "react-moralis";

function EVMAppHarness() {
  const {
    isAuthenticated,
    logout: moralisLogout,
    user,
    Moralis: { web3Library: ethers },
  } = useMoralis();

  const { web3: web3Provider, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();

  return (
    <>
      <App config={{
        isAuthenticated,
        moralisLogout,
        user,
        ethers,
        web3Provider,
        enableWeb3,
        isWeb3Enabled,
        isWeb3EnableLoading,
        web3EnableError
      }} />
    </>
  );
}


export default EVMAppHarness;
