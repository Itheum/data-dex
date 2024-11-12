import React, { createContext, FC, ReactNode, useContext } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";

export interface NetworkConfigurationState {
  networkConfiguration: string;
  setNetworkConfiguration(networkConfiguration: string): void;
}

export const NetworkConfigurationContext = createContext<NetworkConfigurationState>({} as NetworkConfigurationState);

export function useNetworkConfiguration(): NetworkConfigurationState {
  return useContext(NetworkConfigurationContext);
}

export const SolNetworkConfigurationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const currentNetworkConfig = import.meta.env.VITE_ENV_NETWORK === "mainnet" ? "mainnet-beta" : import.meta.env.VITE_ENV_NETWORK;
  const [networkConfiguration, setNetworkConfiguration] = useLocalStorage("network", currentNetworkConfig);

  return (
    <NetworkConfigurationContext.Provider value={{ networkConfiguration: networkConfiguration ?? currentNetworkConfig, setNetworkConfiguration }}>
      {children}
    </NetworkConfigurationContext.Provider>
  );
};
