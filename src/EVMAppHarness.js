import { useEffect, useState, useRef } from "react";
import App from "./App";

import { useMoralis, useMoralisWeb3Api } from "react-moralis";

function EVMAppHarness({resetLaunchMode}) {
  const {
    isAuthenticated,
    logout: moralisLogout,
    user,
    Moralis: { web3Library: ethers },
  } = useMoralis();

  const { web3: web3Provider, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError } = useMoralis();

  const handleMoralisLogout = () => {
    resetLaunchMode();
    moralisLogout();
  }

  return (
    <>
      {(isAuthenticated && user) && <App config={{
        isAuthenticated,
        moralisLogout,
        onMoralisLogout: handleMoralisLogout,
        user,
        ethers,
        web3Provider,
        enableWeb3,
        isWeb3Enabled,
        isWeb3EnableLoading,
        web3EnableError
      }} /> || <div>NO EVM Session Yet</div>}
    </>
  );
}


export default EVMAppHarness;
