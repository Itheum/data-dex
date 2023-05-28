import React, { Suspense, useEffect, useState, useTransition } from "react";
import { Loader } from "@multiversx/sdk-dapp/UI";
import AppMx from "App/AppMultiversX";
import { useLocalStorage } from "libs/hooks";
import { contractsForChain } from "libs/util";
import { WALLETS } from "libs/util";
import { useChainMeta } from "store/ChainMetaContext";
import { useUser } from "store/UserContext";
import { init, Web3OnboardProvider, useConnectWallet, useWallets, useSetChain, useNotifications } from '@web3-onboard/react';

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

const baseUserContext = {
  isMxAuthenticated: false,
  isEVMAuthenticated: false,
}; // this is needed as context is updating async in this comp using _user is out of sync - @TODO improve pattern

function AppHarnessEVM({ launchEnvironment, handleLaunchMode, ethersProvider, evmWallet, connectedChain, onEVMConnectionClose, onEVMConnection }: { launchEnvironment: any; handleLaunchMode: any, ethersProvider: any, evmWallet: any, connectedChain: any, onEVMConnectionClose: any, onEVMConnection: any }) {
  const { user: _user, setUser } = useUser();
  const { setChainMeta } = useChainMeta();
  const [walletUsedSession] = useLocalStorage("itm-wallet-used", null);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => { console.log('AppHearnessEVM Loaded'); }, []);

  useEffect(() => {
    if (wallet) {
      console.log('wallet YES');
    } else {
      console.log('wallet GONE');
      onEVMConnectionClose();
    }
  }, [wallet]);

  useEffect(() => {
    if (connectedChain && evmWallet && ethersProvider) {
      const networkId = connectedChain.id; // { id : "0x51", namespace : "evm" }

      setChainMeta({
        networkId,
        contracts: contractsForChain(networkId),
        walletUsed: WALLETS.METAMASK,
        isEVMAuthenticated: true,
        loggedInAddress: evmWallet.accounts[0].address,
        ethersProvider
      });

      // setUser({
      //   ...baseUserContext,
      //   ..._user,        
      //   loggedInAddress: evmWallet.accounts[0].address,
      // });

      setIsLoading(false);
    }
  }, [connectedChain, evmWallet, ethersProvider]);

  const resetAppContexts = () => {
    setUser({ ...baseUserContext });
    setChainMeta({});
  };

  return (
    isLoading ?
      <CustomLoader />
      : <>
        <AppMx
          onLaunchMode={handleLaunchMode}
          resetAppContexts={resetAppContexts}
          appConfig={{
            mxEnvironment: launchEnvironment,
          }}
          onEVMConnection={onEVMConnection}
        />
        <div>EVM App Harness</div>
      </>
  );
}

export default AppHarnessEVM;
