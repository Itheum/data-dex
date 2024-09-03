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
  const [networkConfiguration, setNetworkConfiguration] = useLocalStorage(
    "network",
    process.env.VITE_ENV_NETWORK === "mainnet" ? "mainnet-beta" : process.env.VITE_ENV_NETWORK
  );

  return (
    <NetworkConfigurationContext.Provider value={{ networkConfiguration: networkConfiguration ?? "devnet", setNetworkConfiguration }}>
      {children}
    </NetworkConfigurationContext.Provider>
  );
};
