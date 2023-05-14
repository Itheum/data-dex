import React, { useEffect, useState } from "react";
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks/account";
import { Loader } from "@multiversx/sdk-dapp/UI";
import { useLocalStorage } from "libs/hooks";
import { contractsForChain } from "libs/MultiversX";
import { useChainMeta } from "store/ChainMetaContext";
import { StoreProvider } from "store/StoreProvider";
import AppMx from "./AppMultiversX";

function CustomLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Loader />
    </div>
  );
}

function AppHarnessMx({ launchEnvironment, handleLaunchMode }: { launchEnvironment: any; handleLaunchMode: any }) {
  const { setChainMeta } = useChainMeta();
  const { address: mxAddress } = useGetAccountInfo();
  const { isLoggedIn: isMxLoggedIn } = useGetLoginInfo();
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

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

    setIsLoading(false);
  }, []);

  const resetAppContexts = () => {
    // setUser({ ...baseUserContext });
    // setChainMeta({});
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <StoreProvider>
      <AppMx
        onLaunchMode={handleLaunchMode}
        resetAppContexts={resetAppContexts}
        appConfig={{
          mxEnvironment: launchEnvironment,
        }}
      />
    </StoreProvider>
  );
}

export default AppHarnessMx;
