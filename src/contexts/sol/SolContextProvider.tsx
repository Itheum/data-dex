import React from "react";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import {
  WalletModalProvider as TipLinkWalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
  TipLinkWalletAutoConnectV2,
} from "@tiplink/wallet-adapter-react-ui";
import { useSearchParams } from "react-router-dom";
import { SolAutoConnectProvider, useSolAutoConnect } from "./SolAutoConnectProvider";
import { SolNetworkConfigurationProvider, useNetworkConfiguration } from "./SolNetworkConfigurationProvider";

const SolWalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useSolAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [searchParams, setSearchParams] = useSearchParams();

  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Itheum Explorer",
        clientId: "df83f3c6-9727-4d23-9f0b-e23785848800",
        theme: "system",
      }),
    ],
    [network]
  );

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
        <TipLinkWalletAutoConnectV2 isReady query={searchParams}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </TipLinkWalletAutoConnectV2>
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
