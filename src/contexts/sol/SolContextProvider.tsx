import React from "react";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolAutoConnectProvider, useSolAutoConnect } from "./SolAutoConnectProvider";
import { SolNetworkConfigurationProvider, useNetworkConfiguration } from "./SolNetworkConfigurationProvider";

const SolWalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useSolAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  //https://solana-devnet.g.alchemy.com/v2/LStEUr2EpeqQbQW4gWLRkr2fmPn6GUsS"https://devnet.helius-rpc.com/?api-key=6c3cfaec-f256-4c06-83de-9ccd9bcb3c3e", [network]);
  const wallets = useMemo(() => [], [network]);

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const SolContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <SolNetworkConfigurationProvider>
        <SolAutoConnectProvider>
          <SolWalletContextProvider>{children}</SolWalletContextProvider>
        </SolAutoConnectProvider>
      </SolNetworkConfigurationProvider>
    </>
  );
};
