import React, { useEffect } from "react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import AppMx from "App/AppMultiversX";
import { useLocalStorage } from "libs/hooks";
import { contractsForChain } from "libs/util";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";

const baseUserContext = {
  isMxAuthenticated: false,
}; // this is needed as context is updating async in this comp using _user is out of sync - @TODO improve pattern

function AppHarnessMx({ launchEnvironment, handleLaunchMode }: { launchEnvironment: any; handleLaunchMode: any }) {
  const { user: _user, setUser } = useUser();
  const { chainMeta: _chainMeta, setChainMeta } = useChainMeta();
  const { address: mxAddress } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);

  useEffect(() => {
    // console.log('********************* AppHarnessMultiversX launchEnvironment ', launchEnvironment);
    // console.log('********************* AppHarnessMultiversX _chainMeta ', _chainMeta);
    // console.log('********************* AppHarnessMultiversX _user ', _user);

    const networkId = launchEnvironment === "mainnet" ? "E1" : "ED";

    setChainMeta({
      networkId,
      contracts: contractsForChain(networkId),
      walletUsed: walletUsedSession,
    });
  }, []);

  useEffect(() => {
    if (mxAddress && isMxLoggedIn) {
      setUser({
        ...baseUserContext,
        ..._user,
        isMxAuthenticated: true,
        loggedInAddress: mxAddress,
      });
    }
  }, [mxAddress, isMxLoggedIn]);

  const resetAppContexts = () => {
    setUser({ ...baseUserContext });
    setChainMeta({});
  };

  return (
    <AppMx
      onLaunchMode={handleLaunchMode}
      resetAppContexts={resetAppContexts}
      appConfig={{
        mxEnvironment: launchEnvironment,
      }}
    />
  );
}

export default AppHarnessMx;
